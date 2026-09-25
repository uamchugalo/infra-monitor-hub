import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const printers = [
  { name: "BIBLIOTECA", mac: "2C-58-B9-5E-37-4A", ip: "10.70.50.101", location: "Biblioteca", manufacturer: "Simpress", serial: "BRBSS7P09C" },
  { name: "DE", mac: "2C-58-B9-59-D5-BC", ip: "10.70.50.102", location: "Diretoria de Ensino", manufacturer: "Simpress", serial: "BRBSS7P06Q" },
  { name: "DOCENTES", mac: "2C-58-B9-5F-69-76", ip: "10.70.50.103", location: "Sala 122", manufacturer: "Simpress", serial: "BRBSS7P087" },
  { name: "DOCENTES II", mac: "30:13:8b:08:9b:27", ip: "10.70.50.104", location: "Sala 122", manufacturer: "Simpress", serial: "BRBSSCK0QK" },
  { name: "DAP", mac: "2C-58-B9-5E-47-67", ip: "10.70.50.105", location: "Sala 209", manufacturer: "Simpress", serial: "BRBSS7P07N" },
  { name: "SAMSUNG", mac: null, ip: "USB", location: "Sala 407", manufacturer: "Sala 407 - Colorida", serial: null },
  { name: "DEP", mac: "a8:b1:3b:a9:2f:27", ip: "10.70.50.107", location: "Diretoria de Ensino", manufacturer: "HP Smart Tank 790 series", serial: "HPA92F27" },
  { name: "Printer Card", mac: "60:95:32:1e:82:fb", ip: "USB", location: "Sala 209", manufacturer: "Zebra C300", serial: "NPI089B27" }
];

async function main() {
  for (const p of printers) {
    // Insert into InventoryItem
    await prisma.inventoryItem.create({
      data: {
        name: `Impressora ${p.name}`,
        ip: p.ip,
        macAddress: p.mac,
        serialNumber: p.serial,
        location: p.location,
        manufacturer: p.manufacturer,
        model: "Impressora"
      }
    });
  }
  console.log(`\n\n✅ ${printers.length} Impressoras inseridas com sucesso no Banco de Dados de Inventário!\n\n`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
