const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const cams = await prisma.camera.findMany({
    where: { switchId: null }
  });
  console.log("Unlinked Cameras:");
  cams.forEach(c => console.log(`${c.name} - Loc: ${c.location}`));
}
run().finally(() => prisma.$disconnect());
