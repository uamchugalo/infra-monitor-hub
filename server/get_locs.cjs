const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const switches = await prisma.switch.findMany();
  const locations = new Set(switches.map(s => s.location));
  console.log("Switch Locations:", Array.from(locations));
}
run().finally(() => prisma.$disconnect());
