const { spawn } = require('child_process');
const path = require('path');
const electron = require('electron');

console.log('Starting Electron...');
console.log('Path:', path.join(__dirname, 'dist/main/main.js'));

const proc = spawn(electron, ['.'], { stdio: 'inherit' });

proc.on('close', (code) => {
  console.log(`Electron process exited with code ${code}`);
});
