const fs = require('fs');
const path = require('path');

// Create dist/components directory if it doesn't exist
const componentsDir = path.join(__dirname, 'dist', 'components');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

// Copy CSS files from src/components to dist/components
const srcComponentsDir = path.join(__dirname, 'src', 'components');
fs.readdirSync(srcComponentsDir).forEach(file => {
  if (file.endsWith('.css')) {
    const srcPath = path.join(srcComponentsDir, file);
    const destPath = path.join(componentsDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcPath} to ${destPath}`);
  }
});

console.log('CSS files copied successfully');
