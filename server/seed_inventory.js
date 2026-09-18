import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

async function main() {
  const dataPath =
    "C:/Users/felipe.frade/.gemini/antigravity-ide/brain/a34909f6-2b65-4fdc-aeb5-84d1c4192418/scratch/inventory_data.tsv";
  const content = fs.readFileSync(dataPath, "utf-8");

  // Split by new line, removing empty lines at the end
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  // Remove header
  const dataLines = lines.slice(1);

  let addedCount = 0;

  for (const line of dataLines) {
    const columns = line.split("\t").map((c) => c.trim().replace(/^"|"$/g, ""));

    const r_name = columns[0] || null;
    let r_ip = null;
    let r_loc = null;

    if (columns[1] && columns[1].match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      r_ip = columns[1];
      r_loc = columns[2] || null;
    } else {
      r_loc = columns[1] || null;
    }

    const r_pat = columns[3] || null;
    const r_serial = columns[4] || null;
    const r_manuf = columns[5] || null;
    let r_model = columns[6] || null;
    const r_mac = columns[7] || null;
    const r_model2 = columns[8] || null;
    const r_console = columns[9] || null;
    const r_sfp = columns[10] || null;
    const r_general = columns[11] || null;

    if (r_model2 && r_model2 !== "-") {
      r_model = r_model ? `${r_model} (${r_model2})` : r_model2;
    }

    if (!r_name) continue;

    await prisma.inventoryItem.create({
      data: {
        name: r_name,
        ip: r_ip,
        location: r_loc,
        patrimony: r_pat,
        serialNumber: r_serial,
        manufacturer: r_manuf,
        model: r_model,
        macAddress: r_mac,
        consolePort: r_console,
        sfp: r_sfp,
        general: r_general,
      },
    });
    addedCount++;
  }
  console.log(`Seeded ${addedCount} items to Inventory.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
