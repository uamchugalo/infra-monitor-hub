const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pcs = [
  {
    name: "LAB 109",
    general: "PC Name: IBD10900232920",
    macAddress: "38:ca:84:9a:74:44 / D0:37:45:5E:75:F7",
    ip: "10.70.60.9 / 10.70.90.9",
    serialNumber: "BRJ6215C91",
    manufacturer: "HP",
    model: "Computador - HP Pro SFF 400 G9 Desktop PC",
    status: "Em Uso"
  },
  {
    name: "LAB 110",
    general: "PC Name: IBD11000P224974",
    macAddress: "28:c5:c8:c4:f8:be / D0:37:45:5E:76:CA",
    ip: "10.70.60.10 / 10.70.90.10",
    serialNumber: "BRJ548207K",
    manufacturer: "HP",
    model: "Computador - HP Pro SFF 400 G9 Desktop PC",
    status: "Em Uso"
  },
  {
    name: "LAB 308",
    general: "PC Name: IBD30900P193859 | CPU: 12th Gen Intel Core i5-12500 | Mem: 8 GB | HD: SSSTC CL4-8D512-Q79",
    macAddress: "60:c7:27:09:15:9d / D0:37:45:5C:7A:C8",
    ip: "10.70.60.251 / 10.70.90.251",
    serialNumber: "PE0BY1KD",
    manufacturer: "LENOVO",
    model: "Computador - ThinkCentre M80s Gen 3",
    status: "Em Uso"
  },
  {
    name: "LAB 309",
    general: "PC Name: IBD30800P193870 | CPU: 12th Gen Intel Core i5-12500 | Mem: 8 GB | HD: SSSTC CL4-8D512-Q79",
    macAddress: "60:c7:27:09:15:76 / D0:37:45:5D:EA:2D",
    ip: "10.70.60.252 / 10.70.90.252",
    serialNumber: "PE0BY1HT",
    manufacturer: "LENOVO",
    model: "Computador - ThinkCentre M80s Gen 3",
    status: "Em Uso"
  },
  {
    name: "C+DIR",
    general: "PC Name: DIR",
    macAddress: "8c:47:be:45:b0:a6 / 5c:cd:5b:5a:85:61",
    ip: "10.70.50.205 / 10.70.50.206",
    model: "Computador",
    status: "Em Uso"
  },
  {
    name: "Marcelo",
    general: "PC Name: IBD12301P179720 | CPU: Intel Core i5-4570 @ 3.20GHz | Mem: 8 GB | HD: WY2-512GB",
    macAddress: "d0:37:45:56:48:7a / 64:1c:67:68:23:68",
    ip: "10.70.50.207 / 10.70.50.208",
    serialNumber: "PE00WDWN",
    manufacturer: "LENOVO",
    model: "Computador - ThinkCentre M93p",
    status: "Em Uso"
  },
  {
    name: "Prof. Paulo cesar",
    general: "PC Name: IBD12302P194236 | CPU: 12th Gen Intel Core i5-12500 | Mem: 8 GB | HD: SAMSUNG MZVLQ256HBJD-00BH1",
    macAddress: "d0:37:45:57:a8:41 / 5c:60:ba:b1:5a:ab",
    ip: "10.70.50.209 / 10.70.50.210",
    serialNumber: "BRJ3075NVF",
    manufacturer: "HP",
    model: "Computador - HP Pro SFF 400 G9 Desktop PC",
    status: "Em Uso"
  },
  {
    name: "Edivaldo",
    general: "PC Name: IBD20705P179715 | CPU: Intel Core i5-4570 @ 3.20GHz | Mem: 8 GB | HD: WY2-512GB",
    macAddress: "64:1c:67:6a:56:1a / d0:37:45:5d:ea:44",
    ip: "10.70.50.212 / 10.70.50.213",
    serialNumber: "PE00WH9J",
    manufacturer: "LENOVO",
    model: "Computador - ThinkCentre M93p",
    status: "Em Uso"
  },
  {
    name: "Gabriel",
    general: "PC Name: IBNT1101P8662 | CPU: Intel Core i5-10210U @ 1.60GHz | Mem: 8 GB | HD: WY2-512GB",
    macAddress: "b0:a4:60:b6:80:d2 / c8:95:ce:db:86:52",
    ip: "10.70.50.216 / 10.70.50.217",
    serialNumber: "BRJ104GZP3",
    manufacturer: "HP",
    model: "Computador - HP ProBook 440 G7",
    status: "Em Uso"
  },
  {
    name: "Sebastião",
    general: "PC Name: IBN18201",
    model: "Computador",
    status: "Em Uso"
  },
  {
    name: "Luciano",
    general: "PC Name: IBN11501P | CPU: 13th Gen Intel Core i5-1334U | Mem: 16 GB | HD: WD PC SN560 SDDPNQE-1T00-1202",
    macAddress: "Não possui / e4:1f:d5:20:5d:e1",
    ip: "10.70.50.220 / 10.70.50.221",
    serialNumber: "W5N0B6032252211",
    manufacturer: "ASUSTeK",
    model: "Computador - Vivobook",
    status: "Em Uso"
  },
  {
    name: "Brenda Extensão",
    general: "PC Name: IBNEXT01P | CPU: Intel Core i5-1035G1 @ 1.00GHz | Mem: 4 GB | HD: IM2P33F8ABR1-256GB",
    macAddress: "e4:a8:df:f3:d3:bd / d8:f3:bc:60:7a:59",
    ip: "10.70.50.222 / 10.70.50.223",
    serialNumber: "NXA4LAL00713281A089501",
    manufacturer: "Acer",
    model: "Computador - Aspire A514-53",
    status: "Em Uso"
  },
  {
    name: "Leo Muller",
    general: "PC Name: IBNT1327P9758 | CPU: Intel Core i7-8550U @ 1.80GHz | Mem: 20 GB",
    macAddress: "64:1c:67:9e:06:fd / 5c:c9:d3:bf:ac:53",
    ip: "10.70.50.224 / 10.70.50.225",
    serialNumber: "PE03XRPJ",
    manufacturer: "LENOVO",
    model: "Computador - 81FE",
    status: "Em Uso"
  }
];

async function run() {
  for (const pc of pcs) {
    await prisma.inventoryItem.create({
      data: pc
    });
  }
}

run()
  .then(() => console.log('Successfully inserted computers!'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
