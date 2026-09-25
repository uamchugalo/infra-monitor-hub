import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Apagando todos os itens do Inventário...");
  const { count } = await prisma.inventoryItem.deleteMany({});
  console.log(`\n✅ Sucesso! ${count} itens foram apagados do banco de dados do Inventário.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
