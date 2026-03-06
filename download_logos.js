import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALORANT_LOGOS = {
  "sentinels": "https://owcdn.net/img/60cedbff184c0.png",
  "paper rex": "https://owcdn.net/img/620023ee45c71.png",
  "prx": "https://owcdn.net/img/620023ee45c71.png",
  "gen.g": "https://owcdn.net/img/63e1d163e79bd.png",
  "geng": "https://owcdn.net/img/63e1d163e79bd.png",
  "team heretics": "https://owcdn.net/img/63de5eedac14e.png",
  "heretics": "https://owcdn.net/img/63de5eedac14e.png",
  "fnatic": "https://owcdn.net/img/63d21ebdeeee4.png",
  "fnc": "https://owcdn.net/img/63d21ebdeeee4.png",
  "loud": "https://owcdn.net/img/6211cb73f1dcb.png",
  "karmine corp": "https://owcdn.net/img/63d414902ec28.png",
  "kc": "https://owcdn.net/img/63d414902ec28.png",
  "natus vincere": "https://owcdn.net/img/63de656f71d18.png",
  "navi": "https://owcdn.net/img/63de656f71d18.png",
  "drx": "https://owcdn.net/img/627fdb962ffab.png",
  "t1": "https://owcdn.net/img/63de801b65e9d.png",
  "100 thieves": "https://owcdn.net/img/6056d0bd192c7.png",
  "nrg": "https://owcdn.net/img/63def07de0044.png",
  "nrg esports": "https://owcdn.net/img/63def07de0044.png",
  "cloud9": "https://owcdn.net/img/5f480393f0b2f.png",
  "c9": "https://owcdn.net/img/5f480393f0b2f.png",
  "leviatan": "https://owcdn.net/img/61fc37c4d57fe.png",
  "bilibili gaming": "https://owcdn.net/img/64620f4ae91ca.png",
  "blg": "https://owcdn.net/img/64620f4ae91ca.png",
  "edward gaming": "https://owcdn.net/img/63def55938d87.png",
  "edg": "https://owcdn.net/img/63def55938d87.png",
  "fpx": "https://owcdn.net/img/663c780df2446.png",
  "funplus phoenix": "https://owcdn.net/img/663c780df2446.png",
  "zeta division": "https://owcdn.net/img/6122d21bc699b.png",
  "zeta": "https://owcdn.net/img/6122d21bc699b.png",
  "team liquid": "https://owcdn.net/img/63de5fc442971.png",
  "liquid": "https://owcdn.net/img/63de5fc442971.png",
  "tl": "https://owcdn.net/img/63de5fc442971.png",
  "kru esports": "https://owcdn.net/img/601878d65cfc1.png",
  "kru": "https://owcdn.net/img/601878d65cfc1.png",
  "team secret": "https://owcdn.net/img/613ba249f05ac.png",
  "secret": "https://owcdn.net/img/613ba249f05ac.png",
  "talon esports": "https://owcdn.net/img/64299b8206152.png",
  "talon": "https://owcdn.net/img/64299b8206152.png",
  "rex regum qeon": "https://owcdn.net/img/63de816db73cc.png",
  "rrq": "https://owcdn.net/img/63de816db73cc.png",
  "global esports": "https://owcdn.net/img/63de7f3b890a8.png",
  "ge": "https://owcdn.net/img/63de7f3b890a8.png",
  "bleed esports": "https://owcdn.net/img/63870e28d9c2f.png",
  "bleed": "https://owcdn.net/img/63870e28d9c2f.png",
  "detonation focusme": "https://owcdn.net/img/63def21a4f005.png",
  "dfm": "https://owcdn.net/img/63def21a4f005.png",
  "furia": "https://owcdn.net/img/63dbf1cdd7d29.png",
  "mibr": "https://owcdn.net/img/63deeda20efac.png",
  "evil geniuses": "https://owcdn.net/img/63deef898f7e2.png",
  "eg": "https://owcdn.net/img/63deef898f7e2.png",
  "g2 esports": "https://owcdn.net/img/656e1b6f0e9b9.png",
  "g2": "https://owcdn.net/img/656e1b6f0e9b9.png",
  "team vitality": "https://owcdn.net/img/63de60c0420df.png",
  "vitality": "https://owcdn.net/img/63de60c0420df.png",
  "vit": "https://owcdn.net/img/63de60c0420df.png",
  "bbl esports": "https://owcdn.net/img/60cf532788eeb.png",
  "bbl": "https://owcdn.net/img/60cf532788eeb.png",
  "fut esports": "https://owcdn.net/img/63de635fd4ab1.png",
  "fut": "https://owcdn.net/img/63de635fd4ab1.png",
  "tbg": "https://owcdn.net/img/63de64619b0ce.png",
  "koi": "https://owcdn.net/img/63df3cc77f394.png",
  "trace esports": "https://owcdn.net/img/66881bcdeb5b0.png",
  "teg": "https://owcdn.net/img/66881bcdeb5b0.png",
  "nova esports": "https://owcdn.net/img/651f8a7eacd45.png",
  "nova": "https://owcdn.net/img/651f8a7eacd45.png",
  "wolves esports": "https://owcdn.net/img/651f8a8bb231b.png",
  "jd gaming": "https://owcdn.net/img/6632f1737eaaa.png",
  "jdg": "https://owcdn.net/img/6632f1737eaaa.png",
  "all gamers": "https://owcdn.net/img/660c1844e13cd.png",
  "ag": "https://owcdn.net/img/660c1844e13cd.png",
  "titan esports club": "https://owcdn.net/img/660a9f0ee2d77.png",
  "tec": "https://owcdn.net/img/660a9f0ee2d77.png",
  "dragon ranger gaming": "https://owcdn.net/img/660c18544f8f4.png",
  "drg": "https://owcdn.net/img/660c18544f8f4.png",
  "gentle mates": "https://owcdn.net/img/6561dbba6e665.png",
  "m8": "https://owcdn.net/img/6561dbba6e665.png",
  "rogue": "https://owcdn.net/img/656cd61a8f9df.png"
};

const WEB_DIR = path.join(__dirname, 'public', 'logos');
const MOBILE_DIR = path.join(__dirname, 'lich-tong-hop-mobile', 'assets', 'logos');

[WEB_DIR, MOBILE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const uniqueUrlMap = new Map();
for (const [teamName, url] of Object.entries(VALORANT_LOGOS)) {
  const filename = url.split('/').pop();
  uniqueUrlMap.set(url, filename);
}

const downloadImage = async (url, filepath) => {
  // Use direct owcdn.net with forged vlr.gg headers!
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Referer': 'https://www.vlr.gg/',
      'Origin': 'https://www.vlr.gg',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    }
  });

  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
  
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(arrayBuffer));
};

async function run() {
  console.log(`Starting download of ${uniqueUrlMap.size} unique logos...`);
  
  for (const [url, filename] of uniqueUrlMap.entries()) {
    try {
      const webPath = path.join(WEB_DIR, filename);
      await downloadImage(url, webPath);
      
      const mobilePath = path.join(MOBILE_DIR, filename);
      fs.copyFileSync(webPath, mobilePath);
      
      console.log(`Downloaded: ${filename}`);
      
      // Delay slightly between requests
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error(`Error downloading ${url}: ${e.message}`);
    }
  }
  console.log('Done!');
}

run();
