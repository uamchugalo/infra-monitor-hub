const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const switches = await prisma.switch.findMany();
  const aps = await prisma.accessPoint.findMany();
  const cameras = await prisma.camera.findMany();
  const pcs = await prisma.pC.findMany();

  const inUseNames = new Set([
    ...switches.map(s => s.name),
    ...aps.map(a => a.name),
    ...cameras.map(c => c.name),
    ...pcs.map(p => p.name)
  ].filter(Boolean));

  const inUseIps = new Set([
    ...switches.map(s => s.ip),
    ...aps.map(a => a.ip),
    ...cameras.map(c => c.ip),
    ...pcs.map(p => p.ip)
  ].filter(Boolean));

  const invItems = await prisma.inventoryItem.findMany();
  let updatedCount = 0;

  for (const item of invItems) {
    if (inUseNames.has(item.name) || inUseIps.has(item.ip)) {
      if (item.status !== "Em Uso") {
        await prisma.inventoryItem.update({
          where: { id: item.id },
          data: { status: "Em Uso" }
        });
        updatedCount++;
      }
    } else {
      if (item.status !== "Em Estoque") {
         await prisma.inventoryItem.update({
          where: { id: item.id },
          data: { status: "Em Estoque" }
        });
        updatedCount++;
      }
    }
  }

  console.log(`Updated status of ${updatedCount} inventory items based on actual usage.`);
}

run().finally(() => prisma.$disconnect());
