const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/tech-utility-icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

async function generateIcons() {
  const sizes = [192, 512];
  
  for (const size of sizes) {
    try {
      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, `../public/icon-${size}.png`));
      console.log(`Generated icon-${size}.png`);
    } catch (error) {
      console.error(`Error generating icon-${size}.png:`, error);
    }
  }
}

generateIcons().then(() => {
  console.log('Icon generation complete');
  process.exit(0);
}).catch((error) => {
  console.error('Icon generation failed:', error);
  process.exit(1);
});
