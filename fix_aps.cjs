const fs = require('fs');

let content = fs.readFileSync('src/pages/AccessPoints.tsx', 'utf8');

content = content.replace(/\[\s*"T.*rreo".*?\]/, '["Térreo", "1º Andar", "Gabinetes", "2º Andar", "3º Andar", "4º Andar"]');
content = content.replace('const [customLocations] = useLocalStorage<string[]>(', 'const [customLocations, setCustomLocations] = useLocalStorage<string[]>(');

const hookDef = '["Térreo", "1º Andar", "Gabinetes", "2º Andar", "3º Andar", "4º Andar"]\n  );';
const newHookDef = hookDef + '\n\n  useEffect(() => {\n    let changed = false;\n    const fixed = customLocations.map(loc => {\n      const newLoc = loc.replace("TǸrreo", "Térreo").replace("1 Andar", "1º Andar").replace("2 Andar", "2º Andar").replace("3 Andar", "3º Andar").replace("4 Andar", "4º Andar");\n      if (newLoc !== loc) changed = true;\n      return newLoc;\n    });\n    if (changed) setCustomLocations(fixed);\n  }, [customLocations, setCustomLocations]);';

content = content.replace(hookDef, newHookDef);

fs.writeFileSync('src/pages/AccessPoints.tsx', content, 'utf8');
console.log('Fixed APs');
