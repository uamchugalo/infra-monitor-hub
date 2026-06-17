import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const apsData = `AP - 102,10.70.20.111
AP - 209,10.70.20.137
Biblioteca 01,10.70.20.211
Biblioteca 02,10.70.20.120
Galpão 2,10.70.20.113
Portaria,10.70.20.212
Sala 101,10.70.20.107
Sala 103,10.70.20.108
Sala 104,10.70.20.110
Sala 105,10.70.20.100
Sala 106,10.70.20.114
Sala 107,10.70.20.105
Sala 109,10.70.20.109
Sala 110,10.70.20.106
Sala 113,10.70.20.102
Sala 115,10.70.20.115
Sala 120,10.70.20.112
Sala 124,10.70.20.101
Sala 201,10.70.20.205
Sala 202,10.70.20.124
Sala 203,10.70.20.221
Sala 204,10.70.20.225
Sala 205,10.70.20.223
Sala 206,10.70.20.219
Sala 207,10.70.20.128
Sala 208,10.70.20.222
Sala 301,10.70.20.135
Sala 302,10.70.20.140
Sala 303,10.70.20.118
Sala 304,10.70.20.139
Sala 305,10.70.20.141
Sala 307,10.70.20.142
Sala 308,10.70.20.136
Sala 309,10.70.20.138
Sala 401,10.70.20.207
Sala 402,10.70.20.218
Sala 403,10.70.20.250
Sala 404,10.70.20.132
Sala 405,10.70.20.119
Sala 406,10.70.20.129
Sala 407,10.70.20.133
Sala 408,10.70.20.229
Sala 409,10.70.20.131
Sala 410,10.70.20.217
Sala 501 - STI,10.70.20.121
Sala T07,10.70.20.103
Sala T08,10.70.20.104
Sala T09,10.70.20.116
Sala T10,10.70.20.126
Sala T13,10.70.20.213
Sala T14,10.70.20.214`;

function getFloor(name) {
    if (name.includes('Portaria') || name.includes('Galpão')) return 'Térreo';

    // Procura por números de sala ou AP
    const match = name.match(/\b([T1-5])\d+\b/i) || name.match(/\b(\d)\d+\b/);
    if (!match) return 'Térreo';

    const identifier = match[1].toUpperCase();
    if (identifier === 'T') return 'Térreo';
    if (identifier === '1') return '1° Andar';
    if (identifier === '2') return '2° Andar';
    if (identifier === '3') return '3° Andar';
    if (identifier === '4') return '4° Andar';
    if (identifier === '5') return '5° Andar';

    return 'Térreo';
}

async function main() {
    console.log("Iniciando importação de Access Points...");
    const lines = apsData.split('\n');
    let count = 0;

    for (const line of lines) {
        if (!line.trim()) continue;
        const [name, ip] = line.split(',');

        const cleanName = name.trim();
        const cleanIp = ip.trim();
        const id = `AP-${cleanIp.split('.').pop()}-${Date.now().toString().slice(-4)}`;
        const location = getFloor(cleanName);

        try {
            await prisma.accessPoint.upsert({
                where: { ip: cleanIp },
                update: {
                    name: cleanName,
                    location: location,
                },
                create: {
                    id: id,
                    name: cleanName,
                    ip: cleanIp,
                    location: location,
                }
            });
            console.log(`AP ${cleanName} (${location}) importado/atualizado.`);
            count++;
        } catch (error) {
            console.error(`Erro ao importar ${cleanName}:`, error.message);
        }
    }

    console.log(`\nSucesso! ${count} Access Points processados.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
