const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const clientDir = path.join(root, 'client');
const distDir = path.join(root, 'dist', 'client');

function copyDir(source, destination) {
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

fs.rmSync(distDir, { recursive: true, force: true });
copyDir(path.join(clientDir, 'public'), distDir);
copyDir(path.join(clientDir, 'src'), path.join(distDir, 'src'));
console.log('Client build generated in dist/client');
