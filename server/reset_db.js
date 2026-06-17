import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️ Resetting Database...');

    // Ordem importa por causa de Foreign Keys (Cascade helps, but safety first)
    await prisma.switchPort.deleteMany();
    await prisma.switch.deleteMany();

    await prisma.patchPanelPort.deleteMany();
    await prisma.patchPanel.deleteMany();

    await prisma.accessPoint.deleteMany();
    await prisma.camera.deleteMany();
    await prisma.pC.deleteMany();

    console.log('✅ Database is now empty.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
