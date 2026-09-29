const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Fix APs starting with "AP - T" that are not linked
  const aps = await prisma.accessPoint.findMany({
    where: { 
      switchId: null,
      name: { startsWith: 'AP - T' }
    }
  });
  
  let count = 0;
  for (const ap of aps) {
    if (ap.location === "Térreo") {
      await prisma.accessPoint.update({
        where: { id: ap.id },
        data: { location: "Outros" }
      });
      count++;
    }
  }
  
  // Just in case there are cameras that match
  const cams = await prisma.camera.findMany({
    where: { 
      switchId: null
    }
  });
  let camCount = 0;
  for (const cam of cams) {
    if (cam.name.includes("Térreo") || cam.name.startsWith("T") || cam.name.includes(" T")) {
      if (cam.location === "Térreo") {
        await prisma.camera.update({
          where: { id: cam.id },
          data: { location: "Outros" }
        });
        camCount++;
      }
    }
  }

  console.log(`Updated ${count} APs and ${camCount} Cameras to 'Outros'.`);
}
run().finally(() => prisma.$disconnect());
