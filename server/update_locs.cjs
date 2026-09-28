const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const aps = await prisma.accessPoint.findMany();
  for (const ap of aps) {
    let loc = ap.location;
    if (loc) {
        loc = loc.replace("º", "°");
        if (loc === "5° Andar") loc = "Externo";
        if (loc === "Portaria") loc = "Externo";
        if (loc === "Galpão") loc = "Externo";
        if (loc === "Ginásios") loc = "Externo";
        if (loc === "Gabinetes") loc = "Térreo";
        
        if (loc !== ap.location) {
            await prisma.accessPoint.update({
                where: { id: ap.id },
                data: { location: loc }
            });
            console.log(`Updated ${ap.name} location to ${loc}`);
        }
    }
  }
}
run().finally(() => prisma.$disconnect());
