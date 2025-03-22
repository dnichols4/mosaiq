const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Display output
function log(message) {
  console.log(`\x1b[36m${message}\x1b[0m`);
}

// Clean first
log('Cleaning dist directory...');
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  try {
    execSync('node clean.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Build main process
log('Building main process...');
try {
  execSync('npx tsc -p tsconfig.main.json', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building main process:', error);
  process.exit(1);
}

// Build renderer process
log('Building renderer process...');
try {
  execSync('npx webpack --mode production', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building renderer process:', error);
  process.exit(1);
}

// Copy CSS to dist folder
log('Copying assets...');
if (!fs.existsSync(path.join(__dirname, 'dist/renderer'))) {
  fs.mkdirSync(path.join(__dirname, 'dist/renderer'), { recursive: true });
}

try {
  fs.copyFileSync(
    path.join(__dirname, 'src/renderer/styles.css'),
    path.join(__dirname, 'dist/renderer/styles.css')
  );
  log('CSS copied successfully');
} catch (error) {
  console.error('Error copying CSS:', error);
}

// Create storage directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'storage'))) {
  fs.mkdirSync(path.join(__dirname, 'storage'), { recursive: true });
  log('Created storage directory');
}

log('Build completed successfully!');
log('Run the app with: npm start');
