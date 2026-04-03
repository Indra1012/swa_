const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../');

function replaceInFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.js', '.jsx', '.html', '.css'].includes(ext) && !filePath.endsWith('index.html')) return;
  if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('dist')) return;

  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/\bwellness\b/g, 'wellbeing')
    .replace(/\bWellness\b/g, 'Wellbeing')
    .replace(/\bWELLNESS\b/g, 'WELLBEING');

  // Also replace without word boundaries just in case (like in class names wellbeing-section)
  newContent = newContent
    .replace(/wellbeing-/g, 'wellbeing-')
    .replace(/Wellbeing-/g, 'Wellbeing-')
    .replace(/-wellbeing/g, '-wellbeing')
    .replace(/-Wellbeing/g, '-Wellbeing');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDirs(dir) {
  if (!fs.existsSync(dir)) return;
  if (fs.statSync(dir).isFile()) {
    replaceInFile(dir);
    return;
  }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('node_modules') || fullPath.includes('.git')) continue;
    if (fs.statSync(fullPath).isDirectory()) {
      walkDirs(fullPath);
    } else {
      replaceInFile(fullPath);
    }
  }
}

console.log('Starting global replacement...');
walkDirs(path.join(__dirname, '../../client/src'));
walkDirs(path.join(__dirname, '../../client/index.html'));
walkDirs(path.join(__dirname, '../../server'));
console.log('Done.');
