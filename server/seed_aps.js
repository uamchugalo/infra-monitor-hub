import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const aps = [
  { name: "AP - T01", ip: "10.70.20.201", mac: "x" },
  { name: "AP - T02", ip: "10.70.20.202", mac: "x" },
  { name: "AP - T03", ip: "10.70.20.203", mac: "x" },
  { name: "AP - T04", ip: "10.70.20.204", mac: "x" },
  { name: "AP - T05", ip: "10.70.20.205", mac: "5C:62:8B:BF:74:5A" },
  { name: "AP - T06", ip: "10.70.20.206", mac: null },
  { name: "AP - T07", ip: "10.70.20.207", mac: "5C:62:8B:BF:77:E4" },
  { name: "AP - T08", ip: "10.70.20.208", mac: "5C:62:8B:BF:75:A0" },
  { name: "AP - T09", ip: "10.70.20.209", mac: "5C:62:8B:BF:77:FE" },
  { name: "AP - T10", ip: "10.70.20.210", mac: "5C:62:8B:BF:75:A2" },
  { name: "AP - T13", ip: "10.70.20.213", mac: "5C:62:8B:BF:7A:E2" },
  { name: "AP - T14", ip: "10.70.20.214", mac: "5C:62:8B:BF:77:E8" },
  { name: "AP - BB1", ip: "10.70.20.215", mac: "5C:62:8B:BF:7B:1E" },
  { name: "AP - BB2", ip: "10.70.20.216", mac: "5C:62:8B:BF:7A:40" },
  { name: "AP - 101", ip: "10.70.20.111", mac: null },
  { name: "AP - 102", ip: "10.70.20.112", mac: null },
  { name: "AP - 103", ip: "10.70.20.113", mac: null },
  { name: "AP - 104", ip: "10.70.20.114", mac: null },
  { name: "AP - 105", ip: "10.70.20.115", mac: null },
  { name: "AP - 106", ip: "10.70.20.116", mac: null },
  { name: "AP - 107", ip: "10.70.20.117", mac: null },
  { name: "AP - 109", ip: "10.70.20.118", mac: null },
  { name: "AP - 110", ip: "10.70.20.110", mac: null },
  { name: "AP - 113", ip: "10.70.20.223", mac: null },
  { name: "AP - 115", ip: "10.70.20.225", mac: null },
  { name: "AP - 120", ip: "10.70.20.220", mac: null },
  { name: "AP - 124", ip: "10.70.20.224", mac: null },
  { name: "AP - 201", ip: "10.70.20.121", mac: null },
  { name: "AP - 202", ip: "10.70.20.122", mac: null },
  { name: "AP - 203", ip: "10.70.20.123", mac: null },
  { name: "AP - 204", ip: "10.70.20.124", mac: null },
  { name: "AP - 206", ip: "10.70.20.126", mac: null },
  { name: "AP - 207", ip: "10.70.20.127", mac: null },
  { name: "AP - 208", ip: "10.70.20.128", mac: null },
  { name: "AP - 209", ip: "10.70.20.129", mac: null },
  { name: "AP - 301", ip: "10.70.20.131", mac: "5C:62:8B:BF:7A:72" },
  { name: "AP - 302", ip: "10.70.20.132", mac: "5C:62:8B:BF:79:FE" },
  { name: "AP - 303", ip: "10.70.20.133", mac: "5C:62:8B:BF:7A:70" },
  { name: "AP - 304", ip: "10.70.20.134", mac: "5C:62:8B:BF:7B:08" },
  { name: "AP - 305", ip: "10.70.20.135", mac: "5C:62:8B:BF:7A:66" },
  { name: "AP - 306", ip: "10.70.20.136", mac: "5C:62:8B:BF:75:E0" },
  { name: "AP - 307", ip: "10.70.20.137", mac: "5C:62:8B:BF:77:0A" },
  { name: "AP - 308", ip: "10.70.20.138", mac: "5C:62:8B:BF:77:14" },
  { name: "AP - 309", ip: "10.70.20.139", mac: "5C:62:8B:BF:76:86" },
  { name: "AP - 401", ip: "10.70.20.141", mac: "5C:62:8B:BF:7A:B8" },
  { name: "AP - 402", ip: "10.70.20.142", mac: "5C:62:8B:BF:7A:8E" },
  { name: "AP - 403", ip: "10.70.20.143", mac: "5C:62:8B:BF:7B:14" },
  { name: "AP - 404", ip: "10.70.20.144", mac: "5C:62:8B:BF:79:9A" },
  { name: "AP - 405", ip: "10.70.20.145", mac: "5C:62:8B:BF:7B:0A" },
  { name: "AP - 406", ip: "10.70.20.146", mac: "5C:62:8B:BF:76:6C" },
  { name: "AP - 407", ip: "10.70.20.147", mac: "5C:62:8B:BF:7A:3C" },
  { name: "AP - 408", ip: "10.70.20.148", mac: "5C:62:8B:BF:76:48" },
  { name: "AP - 409", ip: "10.70.20.149", mac: "5C:62:8B:BF:79:F8" },
  { name: "AP - 410", ip: "10.70.20.150", mac: "5C:62:8B:BF:78:BC" },
  { name: "AP - 5 Andar", ip: "10.70.20.151", mac: "E0:D3:62:E4:CC:96" },
  { name: "AP - Portaria", ip: "10.70.20.171", mac: "5C:62:8B:37:C1:3A" },
  { name: "AP -Galpão - Gab.", ip: "10.70.20.181", mac: "5C:62:8B:BF:76:1C" },
  { name: "AP - Galpão", ip: "10.70.20.182", mac: "E0:D3:62:E4:D0:3C" },
  { name: "AP -Ginásio I", ip: "10.70.20.191", mac: "5C:62:8B:BF:7A:64" },
  { name: "AP -Ginásio II", ip: "10.70.20.192", mac: "5C:62:8B:BF:76:6A" },
  { name: "AP -Ginásio III", ip: "10.70.20.193", mac: "E0:D3:62:E4:CD:EA" }
];

async function main() {
  for (const ap of aps) {
    // Insert into AccessPoint for monitoring
    const apId = `ap-${ap.ip.replace(/\./g, '-')}`;
    await prisma.accessPoint.upsert({
      where: { ip: ap.ip },
      update: { name: ap.name, location: ap.name },
      create: {
        id: apId,
        name: ap.name,
        ip: ap.ip,
        location: ap.name,
        status: "Online"
      }
    });

    // Insert into InventoryItem
    await prisma.inventoryItem.create({
      data: {
        name: ap.name,
        ip: ap.ip,
        macAddress: ap.mac === "x" ? null : ap.mac,
        location: ap.name,
        model: "Access Point"
      }
    });
  }
  console.log(`\n\n✅ ${aps.length} Access Points inseridos com sucesso no Banco de Dados!\n\n`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
