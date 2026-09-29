const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rawData = fs.readFileSync('raw_switches.txt', 'utf8');
const lines = rawData.split('\n').filter(line => line.trim() !== '');

async function run() {
  for (const line of lines) {
    const cols = line.split('\t').map(c => c.replace(/"/g, '').trim());
    if (cols.length < 2 || !cols[0].startsWith('SW')) continue;

    const name = cols[0];
    const ip = cols[1];
    if (!ip) continue;

    const loc = cols[2] || '';
    const patrimony = cols[3] || '';
    const serial = cols[4] || '';
    const manufacturer = cols[5] || '';
    const description = cols[6] || '';
    const mac = cols[7] || '';
    const model = cols[8] || '';
    const consolePort = cols[9] || '';
    const sfp = cols[10] || '';
    const general = cols[11] || '';
    const general2 = cols[12] || '';

    const finalGeneral = [description, general, general2].filter(Boolean).join(' | ');

    // 1. Update existing Switch if it exists in DB (the user said they already configured some)
    const existingSwitch = await prisma.switch.findFirst({ where: { name } });
    if (existingSwitch) {
      await prisma.switch.update({
        where: { id: existingSwitch.id },
        data: {
          ip: ip || existingSwitch.ip,
          model: model || existingSwitch.model,
        }
      });
      console.log(`Updated Switch ${name}`);
    }

    // 2. Upsert InventoryItem
    const existingInv = await prisma.inventoryItem.findFirst({ where: { OR: [{ name }, { ip }] } });
    const invData = {
      name,
      ip,
      location: loc,
      patrimony,
      serialNumber: serial,
      manufacturer,
      model,
      macAddress: mac,
      consolePort,
      sfp,
      general: finalGeneral
    };

    if (existingInv) {
      await prisma.inventoryItem.update({
        where: { id: existingInv.id },
        data: invData
      });
      console.log(`Updated InventoryItem ${name}`);
    } else {
      await prisma.inventoryItem.create({
        data: invData
      });
      console.log(`Created InventoryItem ${name}`);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
