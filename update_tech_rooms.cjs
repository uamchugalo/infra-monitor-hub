const fs = require('fs');
let content = fs.readFileSync('src/pages/TechnicalRooms.tsx', 'utf8');

// Add inventory state
if (!content.includes('const [inventoryItems, setInventoryItems]')) {
  content = content.replace(
    'const [aps, setAps] = useState<AccessPoint[]>([]);',
    'const [aps, setAps] = useState<AccessPoint[]>([]);\n  const [inventoryItems, setInventoryItems] = useState<any[]>([]);'
  );
}

// Add fetch for inventory
if (!content.includes('fetch("/api/inventory")')) {
  content = content.replace(
    'const apRes = await fetch("/api/aps").catch(() => ({\n          ok: false,\n          json: () => [],\n        }));',
    'const apRes = await fetch("/api/aps").catch(() => ({\n          ok: false,\n          json: () => [],\n        }));\n        const invRes = await fetch("/api/inventory").catch(() => ({\n          ok: false,\n          json: () => [],\n        }));'
  );
}

// Add setInventoryItems
if (!content.includes('setInventoryItems(loadedInv)')) {
  content = content.replace(
    'if (apRes.ok) {\n          const loadedAps = await apRes.json();\n          if (Array.isArray(loadedAps)) setAps(loadedAps);\n        }',
    'if (apRes.ok) {\n          const loadedAps = await apRes.json();\n          if (Array.isArray(loadedAps)) setAps(loadedAps);\n        }\n        if (invRes.ok) {\n          const loadedInv = await invRes.json();\n          if (Array.isArray(loadedInv)) setInventoryItems(loadedInv);\n        }'
  );
}

fs.writeFileSync('src/pages/TechnicalRooms.tsx', content);
console.log('TechnicalRooms.tsx updated');
