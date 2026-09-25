import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando a limpeza completa do banco de dados...");
  
  const inv = await prisma.inventoryItem.deleteMany({});
  const aps = await prisma.accessPoint.deleteMany({});
  const cams = await prisma.camera.deleteMany({});
  const pcs = await prisma.pC.deleteMany({});
  const ports = await prisma.switchPort.deleteMany({});
  const switches = await prisma.switch.deleteMany({});
  
  console.log(`✅ Apagados: ${inv.count} itens de inventário.`);
  console.log(`✅ Apagados: ${aps.count} APs.`);
  console.log(`✅ Apagadas: ${cams.count} Câmeras.`);
  console.log(`✅ Apagados: ${pcs.count} PCs.`);
  console.log(`✅ Apagadas: ${ports.count} Portas de Switch.`);
  console.log(`✅ Apagados: ${switches.count} Switches.`);
  
  console.log("\nBanco de dados completamente zerado!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
