import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy _redirects and 404.html files to dist folder for Render deployment
const filesToCopy = [
  { src: 'public/_redirects', dest: 'dist/_redirects' },
  { src: 'public/404.html', dest: 'dist/404.html' }
];

filesToCopy.forEach(({ src, dest }) => {
  const source = path.join(__dirname, src);
  const destination = path.join(__dirname, dest);

  try {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`✅ ${src} copied to ${dest}`);
    } else {
      console.log(`⚠️ ${src} not found`);
    }
  } catch (error) {
    console.error(`❌ Error copying ${src}:`, error);
  }
});