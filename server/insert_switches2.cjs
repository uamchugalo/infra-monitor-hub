const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rawData = fs.readFileSync('raw_switches2.txt', 'utf8');
const lines = rawData.split('\n').filter(line => line.trim() !== '');

async function run() {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split('\t').map(c => c.replace(/"/g, '').trim());
    if (cols.length < 2) continue;

    let name = cols[0];
    if (!name.toUpperCase().startsWith('SW')) {
        name = `SW ${name}`;
    }
    // Handle the duplicate LAB 1 if any (though UI allows duplicate names)
    if (name === "SW LAB 1" && i === 5) {
        name = "SW LAB 1 (2)";
    }

    const ip = cols[1] || '';
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
      general: finalGeneral,
      status: "Em Estoque" // They seem to be spares
    };

    // Since these have no IP and might be new spares, just create them
    await prisma.inventoryItem.create({
      data: invData
    });
    console.log(`Created InventoryItem ${name}`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
