import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.pC.count();
    console.log(`Total de PCs no banco de dados: ${count}`);

    if (count > 0) {
      const pcs = await prisma.pC.findMany({
        take: 5, // Mostra apenas os 5 primeiros para não poluir o log
        select: { id: true, name: true, ip: true, location: true },
      });
      console.log("Exemplo dos primeiros 5 PCs:");
      console.table(pcs);
    } else {
      console.log("Nenhum PC encontrado na tabela 'PC'.");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
