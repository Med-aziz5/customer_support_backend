// fix-imports.js
const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Replace import paths to match file casing
      content = content.replace(
        /require\(['"]\.\/middlewares\/verifyjwt['"]\)/gi,
        "require('./middlewares/verifyJWT')",
      );
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  });
};

walk('.');
console.log('Imports fixed!');
