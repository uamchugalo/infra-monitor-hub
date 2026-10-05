const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const items = [
  // Nobreaks
  {name: "Nobreak Ragtech 1500VA", general: "NOBREAK - RAGTECH - EASY WAY - 1500VA Bivolt 115V", patrimony: "28713", serialNumber: "4157 2137 1070 0", location: "ST-00", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak APC 2200", patrimony: "10313", serialNumber: "6187020011", location: "ST-00", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak Ragtech 1500VA", patrimony: "28713", serialNumber: "S/N: 4157 2137 1064 0", location: "ST-00", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak APC 1500VA", general: "Máquina de Ponto", patrimony: "Sem patromônio", serialNumber: "CóD EAN. 7891519705868", location: "Biblioteca", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak Orion 1400VA", patrimony: "171289", serialNumber: "E2207011635", location: "ST-01", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak YUP-E 1400VA", general: "Máquina de Ponto", patrimony: "52936", serialNumber: "n1213370700101000091", location: "1° Andar", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak Ragtech 1500VA", patrimony: "28716", serialNumber: "4157 2137 1075 0", location: "ST-02", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak Ragtech 1500VA", patrimony: "28715", serialNumber: "S/N: 4157 2137 1063 0", location: "ST-03", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak Orion 1400VA", patrimony: "171290", serialNumber: "E2207011507", location: "ST-04", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak Orion 1400VA", patrimony: "171286", serialNumber: "E2207011805", location: "Felipe", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak Orion 1400VA", patrimony: "171287", serialNumber: "E2207011487", location: "Pedro", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak Orion 1400VA", patrimony: "171288", serialNumber: "E220711636", location: "306", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak Orion 1400VA", patrimony: "171291", serialNumber: "E2207011507", location: "306", status: "Em Uso", model: "Nobreak"},
  {name: "Nobreak APC 1500VA", patrimony: "10315", serialNumber: "6425850011", location: "306", status: "Em Uso", model: "Nobreak"},
  
  // Impressoras
  {name: "Impressora BIBLIOTECA", macAddress: "2C-58-B9-5E-37-4A", ip: "10.70.50.101", location: "Biblioteca", manufacturer: "Simpress", serialNumber: "BRBSS7P09C", status: "Em Uso", model: "Impressora"},
  {name: "Impressora DE", macAddress: "2C-58-B9-59-D5-BC", ip: "10.70.50.102", location: "Diretoria de Ensino", manufacturer: "Simpress", serialNumber: "BRBSS7P06Q", status: "Em Uso", model: "Impressora"},
  {name: "Impressora DOCENTES", macAddress: "2C-58-B9-5F-69-76", ip: "10.70.50.103", location: "Sala 122", manufacturer: "Simpress", serialNumber: "BRBSS7P087", status: "Em Uso", model: "Impressora"},
  {name: "Impressora DOCENTES II", macAddress: "30:13:8b:08:9b:27", ip: "10.70.50.104", location: "Sala 122", manufacturer: "Simpress", serialNumber: "BRBSSCK0QK", status: "Em Uso", model: "Impressora"},
  {name: "Impressora DAP", macAddress: "2C-58-B9-5E-47-67", ip: "10.70.50.105", location: "Sala 209", manufacturer: "Simpress", serialNumber: "BRBSS7P07N", status: "Em Uso", model: "Impressora"},
  {name: "Impressora SAMSUNG", ip: "USB", location: "Sala 407", general: "Colorida", status: "Em Uso", model: "Impressora"},
  {name: "Impressora DEP", macAddress: "a8:b1:3b:a9:2f:27", ip: "10.70.50.107", location: "Diretoria de Ensino", manufacturer: "HP", general: "HP Smart Tank 790 series", serialNumber: "HPA92F27", status: "Em Uso", model: "Impressora"},
  {name: "Impressora Printer Card", macAddress: "60:95:32:1e:82:fb", ip: "USB", location: "Sala 209", manufacturer: "Zebra", general: "Zebra C300", serialNumber: "NPI089B27", status: "Em Uso", model: "Impressora"}
];

async function run() {
  for (const item of items) {
    await prisma.inventoryItem.create({
      data: item
    });
  }
}

run()
  .then(() => console.log('Successfully inserted items!'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
