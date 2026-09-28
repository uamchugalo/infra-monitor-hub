const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = fs.readFileSync('missing_aps.txt', 'utf8');

// Match AP - <Name> followed by 10.x.x.x
const regex = /(AP\s*-\s*[A-Za-z0-9\.\-\s]+)\t(10\.[0-9\.]+)/g;
let match;
const aps = [];

while ((match = regex.exec(data)) !== null) {
  let name = match[1].trim();
  let ip = match[2].trim();
  
  let loc = "Térreo";
  if (name.includes("T")) loc = "Térreo";
  else if (name.includes("1")) loc = "1º Andar";
  else if (name.includes("2")) loc = "2º Andar";
  else if (name.includes("3")) loc = "3º Andar";
  else if (name.includes("4")) loc = "4º Andar";
  else if (name.includes("5")) loc = "5º Andar";
  else if (name.includes("BB")) loc = "Gabinetes";
  else if (name.includes("Galp")) loc = "Galpão";
  else if (name.includes("Gin")) loc = "Ginásios";
  else if (name.includes("Port")) loc = "Portaria";

  aps.push({
      id: `ap-${Math.random().toString(36).substr(2, 9)}`,
      name,
      ip,
      location: loc,
      enabled: true
  });
}

async function run() {
  console.log(`Found ${aps.length} missing APs to insert.`);
  for (const ap of aps) {
      const existing = await prisma.accessPoint.findUnique({ where: { ip: ap.ip } });
      if (!existing) {
          await prisma.accessPoint.create({
              data: ap
          });
          console.log(`Inserted ${ap.name} (${ap.ip})`);
      } else {
          console.log(`Skipped ${ap.name} (${ap.ip}) - already exists`);
      }
  }
  console.log("Done inserting APs");
}

run().catch(console.error).finally(() => prisma.$disconnect());
