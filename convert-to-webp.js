// Script to convert images to WebP format
// Run: node convert-to-webp.js
// Requires: npm install sharp

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);


const assetsDir = './src/assets';

// Images to convert (excluding SVG files)
const imagesToConvert = [
  'about-us.jpg',
  'back2.jpg',
  'founder.jpg',
  'ledger.jpg',
  'logo.png',
  'logoc.png',
  'office1.jpg',
  'office2.jpg',
  'office3.jpg',
  'oldpic_founder.jpg',
  'orders.png',
  'trucks.jpg'
];

async function convertToWebP() {
  console.log('Starting WebP conversion...\n');
  
  for (const image of imagesToConvert) {
    const inputPath = path.join(assetsDir, image);
    const outputName = image.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = path.join(assetsDir, outputName);
    
    try {
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      console.log(`✓ Converted: ${image} -> ${outputName}`);
    } catch (error) {
      console.error(`✗ Failed to convert ${image}:`, error.message);
    }
  }
  
  console.log('\nConversion complete!');
  console.log('\nNow update your imports in the code to use .webp files.');
}

convertToWebP();
