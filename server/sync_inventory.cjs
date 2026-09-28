const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const aps = await prisma.accessPoint.findMany();
  for (const ap of aps) {
    const existing = await prisma.inventoryItem.findFirst({ where: { ip: ap.ip } });
    if (!existing) {
      await prisma.inventoryItem.create({
        data: {
          name: ap.name,
          ip: ap.ip,
          location: ap.location,
          patrimony: "",
          serialNumber: "",
          manufacturer: "Ubiquiti", // usually APs are ubiquiti or similar, leave empty or infer
          model: "Access Point",
          macAddress: ""
        }
      });
      console.log(`Added ${ap.name} to Inventory`);
    } else {
      console.log(`Inventory already has ${ap.name}`);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
