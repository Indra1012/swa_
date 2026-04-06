const fs = require('fs');
const path = require('path');

function getTree(dir, indent = '') {
  let res = '';
  try {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
      if (f === 'node_modules' || f === '.git' || f === '.claude' || f === 'dist') return;
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        res += `${indent}📁 ${f}\n`;
        res += getTree(full, indent + '  ');
      } else {
        res += `${indent}📄 ${f}\n`;
      }
    });
  } catch (e) {
    res += `${indent}Error reading ${dir}\n`;
  }
  return res;
}

const out = `Client:\n\n${getTree('client')}\nServer:\n\n${getTree('server')}`;
fs.writeFileSync('tree_output.txt', out);
console.log('Done');
