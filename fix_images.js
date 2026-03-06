import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEB_DIR = path.join(__dirname, 'public', 'logos');
const MOBILE_DIR = path.join(__dirname, 'lich-tong-hop-mobile', 'assets', 'logos');

async function fixImages() {
  console.log('Fixing image formats...');
  
  const files = fs.readdirSync(WEB_DIR).filter(f => f.endsWith('.png'));
  
  for (const file of files) {
    const filePath = path.join(WEB_DIR, file);
    const mobilePath = path.join(MOBILE_DIR, file);
    
    try {
      // Read buffer, force conversion to strict PNG, overwrite
      const buffer = fs.readFileSync(filePath);
      
      const pngBuffer = await sharp(buffer)
        .png()
        .toBuffer();
        
      fs.writeFileSync(filePath, pngBuffer);
      fs.copyFileSync(filePath, mobilePath);
      
      console.log(`Fixed: ${file}`);
    } catch (e) {
      console.error(`Error fixing ${file}: ${e.message}`);
    }
  }
}

fixImages();
