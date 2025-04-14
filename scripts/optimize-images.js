import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const optimizeImage = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error);
  }
};

const processDirectory = async (dir) => {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
      const outputPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      await optimizeImage(filePath, outputPath);
    }
  }
};

processDirectory(path.join(__dirname, '../src/assets'))
  .then(() => console.log('Image optimization complete'))
  .catch(console.error); 