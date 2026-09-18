import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LAB_109_DATA = [
  { name: "IBD10901P9090", mac: "d4:5d:df:09:d5:93", ip: "10.70.60.11" },
  { name: "IBD10902P9091", mac: "10:05:01:9c:7d:34", ip: "10.70.60.12" },
  { name: "IBD10903P9089", mac: "d4:5d:df:09:d4:a9", ip: "10.70.60.13" },
  { name: "IBD10904P9088", mac: "d4:5d:df:09:d4:b9", ip: "10.70.60.14" },
  { name: "IBD10905P9087", mac: "d4:5d:df:09:d5:a4", ip: "10.70.60.15" },
  { name: "IBD10906P9086", mac: "d4:5d:df:09:d5:9c", ip: "10.70.60.16" },
  { name: "IBD10907P9085", mac: "d4:5d:df:09:d6:65", ip: "10.70.60.17" },
  { name: "IBD10908P9084", mac: "d4:5d:df:09:d5:96", ip: "10.70.60.18" },
  { name: "IBD10909P9069", mac: "10:05:01:9c:7c:a9", ip: "10.70.60.19" },
  { name: "IBD10910P9071", mac: "10:05:01:9c:7d:87", ip: "10.70.60.20" },
  { name: "IBD10911P9073", mac: "10:05:01:9c:7d:80", ip: "10.70.60.21" },
  { name: "IBD10912P9075", mac: "d4:5d:df:09:d4:b8", ip: "10.70.60.22" },
  { name: "IBD10913P9076", mac: "d4:5d:df:09:d6:88", ip: "10.70.60.23" },
  { name: "IBD10914P9079", mac: "d4:5d:df:09:d6:6a", ip: "10.70.60.24" },
  { name: "IBD10915P9080", mac: "d4:5d:df:09:d5:8d", ip: "10.70.60.25" },
  { name: "IBD10916P9082", mac: "d4:5d:df:09:d4:b2", ip: "10.70.60.26" },
  { name: "IBD10917P9083", mac: "d4:5d:df:09:d4:c7", ip: "10.70.60.27" },
  { name: "IBD10918P9081", mac: "d4:5d:df:09:d4:ca", ip: "10.70.60.28" },
  { name: "IBD10919P9078", mac: "d4:5d:df:09:d4:bb", ip: "10.70.60.29" },
  { name: "IBD10920P9077", mac: "10:05:01:9c:7d:c7", ip: "10.70.60.30" },
  { name: "IBD10921P9074", mac: "d4:5d:df:09:d6:67", ip: "10.70.60.31" },
  { name: "IBD10922P9072", mac: "d4:5d:df:09:d4:ac", ip: "10.70.60.32" },
  { name: "IBD10923P9070", mac: "d4:5d:df:09:d6:54", ip: "10.70.60.33" },
  { name: "IBD10924P9068", mac: "d4:5d:df:09:d6:82", ip: "10.70.60.34" },
  { name: "IBD10925P9066", mac: "d4:5d:df:09:d6:6d", ip: "10.70.60.35" },
  { name: "IBD10926P", mac: "d4:5d:df:09:d4:af", ip: "10.70.60.36" },
  { name: "IBD10927P9052", mac: "d4:5d:df:09:d5:90", ip: "10.70.60.37" },
  { name: "IBD10928P9062", mac: "10:05:01:9c:7c:95", ip: "10.70.60.38" },
  { name: "IBD10929P9059", mac: "d4:5d:df:09:d4:7f", ip: "10.70.60.39" },
  { name: "IBD10930P9057", mac: "d4:5d:df:09:d1:b3", ip: "10.70.60.40" },
  { name: "IBD10931P9053", mac: "d4:5d:df:09:d6:76", ip: "10.70.60.41" },
  { name: "IBD10932P9055", mac: "10:05:01:9c:7e:d7", ip: "10.70.60.42" },
  { name: "IBD10933P9054", mac: "d4:5d:df:09:d4:b3", ip: "10.70.60.43" },
  { name: "IBD10934P9056", mac: "10:05:01:9c:7d:ca", ip: "10.70.60.44" },
  { name: "IBD10935P9058", mac: "d4:5d:df:09:d6:59", ip: "10.70.60.45" },
  { name: "IBD10936P9060", mac: "d4:5d:df:09:d6:78", ip: "10.70.60.46" },
  { name: "IBD10937P9037", mac: "10:05:01:9c:7d:a3", ip: "10.70.60.47" },
  { name: "IBD10938P9063", mac: "d4:5d:df:09:d5:8a", ip: "10.70.60.48" },
  { name: "IBD10939P9064", mac: "d4:5d:df:09:d4:9a", ip: "10.70.60.49" },
  { name: "IBD10940P9067", mac: "10:05:01:9c:7d:c1", ip: "10.70.60.50" },
  { name: "IBD10900P9045", mac: "d4:5d:df:09:d5:99", ip: "10.70.60.218" },
];

const LAB_308_DATA = [
  { name: "IBD30801P193879", mac: "60:c7:27:09:23:47", ip: "10.70.60.91" },
  { name: "IBD30802P193861", mac: "60:c7:27:09:23:34", ip: "10.70.60.92" },
  { name: "IBD30803P193873", mac: "d8:cb:8a:dc:95:d1", ip: "10.70.60.93" },
  { name: "IBD30804P196862", mac: "60:c7:27:09:15:7c", ip: "10.70.60.94" },
  { name: "IBD30805P193874", mac: "60:c7:27:09:15:f6", ip: "10.70.60.95" },
  { name: "IBD30806P193868", mac: "60:c7:27:09:22:e8", ip: "10.70.60.96" },
  { name: "IBD30807P193880", mac: "60:c7:27:09:15:9c", ip: "10.70.60.97" },
  { name: "IBD30808P193875", mac: "d8:cb:8a:dc:96:06", ip: "10.70.60.98" },
  { name: "IBD30809P172764", mac: "5c:60:ba:b1:5a:96", ip: "10.70.60.99" },
  { name: "IBD30810P172748", mac: "5c:60:ba:b1:3a:cb", ip: "10.70.60.100" },
  { name: "IBD30811P193869", mac: "60:c7:27:09:15:97", ip: "10.70.60.101" },
  { name: "IBD30812P193872", mac: "60:c7:27:09:15:b0", ip: "10.70.60.102" },
  { name: "IBD30813P93878", mac: "60:c7:27:09:15:96", ip: "10.70.60.103" },
  { name: "IBD30814P193871", mac: "60:c7:27:09:15:eb", ip: "10.70.60.104" },
  { name: "IBD30815P193866", mac: "60:c7:27:09:15:a0", ip: "10.70.60.105" },
  { name: "IBD30816P193882", mac: "60:c7:27:09:15:7b", ip: "10.70.60.106" },
  { name: "IBD30817P193865", mac: "60:c7:27:09:15:81", ip: "10.70.60.107" },
  { name: "IBD30818P193877", mac: "60:c7:27:09:15:c1", ip: "10.70.60.108" },
  { name: "IBD30819P193867", mac: "60:c7:27:09:23:8e", ip: "10.70.60.109" },
  { name: "IBD30820P193876", mac: "60:c7:27:09:15:91", ip: "10.70.60.110" },
  { name: "IBD30821P193860", mac: "d8:cb:8a:dc:96:02", ip: "10.70.60.111" },
  { name: "IBD30822P193883", mac: "60:c7:27:09:15:ad", ip: "10.70.60.112" },
  { name: "IBD30823P172753", mac: "5c:60:ba:b1:4a:cd", ip: "10.70.60.113" },
  { name: "IBD30824P172765", mac: "5c:60:ba:b1:5a:c9", ip: "10.70.60.114" },
  { name: "IBD30825P172758", mac: "5c:60:ba:b1:5a:b5", ip: "10.70.60.115" },
  { name: "IBD30826P172747", mac: "5c:60:ba:b1:5a:df", ip: "10.70.60.116" },
  { name: "IBD30827P172750", mac: "5c:60:ba:b1:3a:94", ip: "10.70.60.117" },
  { name: "IBD30828P172751", mac: "5c:60:ba:b1:5a:97", ip: "10.70.60.118" },
  { name: "IBD30829P172761", mac: "5c:60:ba:b1:5a:cf", ip: "10.70.60.119" },
  { name: "IBD30830P172760", mac: "5c:60:ba:b1:5a:8c", ip: "10.70.60.120" },
  { name: "IBD30831P172754", mac: "5c:60:ba:b1:3a:c9", ip: "10.70.60.121" },
  { name: "IBD30832P172156", mac: "5c:60:ba:b1:5a:88", ip: "10.70.60.122" },
  { name: "IBD30833P172755", mac: "5c:60:ba:b1:5a:e2", ip: "10.70.60.123" },
  { name: "IBD30834P172752", mac: "5c:60:ba:b1:5a:9f", ip: "10.70.60.124" },
  { name: "IBD30835P172767", mac: "5c:60:ba:b1:5a:8f", ip: "10.70.60.125" },
  { name: "IBD30836P172759", mac: "5c:60:ba:b1:3a:81", ip: "10.70.60.126" },
  { name: "IBD30837P172757", mac: "5c:60:ba:b1:5a:ed", ip: "10.70.60.127" },
  { name: "IBD30838P172763", mac: "5c:60:ba:b1:3a:1b", ip: "10.70.60.128" },
  { name: "IBD30839P172762", mac: "5c:60:ba:b1:3a:05", ip: "10.70.60.129" },
  { name: "IBD30840P172749", mac: "5c:60:ba:b1:4a:3b", ip: "10.70.60.130" },
];

const LAB_110_DATA = [
  { name: "IBD11001P9251", mac: "10:62:e5:dd:e1:4f", ip: "10.70.60.51" },
  { name: "IBD11002P9248", mac: "10:62:e5:dd:80:fa", ip: "10.70.60.52" },
  { name: "IBD11003P9249", mac: "10:62:e5:dd:b1:67", ip: "10.70.60.53" },
  { name: "IBD11004P9261", mac: "10:62:e5:dd:f1:20", ip: "10.70.60.54" },
  { name: "IBD11005P9246", mac: "10:62:e5:dd:f1:3e", ip: "10.70.60.55" },
  { name: "IBD11006P9255", mac: "10:62:e5:dd:d1:af", ip: "10.70.60.56" },
  { name: "IBD11007P9250", mac: "10:62:e5:dd:12:51", ip: "10.70.60.57" },
  { name: "IBD11008P9247", mac: "10:62:e5:dd:b1:fd", ip: "10.70.60.58" },
  { name: "IBD11009P9262", mac: "10:62:e5:dd:e1:1d", ip: "10.70.60.59" },
  { name: "IBD11010P9236", mac: "10:62:e5:dd:f1:19", ip: "10.70.60.60" },
  { name: "IBD110119243", mac: "10:62:e5:dd:f1:7d", ip: "10.70.60.61" },
  { name: "IBD11012P9234", mac: "10:62:e5:dd:12:ae", ip: "10.70.60.62" },
  { name: "IBD11013P9233", mac: "10:62:e5:dd:f1:13", ip: "10.70.60.63" },
  { name: "IBD11014P9259", mac: "10:62:e5:dd:12:ca", ip: "10.70.60.64" },
  { name: "IBD11015P9253", mac: "10:62:e5:dd:12:5d", ip: "10.70.60.65" },
  { name: "IBD11016P9254", mac: "10:62:e5:dd:f1:1a", ip: "10.70.60.66" },
  { name: "IDB11017P9237X", mac: "10:62:e5:dd:12:ab", ip: "10.70.60.67" },
  { name: "IBD11018P9263", mac: "10:62:e5:dd:12:61", ip: "10.70.60.68" },
  { name: "IBD11019P9240", mac: "10:62:e5:dd:02:fb", ip: "10.70.60.69" },
  { name: "IBD11020P9256", mac: "10:62:e5:dd:12:b7", ip: "10.70.60.70" },
  { name: "IBD11021P9231", mac: "10:62:e5:dd:e1:46", ip: "10.70.60.71" },
  { name: "IBD11022P9235", mac: "10:62:e5:dd:12:cd", ip: "10.70.60.72" },
  { name: "IBD11023P9244", mac: "10:62:e5:dd:12:d0", ip: "10.70.60.73" },
  { name: "IBD11024P9264", mac: "10:62:e5:dd:12:52", ip: "10.70.60.74" },
  { name: "IBD11025P9257", mac: "10:62:e5:dd:c1:02", ip: "10.70.60.75" },
  { name: "IBD11026P9238", mac: "10:62:e5:dd:12:0f", ip: "10.70.60.76" },
  { name: "IBD11027P9239", mac: "10:62:e5:dd:b1:f7", ip: "10.70.60.77" },
  { name: "IBD11028P9238", mac: "10:62:e5:dd:02:f9", ip: "10.70.60.78" },
  { name: "IBD11029P9266", mac: "10:62:e5:dd:f1:7b", ip: "10.70.60.79" },
  { name: "IBD11030P9260", mac: "10:62:e5:dd:f1:58", ip: "10.70.60.80" },
  { name: "IBD11031P9229", mac: "10:62:e5:dd:12:95", ip: "10.70.60.81" },
  { name: "IDB11032P9232", mac: "10:62:e5:dd:12:5b", ip: "10.70.60.82" },
  { name: "IBD11033P9242", mac: "10:62:e5:dd:12:4c", ip: "10.70.60.83" },
  { name: "IBD11034P9241", mac: "10:62:e5:dd:12:bf", ip: "10.70.60.84" },
  { name: "IBD11035P9227", mac: "10:62:e5:dd:12:6d", ip: "10.70.60.85" },
  { name: "IBD11036P9230", mac: "10:62:e5:dd:e1:4c", ip: "10.70.60.86" },
  { name: "IBD11037P9252", mac: "10:62:e5:dd:e1:f3", ip: "10.70.60.87" },
  { name: "IBD11038P9229", mac: "10:62:e5:dd:12:7e", ip: "10.70.60.88" },
  { name: "IBD11039P9258", mac: "10:62:e5:dd:12:56", ip: "10.70.60.89" },
  { name: "IBD11040P9265", mac: "10:62:e5:dd:12:d5", ip: "10.70.60.90" },
  { name: "IBD11041P", mac: "", ip: "10.70.60.231" },
  { name: "IBD11000P193863", mac: "60:c7:27:09:15:86", ip: "10.70.60.219" },
];

const LAB_309_DATA = [
  { name: "IBD309P01179721", ip: "10.70.60.131", mac: "64:1c:67:69:5d:4a" },
  { name: "IBD30902P179737", ip: "10.70.60.132", mac: "64:1c:67:6a:24:f1" },
  { name: "IBD30903P179746", ip: "10.70.60.133", mac: "64:1c:67:68:e4:04" },
  { name: "IBD30904P179733", ip: "10.70.60.134", mac: "64:1c:67:6a:55:72" },
  { name: "IBD30905P179726", ip: "10.70.60.135", mac: "64:1c:67:6a:54:fd" },
  { name: "IBD30906P179727", ip: "10.70.60.136", mac: "64:1c:67:68:22:f0" },
  { name: "IBD30907P179760", ip: "10.70.60.137", mac: "64:1c:67:69:5b:7d" },
  { name: "IBD30908P179712", ip: "10.70.60.138", mac: "64:1c:67:6a:55:19" },
  { name: "IBD309P09179734", ip: "10.70.60.139", mac: "64:1c:67:69:5b:b4" },
  { name: "IBD309P10179761", ip: "10.70.60.140", mac: "64:1c:67:69:4f:d3" },
  { name: "IBD30911P179751", ip: "10.70.60.141", mac: "64:1c:67:69:5b:e0" },
  { name: "IBD30912P179752", ip: "10.70.60.142", mac: "64:1c:67:72:99:fb" },
  { name: "IBD30913P179729", ip: "10.70.60.143", mac: "64:1c:67:68:e3:35" },
  { name: "IBD30914P179752", ip: "10.70.60.144", mac: "64:1c:67:6a:54:82" },
  { name: "IBD30915P179758", ip: "10.70.60.145", mac: "64:1c:67:69:5d:17" },
  { name: "IBD30916P179713", ip: "10.70.60.146", mac: "64:1c:67:69:47:59" },
  { name: "IBD30917P179735", ip: "10.70.60.147", mac: "64:1c:67:68:e3:34" },
  { name: "IBD30918P179757", ip: "10.70.60.148", mac: "64:1c:67:68:e0:cf" },
  { name: "IBD30919179759", ip: "10.70.60.149", mac: "64:1c:67:69:4f:7b" },
  { name: "IBD30920179718", ip: "10.70.60.150", mac: "64:1c:67:69:5c:75" },
  { name: "IBD30921179731", ip: "10.70.60.151", mac: "64:1c:67:68:e5:11" },
  { name: "IBD30922P179741", ip: "10.70.60.152", mac: "64:1c:67:68:dc:3c" },
  { name: "IBD30923P179732", ip: "10.70.60.153", mac: "64:1c:67:69:5e:e9" },
  { name: "IBD30924P179743", ip: "10.70.60.154", mac: "64:1c:67:69:46:3e" },
  { name: "IBD30925179714", ip: "10.70.60.155", mac: "64:1c:67:68:e3:99" },
  { name: "IBD30926179722", ip: "10.70.60.156", mac: "64:1c:67:68:23:b9" },
  { name: "IBD30927179749", ip: "10.70.60.157", mac: "64:1c:67:6a:23:e8" },
  { name: "IBD30928179755", ip: "10.70.60.158", mac: "64:1c:67:6a:23:e8" },
  { name: "IBD30929P179723", ip: "10.70.60.159", mac: "64:1c:67:69:05:7a" },
  { name: "IBD30930P179724", ip: "10.70.60.160", mac: "64:1c:67:68:22:2c" },
  { name: "IBD30931P179756", ip: "10.70.60.161", mac: "64:1c:67:6a:2d:16" },
  { name: "IBD30932P179742", ip: "10.70.60.162", mac: "64:1c:67:69:46:0a" },
  { name: "IBD309P33179719", ip: "10.70.60.163", mac: "64:1c:67:6a:50:6e" },
  { name: "IBD30934P179744", ip: "10.70.60.164", mac: "64:1c:67:69:46:2e" },
  { name: "IBD309P35179750", ip: "10.70.60.165", mac: "64:1c:67:6a:54:a2" },
  { name: "IBD309P36179740", ip: "10.70.60.166", mac: "64:1c:67:6a:23:b0" },
  { name: "IBD30937P179753", ip: "10.70.60.167", mac: "64:1c:67:68:db:89" },
  { name: "IBD309P38179745", ip: "10.70.60.168", mac: "64:1c:67:69:05:91" },
  { name: "IBD30939P179716", ip: "10.70.60.169", mac: "64:1c:67:69:4e:e6" },
  { name: "IBD309P40179738", ip: "10.70.60.170", mac: "64:1c:67:69:5c:8c" },
  { name: "IBD30900P193859", ip: "10.70.60.221", mac: "60:c7:27:09:15:9d" },
];

async function main() {
  console.log("Iniciando importação de PCs...");
  let count = 0;

  const labs = [
    { id: "109", data: LAB_109_DATA },
    { id: "110", data: LAB_110_DATA },
    { id: "308", data: LAB_308_DATA },
    { id: "309", data: LAB_309_DATA },
  ];

  for (const lab of labs) {
    let index = 1;
    for (const pc of lab.data) {
      // Se não tiver IP, pulamos
      if (!pc.ip) continue;

      const id = `${lab.id}-PC${String(index).padStart(2, "0")}`; // Gerar ID único e legível
      index++;

      try {
        // Check if MAC is unique or if it exists on another PC
        // We use Upsert on ID mostly, but let's be careful with MAC constraints if any
        // Schema says: mac String @unique.
        // So if MAC exists on another ID, it will fail.
        // We'll update the existing record if MAC matches, or create new if ID is new.

        // Na verdade, upsert precisa de uma chave única no 'where'. O ID é a PK.
        // Se o MAC já existe em outro ID, vai dar erro.
        // Vamos tentar upsert pelo ID.

        // Normaliza MAC
        const cleanMac = pc.mac
          ? pc.mac.replace(/-/g, ":").toUpperCase()
          : `00:00:00:00:00:${index}`;

        await prisma.pC.upsert({
          where: { id: id },
          update: {
            name: pc.name,
            ip: pc.ip,
            mac: cleanMac,
            location: lab.id,
          },
          create: {
            id: id,
            name: pc.name,
            ip: pc.ip,
            mac: cleanMac,
            location: lab.id,
            status: "online",
          },
        });
        count++;
      } catch (e) {
        // Se falhar por constraint de unique no MAC (muito comum em dados brutos copiados)
        // Tenta encontrar quem tem esse MAC e atualizar ele
        if (e.code === "P2002") {
          console.log(
            `Conflito de MAC (${pc.mac}). Atualizando registro existente...`,
          );
          const existing = await prisma.pC.findUnique({
            where: { mac: pc.mac.toUpperCase() },
          });
          if (existing) {
            await prisma.pC.update({
              where: { id: existing.id },
              data: {
                name: pc.name,
                ip: pc.ip,
                location: lab.id,
              },
            });
            count++;
          }
        } else {
          console.error(`Erro ao importar ${pc.name}:`, e.message);
        }
      }
    }
  }

  console.log(`\nSucesso! ${count} PCs processados.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
