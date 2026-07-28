import fs from 'fs';
import path from 'path';

const imagesDir = path.resolve('public/images');
const outputFile = path.resolve('public/images/manifest.json');

const files = fs.readdirSync(imagesDir)
  .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));

fs.writeFileSync(outputFile, JSON.stringify(files, null, 2));
console.log(`Manifest dibuat: ${files.length} gambar ditemukan`);