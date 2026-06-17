
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.pC.updateMany({
            data: {
                status: 'online',
            },
        });
        console.log(`Updated ${result.count} PCs to online status.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
