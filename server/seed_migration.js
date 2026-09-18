import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration from JSON to SQLite...");

  const dataPath = path.join(__dirname, "data");
  const read = (file) => {
    try {
      return JSON.parse(
        fs.readFileSync(path.join(dataPath, file), "utf8") || "[]",
      );
    } catch (e) {
      console.log(`No data for ${file}`);
      return [];
    }
  };

  const switches = read("switches.json");
  const pps = read("patch_panels.json");
  const aps = read("aps.json");
  const cameras = read("cameras.json");
  const pcs = read("pcs.json");

  // Switches
  for (const s of switches) {
    console.log(`Migrating Switch ${s.id}`);
    try {
      await prisma.switch.upsert({
        where: { id: s.id },
        update: {},
        create: {
          id: s.id,
          name: s.name,
          ip: s.ip,
          model: s.model || "",
          location: s.location,
          totalPorts: s.totalPorts,
          order: s.order,
        },
      });

      if (s.ports) {
        for (const p of s.ports) {
          await prisma.switchPort
            .create({
              data: {
                switchId: s.id,
                port: p.port,
                name: p.name,
                type: p.type,
                deviceId: p.deviceId,
                deviceIp: p.deviceIp,
              },
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      console.error(`Error Switch ${s.id}:`, e.message);
    }
  }

  // Patch Panels
  for (const p of pps) {
    try {
      await prisma.patchPanel
        .create({
          data: {
            id: p.id,
            name: p.name,
            location: p.location,
            totalPorts: p.totalPorts,
            order: p.order,
          },
        })
        .catch(() => {});

      if (p.ports) {
        for (const pt of p.ports) {
          await prisma.patchPanelPort
            .create({
              data: {
                patchPanelId: p.id,
                port: pt.port,
                description: pt.description,
              },
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      console.error(`Error PP ${p.id}:`, e.message);
    }
  }

  // Devices
  for (const d of aps)
    await prisma.accessPoint
      .create({
        data: {
          id: d.id,
          name: d.name,
          ip: d.ip,
          location: d.location,
          switchId: d.switchId || null,
          switchPort: d.switchPort || null,
        },
      })
      .catch((e) => {});
  for (const d of cameras)
    await prisma.camera
      .create({
        data: {
          id: d.id,
          name: d.name,
          ip: d.ip,
          location: d.location,
          mac: d.mac,
          serial: d.serial,
          status: d.status,
          switchId: d.switchId || null,
          switchPort: d.switchPort || null,
        },
      })
      .catch((e) => {});
  for (const d of pcs)
    await prisma.pC
      .create({
        data: {
          id: d.id,
          name: d.name,
          ip: d.ip,
          mac: d.mac,
          location: d.location,
          type: d.type,
          switchId: d.switchId || null,
          switchPort: d.switchPort || null,
        },
      })
      .catch((e) => {});

  console.log("Migration finished.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
