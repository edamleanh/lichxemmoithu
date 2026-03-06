import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEB_DIR = path.join(__dirname, 'public', 'logos');
const MOBILE_DIR = path.join(__dirname, 'lich-tong-hop-mobile', 'assets', 'logos');

async function fixToSvg() {
  console.log('Renaming pseudo PNGs to SVG...');
  
  const files = fs.readdirSync(WEB_DIR).filter(f => f.endsWith('.png'));
  
  for (const file of files) {
    const webPath = path.join(WEB_DIR, file);
    const mobilePath = path.join(MOBILE_DIR, file);
    
    try {
      // Check head for XML string
      const buffer = fs.readFileSync(webPath);
      const isXml = buffer.toString('utf-8', 0, 5) === '<?xml' || buffer.toString('utf-8', 0, 4) === '<svg';
      
      if (isXml) {
        const svgWebPath = webPath.replace('.png', '.svg');
        const svgMobilePath = mobilePath.replace('.png', '.svg');
        
        fs.renameSync(webPath, svgWebPath);
        fs.renameSync(mobilePath, svgMobilePath);
        
        console.log(`Renamed to SVG: ${file}`);
      }
    } catch (e) {
      console.error(`Error fixing ${file}: ${e.message}`);
    }
  }
}

fixToSvg();
