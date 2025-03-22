const { execSync } = require('child_process');
const path = require('path');

// Path to electron executable
const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron.cmd');
// Path to main.js
const mainPath = path.join(__dirname, 'dist', 'main', 'main.js');

console.log(`Electron path: ${electronPath}`);
console.log(`Main path: ${mainPath}`);
console.log('Attempting direct launch...');

try {
  execSync(`"${electronPath}" "${mainPath}"`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error launching app:', error);
}
