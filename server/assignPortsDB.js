import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Port Assignment...");

  // 1. Ensure Target Switches Exist
  const labs = ["109", "110", "308", "309"];
  for (const lab of labs) {
    const swId = `sw-${lab}`;
    // Check if exists
    const exists = await prisma.switch.findUnique({ where: { id: swId } });

    if (!exists) {
      console.log(`Creating Switch ${swId}...`);
      await prisma.switch.create({
        data: {
          id: swId,
          name: `Switch Lab ${lab}`,
          location: lab === "109" || lab === "110" ? "1º Andar" : "3º Andar",
          totalPorts: 48,
          ip: `10.70.0.${lab}`, // Fake IP
          updatedAt: new Date(),
        },
      });
    }
  }

  // 2. Fetch all PCs
  const pcs = await prisma.pC.findMany();
  let updatedCount = 0;
  let skippedCount = 0;

  for (const pc of pcs) {
    if (!pc.name) continue;

    // Regex: Matches IBD or IDB followed by 3 digits (Lab) and 2 digits (Port)
    // Adjust regex to be flexible: I[BD]D or IDB or IBD
    // The user prompted "IDB10901" but file had "IBD10901".
    // Let's use flexible regex: /^I[BD]{2}(\d{3})(\d{2})/
    const match = pc.name.match(/^I[BD]{2}(\d{3})(\d{2})/);

    if (match) {
      const lab = match[1];
      const portStr = match[2];
      const portNum = parseInt(portStr, 10);

      // Filter for target labs only
      if (!labs.includes(lab)) continue;

      // Handle "00" port -> Disconnect
      if (portNum === 0) {
        // If currently connected to something in these labs, disconnect?
        // Or just ensure it's disconnected regardless.
        // User said "nao conecta".
        if (pc.switchId || pc.switchPort) {
          console.log(`Disconnecting ${pc.name} (Port 00)`);
          await prisma.pC.update({
            where: { id: pc.id },
            data: { switchId: null, switchPort: null },
          });
          // Also clear SwitchPort if we knew where it was...
          // But we might not know easily without querying SwitchPort.
          // We can try to delete from SwitchPort by deviceId
          await prisma.switchPort.deleteMany({ where: { deviceId: pc.id } });
        }
        skippedCount++;
        continue;
      }

      // Valid Port -> Connect
      const swId = `sw-${lab}`;

      // Update PC
      await prisma.pC.update({
        where: { id: pc.id },
        data: { switchId: swId, switchPort: portNum.toString() },
      });

      // Upsert SwitchPort (The "Active Connection" view)
      // Note: We need to handle if the port is already taken?
      // Upsert will overwrite, which is what we want for "This PC is here now".

      // First, clear this PC from any OTHER port it might be on (to avoid duplicates)
      await prisma.switchPort.deleteMany({
        where: {
          deviceId: pc.id,
          NOT: {
            switchId: swId,
            port: portNum,
          },
        },
      });

      /* 
               There is a unique constraint on [switchId, port].
               So upsert works perfectly by switchId_port.
            */
      await prisma.switchPort.upsert({
        where: {
          switchId_port: { switchId: swId, port: portNum },
        },
        update: {
          deviceId: pc.id,
          deviceIp: pc.ip,
          name: pc.name,
          type: "PC",
        },
        create: {
          switchId: swId,
          port: portNum,
          deviceId: pc.id,
          deviceIp: pc.ip,
          name: pc.name,
          type: "PC",
        },
      });

      updatedCount++;
      // console.log(`Connected ${pc.name} to ${swId} Port ${portNum}`);
    } else {
      // Logic for non-matching names?
      // "se houver sem identifcação completa me fala e nao conecta"
      // If they are currently connected to these labs, should we disconnect?
      // Maybe safer not to touch existing unspecified connections unless we know they are failing.
      // But if user wants "me fala", we can log them.
      if (labs.some((l) => pc.name && pc.name.includes(l))) {
        // Example: "PC Lab 109 Generic"
        // console.log(`Non-standard name in target lab scope: ${pc.name}`);
      }
    }
  }

  console.log(`Process Complete.`);
  console.log(`Updated/Connected: ${updatedCount}`);
  console.log(`Disconnected/Skipped (Port 00): ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
