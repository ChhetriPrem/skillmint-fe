import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const TARGET_DOMAIN = 'https://localhost:3000';

// Get __dirname in ESModule
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex: matches `${process.env.BACKEND_URL}/api/...` in double quotes
  const regex = new RegExp(`"${TARGET_DOMAIN}(/api/[^"]*)"`, 'g');

  // Replace with template literal using process.env.BACKEND_URL
  const newContent = content.replace(regex, (_, apiPath) => {
    return `\`\${process.env.BACKEND_URL}${apiPath}\``;
  });

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (/\.(js|jsx)$/.test(fullPath)) {
      replaceInFile(fullPath);
    }
  });
}

// Start from the current directory
walk(path.resolve(__dirname, './'));

console.log('Done replacing backend URLs in .js and .jsx files!');
