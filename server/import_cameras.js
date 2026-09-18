import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const camerasData = `1A_Lab,CAM102,10.70.40.102,24-fd-0d-62-14-6b
1A_Salas,CAM103,10.70.40.103,24-fd-0d-65-5a-8d
1A_Ponto,CAM105,10.70.40.105,24-fd-0d-65-5a-8e
1A_Biblioteca,CAM106,10.70.40.106,24-fd-0d-65-0d-62
CAM 107 - Sala 104,CAM107,10.70.40.107,24:fd:0d:7b:11:4f
CAM 108 - Cantina,CAM108,10.70.40.108,24:fd:0d:7b:11:4c
2A_Lab,CAM12,10.70.40.12,24-fd-0d-65-5a-89
2A_Salas,CAM13,10.70.40.13,24-fd-0d-65-5a-8c
2A_Corredor,CAM15,10.70.40.15,24-fd-0d-65-5a-8a
2A_Esquerdo,CAM16,10.70.40.16,24-fd-0d-65-5a-87
3A_Lab,CAM22,10.70.40.22,24-fd-0d-65-0d-60
3A_Salas,CAM23,10.70.40.23,24-fd-0d-7b-04-76
4A_Lab,CAM32,10.70.40.32,24-fd-0d-62-14-64
4A_Salas,CAM33,10.70.40.33,24:fd:0d:7b:04:79
5A_Lab,CAM42,10.70.40.42,24-fd-0d-65-5a-84
5A_Salas,CAM43,10.70.40.43,24-fd-0d-65-5a-86
Portaria_Carros,CAM171,10.70.40.171,24-fd-0d-7b-04-77
Portaria_Alunos,CAM172,10.70.40.172,24-fd-0d-7b-04-74
Paineis_Solares,CAM180,10.70.40.180,24:fd:0d:62:14:68
Entrada_Carros_Ginasio,CAM181,10.70.40.181,24:fd:0d:7b:04:7e
Ginásio,CAM182,10.70.40.182,24:fd:0d:7b:04:83`;

async function main() {
  console.log("Iniciando importação de câmeras...");
  const lines = camerasData.split("\n");
  let count = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    const [rawLocation, id, ip, mac] = line.split(",");

    // Limpeza básica
    const name = rawLocation.trim();
    const location = name.split(" - ")[1] || name; // Tenta extrair local se houver "CAM XXX - Sala YYY"

    try {
      await prisma.camera.upsert({
        where: { id: id.trim() },
        update: {
          name: name,
          ip: ip.trim(),
          mac: mac.trim().replace(/-/g, ":").toUpperCase(),
          location: location,
        },
        create: {
          id: id.trim(),
          name: name,
          ip: ip.trim(),
          mac: mac.trim().replace(/-/g, ":").toUpperCase(),
          location: location,
          status: "online", // Padrão inicial
        },
      });
      console.log(`Câmera ${id} (${name}) importada/atualizada.`);
      count++;
    } catch (error) {
      console.error(`Erro ao importar ${id}:`, error.message);
    }
  }

  console.log(`\nSucesso! ${count} câmeras processadas.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
