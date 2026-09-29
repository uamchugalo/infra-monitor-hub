const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const cams = await prisma.camera.findMany();
  console.log(cams.filter(c => c.name.startsWith('T') || c.name.includes(' T')).map(c => `${c.name} - Loc: ${c.location} - SW: ${c.switchId}`).join('\n'));
}
run().finally(() => prisma.$disconnect());
