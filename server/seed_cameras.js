import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cameras = [
  { name: "CAM100", ip: "10.70.40.100", serial: null, patrimony: null, mac: null },
  { name: "CAM101", ip: "10.70.40.101", serial: null, patrimony: null, mac: null },
  { name: "CAM102", ip: "10.70.40.102", serial: "4VEH5101549CT", patrimony: "9158", mac: "24:fd:0d:62:14:6b" },
  { name: "CAM103", ip: "10.70.40.103", serial: "4VEI0203475X0", patrimony: "9159", mac: "24:fd:0d:65:5a:8d" },
  { name: "CAM104", ip: "10.70.40.104", serial: "73KG05018826P", patrimony: "3451", mac: "58:10:8c:9e:5b:2d" },
  { name: "CAM105 : BB", ip: "10.70.40.105", serial: "4VEI0202741HF", patrimony: "9154", mac: "24:fd:0d:65:5a:8e" },
  { name: "CAM106 : Ponto", ip: "10.70.40.106", serial: "4VEI0202741HF", patrimony: "9155", mac: "24:fd:0d:65:0d:62" },
  { name: "CAM107 : Sala 104", ip: "10.70.40.107", serial: "4VEI080349270", patrimony: "9154", mac: "24:fd:0d:7b:11:4f" },
  { name: "CAM108 : Cantina", ip: "10.70.40.108", serial: "4VEI0803487BO", patrimony: "9155", mac: "24:fd:0d:7b:11:4c" },
  { name: "CAM11", ip: "10.70.40.11", serial: "4VEI0800379US", patrimony: "9168", mac: "24:fd:0d:7b:04:7c" },
  { name: "CAM12", ip: "10.70.40.12", serial: "4VEI02034815L", patrimony: "9163", mac: "24:fd:0d:65:5a:89" },
  { name: "CAM13", ip: "10.70.40.13", serial: "4VEI0203477FQ", patrimony: "9161", mac: "24:fd:0d:65:5a:8c" },
  { name: "CAM14", ip: "10.70.40.14", serial: "73KG05018879U", patrimony: "28329", mac: "58:10:8c:9e:58:31" },
  { name: "CAM15", ip: "10.70.40.15", serial: "4VEI02034761R", patrimony: "9160", mac: "24:fd:0d:65:5a:8a" },
  { name: "CAM16", ip: "10.70.40.16", serial: "4VEI0203483OO", patrimony: "9162", mac: "24:fd:0d:65:5a:87" },
  { name: "CAM20", ip: "10.70.40.10", serial: null, patrimony: null, mac: null },
  { name: "CAM21", ip: "10.70.40.21", serial: "73KG0501885HP", patrimony: "3452", mac: "58:10:8c:9e:5b:2a" },
  { name: "CAM22", ip: "10.70.40.22", serial: "4VEI0202740BK", patrimony: "9165", mac: "24:fd:0d:65:0d:60" },
  { name: "CAM23", ip: "10.70.40.23", serial: "4VEI0800373UT", patrimony: "9164", mac: "24:fd:0d:7b:04:76" },
  { name: "CAM24", ip: "10.70.40.24", serial: "73KG06006188D", patrimony: "3450", mac: "58:10:8c:9f:d9:96" },
  { name: "CAM28 : OBRA I", ip: "10.70.40.28", serial: null, patrimony: null, mac: null },
  { name: "CAM29 : OBRA II", ip: "10.70.40.29", serial: null, patrimony: null, mac: null },
  { name: "CAM30", ip: "10.70.40.30", serial: null, patrimony: null, mac: null },
  { name: "CAM31", ip: "10.70.40.31", serial: "4VEI0803486VU", patrimony: "9156", mac: "24:fd:0d:7b:11:4b" },
  { name: "CAM32", ip: "10.70.40.32", serial: "4VEH5101553OZ", patrimony: "9167", mac: "24:fd:0d:62:14:64" },
  { name: "CAM33", ip: "10.70.40.33", serial: "4VEI080037549", patrimony: "9166", mac: "24:fd:0d:7b:04:79" },
  { name: "CAM34", ip: "10.70.40.34", serial: "4VEI0800378WE", patrimony: "3447", mac: "24:fd:0d:7b:04:7b" },
  { name: "CAM40", ip: "10.70.40.40", serial: null, patrimony: null, mac: null },
  { name: "CAM41", ip: "10.70.40.41", serial: "73KG0501881Q8", patrimony: "28328", mac: "58:10:8c:9e:5b:2f" },
  { name: "CAM42", ip: "10.70.40.42", serial: "4VEI0203484D2", patrimony: "9168", mac: "24:fd:0d:65:5a:84" },
  { name: "CAM43", ip: "10.70.40.43", serial: "4VEI0203482VF", patrimony: "9169", mac: "24:fd:0d:65:5a:86" },
  { name: "CAM44", ip: "10.70.40.44", serial: "4VEI02027432E", patrimony: "9159", mac: "24:fd:0d:65:0d:59" },
  { name: "CAM51", ip: "10.70.40.51", serial: null, patrimony: null, mac: null },
  { name: "CAM52", ip: "10.70.40.52", serial: null, patrimony: null, mac: null },
  { name: "CAM53", ip: "10.70.40.53", serial: null, patrimony: null, mac: null },
  { name: "CAM54", ip: "10.70.40.54", serial: null, patrimony: null, mac: null },
  { name: "CAM55", ip: "10.70.40.55", serial: null, patrimony: null, mac: null },
  { name: "CAM171 : Portão I", ip: "10.70.40.171", serial: "4VEI0800374O3", patrimony: "9157", mac: "24:fd:0d:7b:04:74" },
  { name: "CAM172 : Portão II", ip: "10.70.40.172", serial: "4VEI0800371V1", patrimony: "9756", mac: "24:fd:0d:7b:04:77" },
  { name: "CAM173 : Portão Rua", ip: "10.70.40.173", serial: "4VEI0803493S0", patrimony: "9166", mac: "24:fd:0d:7b:11:52" },
  { name: "CAM174 : Portão Tendas", ip: "10.70.40.174", serial: "4VEI0202745TG", patrimony: "9161", mac: "24:fd:0d:65:0d:5a" },
  { name: "CAM181 - Placas", ip: "10.70.40.181", serial: "4VEH5101548UW", patrimony: null, mac: "24:fd:0d:62:14:68" },
  { name: "CAM182 - Estacionamento", ip: "10.70.40.182", serial: "4VEI0800331A6", patrimony: null, mac: "24:fd:0d:7b:04:7e" },
  { name: "CAM183 - Ginásio", ip: "10.70.40.183", serial: "4VEI0800336CT", patrimony: null, mac: "24:fd:0d:7b:04:83" },
  { name: "CAM186 : Est I", ip: "10.70.40.186", serial: "73KG0501889WQ", patrimony: "3453", mac: "58:10:8c:9e:5b:30" },
  { name: "CAM187 : Est II", ip: "10.70.40.187", serial: "73KG0501884BM", patrimony: "3441", mac: "58:10:8c:9e:5b:2b" },
  { name: "CAM188 : Est III", ip: "10.70.40.188", serial: "73KG06006246T", patrimony: "3461", mac: "58:10:8c:9f:d9:99" },
  { name: "CAM185 : Est IV", ip: "10.70.40.185", serial: "73KG0501888GG", patrimony: "3455", mac: "58:10:8c:9e:5b:32" }
];

async function main() {
  for (const cam of cameras) {
    // Insert into Camera for monitoring
    const camId = `cam-${cam.ip.replace(/\./g, '-')}`;
    await prisma.camera.upsert({
      where: { ip: cam.ip },
      update: { 
        name: cam.name, 
        location: cam.name,
        mac: cam.mac,
        serial: cam.serial
      },
      create: {
        id: camId,
        name: cam.name,
        ip: cam.ip,
        location: cam.name,
        mac: cam.mac,
        serial: cam.serial,
        status: "Online"
      }
    });

    // Insert into InventoryItem
    await prisma.inventoryItem.create({
      data: {
        name: cam.name,
        ip: cam.ip,
        macAddress: cam.mac,
        serialNumber: cam.serial,
        patrimony: cam.patrimony,
        location: cam.name,
        model: "Câmera IP"
      }
    });
  }
  console.log(`\n\n✅ ${cameras.length} Câmeras inseridas com sucesso no Banco de Dados!\n\n`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
