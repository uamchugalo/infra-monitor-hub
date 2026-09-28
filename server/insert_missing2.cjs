const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = fs.readFileSync('missing_aps.txt', 'utf8');

const regex = /(AP\s*-[^\t]+)\t+(10\.[0-9\.]+)/g;
let match;
const aps = [];

while ((match = regex.exec(data)) !== null) {
  let name = match[1].trim();
  let ip = match[2].trim();
  let loc = "Térreo";
  
  if (name.includes("Galp")) loc = "Galpão";
  else if (name.includes("Gin")) loc = "Ginásios";
  
  aps.push({
      id: `ap-${Math.random().toString(36).substr(2, 9)}`,
      name,
      ip,
      location: loc,
      enabled: true
  });
}

async function run() {
  for (const ap of aps) {
      const existing = await prisma.accessPoint.findUnique({ where: { ip: ap.ip } });
      if (!existing) {
          await prisma.accessPoint.create({ data: ap });
          console.log(`Inserted ${ap.name} (${ap.ip})`);
      }
  }
}

run().finally(() => prisma.$disconnect());
