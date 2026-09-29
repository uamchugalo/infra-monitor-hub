const fs = require('fs');
let content = fs.readFileSync('src/pages/Cameras.tsx', 'utf8');
content = content.replace(/\[\s*"T.*rreo".*?\]/, '["Térreo", "1º Andar", "Gabinetes", "2º Andar", "3º Andar", "4º Andar"]');
fs.writeFileSync('src/pages/Cameras.tsx', content, 'utf8');

let tr = fs.readFileSync('src/pages/TechnicalRooms.tsx', 'utf8');
tr = tr.replace(/\[\s*"T.*rreo".*?\]/, '["Térreo", "1º Andar", "Gabinetes", "2º Andar", "3º Andar", "4º Andar"]');
fs.writeFileSync('src/pages/TechnicalRooms.tsx', tr, 'utf8');
console.log('Fixed');
