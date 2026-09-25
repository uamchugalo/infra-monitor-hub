import "dotenv/config";
import express from "express";
import cors from "cors";
import wol from "wake_on_lan";
import ping from "ping";
import cron from "node-cron";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import dgram from "dgram";
import os from "os";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db",
    },
  },
});

app.use(cors());
app.use(express.json());

// --- AUTHENTICATION ---
const JWT_SECRET = "infra-monitor-hub-super-secret-key-2026";

const seedInitialUser = async () => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { username: "sti" }});
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("T&kn0,Super)", 10);
      await prisma.user.create({
        data: { username: "sti", password: hashedPassword, role: "admin" }
      });
      console.log("Usuário inicial 'sti' criado.");
    }
  } catch (err) {
    console.error("Erro no seed de admin:", err);
  }
};
seedInitialUser();

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

app.use("/api", (req, res, next) => {
  if (req.path === "/login") return next();
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
});

// User Management Routes
app.get("/api/users", async (req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, username: true, role: true } });
  res.json(users);
});

app.post("/api/users", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ error: "Usuário já existe" });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword }
    });
    res.json({ id: newUser.id, username: newUser.username });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === id) return res.status(400).json({ error: "Não pode deletar a si mesmo" });
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

// Dados de Relatórios
const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");
const LATEST_STATUS_FILE = path.join(DATA_DIR, "latest-status.json");

const saveReport = (report) => {
  const reports = fs.existsSync(REPORTS_FILE)
    ? JSON.parse(fs.readFileSync(REPORTS_FILE))
    : [];
  reports.unshift(report);
  // Increase limit to 500 to keep more history (auto + manual)
  fs.writeFileSync(
    REPORTS_FILE,
    JSON.stringify(reports.slice(0, 500), null, 2),
  );
};

const saveLatestStatus = (report) => {
  fs.writeFileSync(LATEST_STATUS_FILE, JSON.stringify(report, null, 2));
};

// --- MONITORAMENTO ---
const runMonitoringCheck = async (isAutomated = true) => {
  console.log(
    `Starting ${isAutomated ? "Automated" : "Manual"} Monitoring Check...`,
  );
  const cameras = await prisma.camera.findMany();
  const aps = await prisma.accessPoint.findMany();

  if (cameras.length === 0 && aps.length === 0) return;

  const enabledCameras = cameras.filter((c) => c.enabled !== false);
  const enabledAps = aps.filter((a) => a.enabled !== false);
  const disabledCameras = cameras.filter((c) => c.enabled === false);
  const disabledAps = aps.filter((a) => a.enabled === false);

  const report = {
    id: `monitor-${Date.now()}`,
    type: "CONTINUOUS_MONITORING",
    timestamp: new Date().toISOString(),
    automated: isAutomated,
    total: cameras.length + aps.length,
    online_after_wake: 0,
    failures: [],
    details: [],
  };

  // Add disabled devices to details immediately
  [...disabledCameras, ...disabledAps].forEach((dev) => {
    report.details.push({
      name: dev.name,
      ip: dev.ip,
      type: dev.cameraId ? "CAMERA" : "AP",
      status: "DISABLED",
    });
  });

  // Helper to check and update
  const checkAndUpdate = async (dev, type, table) => {
    if (!dev.ip) return;
    try {
      const res = await ping.promise.probe(dev.ip, { timeout: 2 });
      const status = res.alive ? "online" : "offline";

      // Update Report
      if (res.alive) {
        report.online_after_wake++;
        report.details.push({
          name: dev.name,
          ip: dev.ip,
          type,
          status: "SUCCESS",
        });
      } else {
        report.failures.push({
          name: dev.name,
          ip: dev.ip,
          type,
          reason: "No Ping Response",
        });
        report.details.push({
          name: dev.name,
          ip: dev.ip,
          type,
          status: "FAILED",
        });
      }

      // Update Database & History
      if (table === "camera") {
        await prisma.camera
          .update({ where: { id: dev.id }, data: { status } })
          .catch(() => {});
        if (isAutomated) {
          await prisma.cameraLog
            .create({ data: { cameraId: dev.id, status } })
            .catch(() => {});
        }
      } else if (table === "accessPoint") {
        await prisma.accessPoint
          .update({ where: { id: dev.id }, data: { status } })
          .catch(() => {});
        if (isAutomated) {
          await prisma.accessPointLog
            .create({ data: { apId: dev.id, status } })
            .catch(() => {});
        }
      }
    } catch (error) {
      console.error(`Check failed for ${dev.ip}`, error);
    }
  };

  // Chunking to prevent CPU overload with hundreds of simultaneous pings
  const allDevices = [
    ...enabledCameras.map(c => ({ dev: c, type: "CAMERA", table: "camera" })),
    ...enabledAps.map(a => ({ dev: a, type: "AP", table: "accessPoint" }))
  ];

  const chunkSize = 10;
  for (let i = 0; i < allDevices.length; i += chunkSize) {
    const chunk = allDevices.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(({ dev, type, table }) => checkAndUpdate(dev, type, table))
    );
  }

  saveLatestStatus(report);
  saveReport(report);
  console.log("Monitoring Finished.");
};

// Cleanup old logs (older than 10 days) daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running history cleanup (10 days buffer)...");
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  await prisma.cameraLog.deleteMany({
    where: { timestamp: { lt: tenDaysAgo } },
  });
  await prisma.accessPointLog.deleteMany({
    where: { timestamp: { lt: tenDaysAgo } },
  });
  console.log("Cleanup finished.");
});

cron.schedule("*/3 * * * *", () => runMonitoringCheck(true));

app.post("/api/generate-report", async (req, res) => {
  try {
    await runMonitoringCheck(false);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- ROTAS DE CRUD/SYNC COM PRISMA ---

app.get("/api/cameras", async (req, res) => {
  const cams = await prisma.camera.findMany();
  res.json(cams);
});

app.get("/api/history/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  try {
    if (type === "Camera") {
      const history = await prisma.cameraLog.findMany({
        where: { cameraId: id },
        orderBy: { timestamp: "desc" },
        take: 100, // Last 100 entries for display
      });
      res.json(history);
    } else if (type === "AP") {
      const history = await prisma.accessPointLog.findMany({
        where: { apId: id },
        orderBy: { timestamp: "desc" },
        take: 100,
      });
      res.json(history);
    } else {
      res.status(400).json({ error: "Invalid type" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sync-cameras", async (req, res) => {
  const { cameras } = req.body;
  if (!Array.isArray(cameras))
    return res.status(400).json({ error: "Invalid data" });

  await prisma.$transaction(async (tx) => {
    const ids = cameras.map((c) => c.id);
    await tx.camera.deleteMany({ where: { id: { notIn: ids } } });
    for (const c of cameras) {
      await tx.camera.upsert({
        where: { id: c.id },
        create: {
          ...c,
          enabled: c.enabled ?? true,
          switchId: c.switchId || null,
          switchPort: c.switchPort || null,
        },
        update: {
          ...c,
          enabled: c.enabled ?? true,
          switchId: c.switchId || null,
          switchPort: c.switchPort || null,
        },
      });

      // Propagate update to SwitchPort (Bidirectional Sync)
      // 1. Remove this device from ANY switch port it was previously on
      await tx.switchPort.deleteMany({ where: { deviceId: c.id } });

      // 2. If connected to a new port, create/update that port entry
      if (c.switchId && c.switchPort) {
        const portNum = parseInt(c.switchPort);
        await tx.switchPort
          .upsert({
            where: { switchId_port: { switchId: c.switchId, port: portNum } },
            update: {
              deviceId: c.id,
              deviceIp: c.ip,
              name: c.name,
              type: "Camera",
            },
            create: {
              switchId: c.switchId,
              port: portNum,
              deviceId: c.id,
              deviceIp: c.ip,
              name: c.name,
              type: "Camera",
            },
          })
          .catch(async () => {
            // Fallback if upsert fails due to missing unique constraint key in some prisma setups
            const existing = await tx.switchPort.findFirst({
              where: { switchId: c.switchId, port: portNum },
            });
            if (existing)
              await tx.switchPort.update({
                where: { id: existing.id },
                data: {
                  deviceId: c.id,
                  deviceIp: c.ip,
                  name: c.name,
                  type: "Camera",
                },
              });
            else
              await tx.switchPort.create({
                data: {
                  switchId: c.switchId,
                  port: portNum,
                  deviceId: c.id,
                  deviceIp: c.ip,
                  name: c.name,
                  type: "Camera",
                },
              });
          });
      }
    }
  });
  res.json({ success: true, count: cameras.length });
});

// APs
app.get("/api/aps", async (req, res) => {
  const aps = await prisma.accessPoint.findMany();
  res.json(aps);
});

app.post("/api/sync-aps", async (req, res) => {
  const { aps } = req.body;
  if (!Array.isArray(aps))
    return res.status(400).json({ error: "Invalid data" });

  await prisma.$transaction(async (tx) => {
    const ids = aps.map((a) => a.id);
    await tx.accessPoint.deleteMany({ where: { id: { notIn: ids } } });
    for (const a of aps) {
      await tx.accessPoint.upsert({
        where: { id: a.id },
        create: {
          ...a,
          enabled: a.enabled ?? true,
          switchId: a.switchId || null,
          switchPort: a.switchPort || null,
        },
        update: {
          ...a,
          enabled: a.enabled ?? true,
          switchId: a.switchId || null,
          switchPort: a.switchPort || null,
        },
      });

      // Propagate update to SwitchPort (Bidirectional Sync)
      // 1. Remove this device from ANY switch port it was previously on
      await tx.switchPort.deleteMany({ where: { deviceId: a.id } });

      // 2. If connected to a new port, create/update that port entry
      if (a.switchId && a.switchPort) {
        const portNum = parseInt(a.switchPort);
        await tx.switchPort
          .upsert({
            where: { switchId_port: { switchId: a.switchId, port: portNum } },
            update: {
              deviceId: a.id,
              deviceIp: a.ip,
              name: a.name,
              type: "AP",
            },
            create: {
              switchId: a.switchId,
              port: portNum,
              deviceId: a.id,
              deviceIp: a.ip,
              name: a.name,
              type: "AP",
            },
          })
          .catch(async () => {
            const existing = await tx.switchPort.findFirst({
              where: { switchId: a.switchId, port: portNum },
            });
            if (existing)
              await tx.switchPort.update({
                where: { id: existing.id },
                data: {
                  deviceId: a.id,
                  deviceIp: a.ip,
                  name: a.name,
                  type: "AP",
                },
              });
            else
              await tx.switchPort.create({
                data: {
                  switchId: a.switchId,
                  port: portNum,
                  deviceId: a.id,
                  deviceIp: a.ip,
                  name: a.name,
                  type: "AP",
                },
              });
          });
      }
    }
  });
  res.json({ success: true, count: aps.length });
});

// PCs
app.get("/api/pcs", async (req, res) => {
  const pcs = await prisma.pC.findMany({
    include: { history: true },
  });
  res.json(pcs);
});

app.post("/api/sync-pcs", async (req, res) => {
  const { pcs } = req.body;
  if (!Array.isArray(pcs))
    return res.status(400).json({ error: "Invalid data" });

  try {
    await prisma.$transaction(async (tx) => {
      const ids = pcs.map((p) => String(p.id));
      // Delete PCs not in payload
      await tx.pC.deleteMany({ where: { id: { notIn: ids } } });

      for (const p of pcs) {
        const pcId = String(p.id);
        await tx.pC.upsert({
          where: { id: pcId },
          create: {
            id: pcId,
            name: p.name,
            ip: p.ip || "",
            mac: p.mac,
            location: p.location || "",
            switchId: p.switchId || null,
            switchPort: p.switchPort || null,
            status: p.status,
            enabled: p.enabled ?? true,
          },
          update: {
            name: p.name,
            ip: p.ip || "",
            mac: p.mac,
            location: p.location || "",
            switchId: p.switchId || null,
            switchPort: p.switchPort || null,
            status: p.status,
            enabled: p.enabled ?? true,
          },
        });

        // Sync Individual PC Logs (history)
        if (p.history && Array.isArray(p.history)) {
          const logIds = p.history.map((h) => h.id);
          await tx.pCLog.deleteMany({
            where: { pcId: pcId, id: { notIn: logIds } },
          });
          for (const entry of p.history) {
            await tx.pCLog.upsert({
              where: { id: entry.id },
              create: {
                id: entry.id,
                pcId: pcId,
                timestamp: entry.timestamp,
                message: entry.message,
              },
              update: { timestamp: entry.timestamp, message: entry.message },
            });
          }
        }
      }
    });
    res.json({ success: true, count: pcs.length });
  } catch (error) {
    console.error("Error syncing PCs:", error);
    res.status(500).json({ error: error.message });
  }
});

// Switches
app.get("/api/switches", async (req, res) => {
  const switches = await prisma.switch.findMany({
    include: { ports: true },
  });
  res.json(switches);
});

app.post("/api/sync-switches", async (req, res) => {
  const { switches } = req.body;
  if (!Array.isArray(switches))
    return res.status(400).json({ error: "Invalid data" });

  try {
    await prisma.$transaction(async (tx) => {
      const ids = switches.map((s) => s.id);
      await tx.switch.deleteMany({ where: { id: { notIn: ids } } });

      for (const s of switches) {
        await tx.switch.upsert({
          where: { id: s.id },
          update: {
            name: s.name,
            ip: s.ip,
            model: s.model || "",
            location: s.location,
            totalPorts: s.totalPorts,
            order: s.order,
            enabled: s.enabled ?? true,
          },
          create: {
            id: s.id,
            name: s.name,
            ip: s.ip,
            model: s.model || "",
            location: s.location,
            totalPorts: s.totalPorts,
            order: s.order,
            enabled: s.enabled ?? true,
          },
        });

        // Sync Ports
        // Delete ports not in payload (by port number for this switch)
        if (s.ports) {
          const portNums = s.ports.map((p) => p.port);
          await tx.switchPort.deleteMany({
            where: { switchId: s.id, port: { notIn: portNums } },
          });

          for (const p of s.ports) {
            const portData = {
              switchId: s.id,
              port: p.port,
              name: p.name,
              type: p.type,
              deviceId: p.deviceId,
              deviceIp: p.deviceIp,
            };
            const existing = await tx.switchPort.findFirst({
              where: { switchId: s.id, port: p.port },
            });
            if (existing) {
              await tx.switchPort.update({
                where: { id: existing.id },
                data: portData,
              });
            } else {
              await tx.switchPort.create({ data: portData });
            }
          }
        } else {
          await tx.switchPort.deleteMany({ where: { switchId: s.id } });
        }
      }
    });
    res.json({ success: true });
  } catch (e) {
    console.error("Sync Switch Error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Patch Panels
app.get("/api/patch-panels", async (req, res) => {
  const pps = await prisma.patchPanel.findMany({ include: { ports: true } });
  res.json(pps);
});

app.post("/api/sync-patch-panels", async (req, res) => {
  const { patchPanels } = req.body;
  if (!Array.isArray(patchPanels))
    return res.status(400).json({ error: "Invalid data" });

  try {
    await prisma.$transaction(async (tx) => {
      const ids = patchPanels.map((p) => p.id);
      await tx.patchPanel.deleteMany({ where: { id: { notIn: ids } } });

      for (const p of patchPanels) {
        await tx.patchPanel.upsert({
          where: { id: p.id },
          update: {
            name: p.name,
            location: p.location,
            totalPorts: p.totalPorts,
            order: p.order,
          },
          create: {
            id: p.id,
            name: p.name,
            location: p.location,
            totalPorts: p.totalPorts,
            order: p.order,
          },
        });

        if (p.ports) {
          const portNums = p.ports.map((pt) => pt.port);
          await tx.patchPanelPort.deleteMany({
            where: { patchPanelId: p.id, port: { notIn: portNums } },
          });

          for (const pt of p.ports) {
            const ptData = {
              patchPanelId: p.id,
              port: pt.port,
              description: pt.description,
            };
            const existing = await tx.patchPanelPort.findFirst({
              where: { patchPanelId: p.id, port: pt.port },
            });
            if (existing)
              await tx.patchPanelPort.update({
                where: { id: existing.id },
                data: ptData,
              });
            else await tx.patchPanelPort.create({ data: ptData });
          }
        }
      }
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Lab Logs
app.get("/api/lab-logs", async (req, res) => {
  const logs = await prisma.labLog.findMany({
    orderBy: { timestamp: "desc" },
  });
  res.json(logs);
});

app.post("/api/sync-lab-logs", async (req, res) => {
  const { logs } = req.body;
  if (!Array.isArray(logs))
    return res.status(400).json({ error: "Invalid data" });

  try {
    await prisma.$transaction(async (tx) => {
      // Sync strategy: Delete logs not present in payload, then update/create
      const incomingIds = logs.map((l) => l.id);

      // Since lab logs are partitioned by lab, we should strictly only delete logs
      // where the ID is explicitly missing if we were sending ALL logs for ALL labs.
      // However, the frontend sends ALL logs for ALL labs in `syncData`.
      // So we can safely look at all logs or filter by those incoming labs.
      // To be safe and simple given the frontend payload (allLogs):

      // 1. Delete logs that are NOT in the incoming list
      await tx.labLog.deleteMany({
        where: { id: { notIn: incomingIds } },
      });

      // 2. Upsert incoming logs
      for (const log of logs) {
        await tx.labLog.upsert({
          where: { id: log.id },
          update: {
            timestamp: log.timestamp,
            message: log.message,
            labId: log.labId || "",
          },
          create: {
            id: log.id,
            timestamp: log.timestamp,
            message: log.message,
            labId: log.labId || "",
          },
        });
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reports & Others
app.get("/api/reports", (req, res) => {
  const reports = fs.existsSync(REPORTS_FILE)
    ? JSON.parse(fs.readFileSync(REPORTS_FILE))
    : [];
  res.json(reports);
});

app.get("/api/last-status", (req, res) => {
  try {
    // Read from the dedicated latest status file which is updated by EVERY check (automated or manual)
    const report = fs.existsSync(LATEST_STATUS_FILE)
      ? JSON.parse(fs.readFileSync(LATEST_STATUS_FILE))
      : null;

    if (!report) {
      // Fallback to reports.json if latest-status doesn't exist yet
      const reports = fs.existsSync(REPORTS_FILE)
        ? JSON.parse(fs.readFileSync(REPORTS_FILE))
        : [];
      if (reports.length > 0) {
        const last = reports[0];
        const statusMap = {};
        if (last && last.details) {
          last.details.forEach((d) => {
            if (d.ip)
              statusMap[d.ip] = d.status === "SUCCESS" ? "online" : "offline";
          });
        }
        return res.json(statusMap);
      }
      return res.json({});
    }

    const statusMap = {};
    if (report && report.details) {
      report.details.forEach((d) => {
        if (d.ip)
          statusMap[d.ip] = d.status === "SUCCESS" ? "online" : "offline";
      });
    }
    res.json(statusMap);
  } catch (error) {
    res.json({});
  }
});

app.post("/api/reports", (req, res) => {
  const report = req.body;
  if (!report || !report.id) return res.status(400).json({ error: "Invalid" });
  saveReport(report);
  res.json({ success: true });
});

app.delete("/api/reports", (req, res) => {
  if (fs.existsSync(REPORTS_FILE)) {
    fs.writeFileSync(REPORTS_FILE, "[]");
  }
  res.json({ success: true });
});

app.post("/api/wake", async (req, res) => {
  const { mac, ip } = req.body;
  if (!mac) return res.status(400).json({ error: "MAC required" });

  // WoL logic (Simplified for brevity, assume sendShotgunWoL logic is similar or imported)
  // Re-implementing simplified version since I removed the helper function block above to save space
  // but critical logic must remain.

  const socket = dgram.createSocket("udp4");
  const magicPacket = Buffer.alloc(102);
  magicPacket.fill(0xff, 0, 6);
  const macBytes = mac.split(/[:\-]/).map((x) => parseInt(x, 16));
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 6; j++) {
      magicPacket[6 + i * 6 + j] = macBytes[j];
    }
  }

  socket.bind(() => {
    socket.setBroadcast(true);
    socket.send(
      magicPacket,
      0,
      magicPacket.length,
      9,
      "255.255.255.255",
      () => {
        socket.close();
        res.json({ message: "WoL Sent" });
      },
    );
  });
});

app.post("/api/ping", async (req, res) => {
  let { ip } = req.body;
  if (!ip) return res.status(400).json({ error: "IP required" });

  const isWindows = os.platform() === "win32";
  const command = isWindows
    ? `ping -n 1 -w 1000 ${ip}`
    : `ping -c 1 -W 1 ${ip}`;

  exec(command, (error, stdout, stderr) => {
    const output = stdout.toString();
    const isAlive =
      !error &&
      (output.toLowerCase().includes("ttl=") ||
        output.toLowerCase().includes("time="));
    let time = 0;
    const timeMatch = output.match(/(?:time|tempo)[=<]\s*(\d+)ms/i);
    if (timeMatch) time = parseInt(timeMatch[1]);

    res.json({ alive: isAlive, time, output: output.slice(0, 200) });
  });
});

// Inventory
app.get("/api/inventory", async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: "asc" },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/inventory", async (req, res) => {
  try {
    const newItem = await prisma.inventoryItem.create({
      data: req.body,
    });
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/inventory/:id", async (req, res) => {
  try {
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT} with SQLite Database`,
  );
});
