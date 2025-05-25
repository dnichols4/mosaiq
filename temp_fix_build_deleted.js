const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 Fixing desktop-app build issue...');

const desktopAppPath = path.join(__dirname, 'packages', 'desktop-app');

try {
  // Change to desktop-app directory
  process.chdir(desktopAppPath);
  
  // Clear existing build artifacts
  console.log('📁 Clearing build cache...');
  if (fs.existsSync('tsconfig.main.tsbuildinfo')) {
    fs.unlinkSync('tsconfig.main.tsbuildinfo');
  }
  if (fs.existsSync('dist/main')) {
    fs.rmSync('dist/main', { recursive: true, force: true });
  }
  
  // Try to compile with verbose output
  console.log('🔨 Attempting TypeScript compilation...');
  try {
    const output = execSync('npx tsc -p tsconfig.main.json --listFiles --noEmitOnError false', 
      { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ TypeScript compilation succeeded!');
    console.log(output);
  } catch (error) {
    console.log('❌ TypeScript compilation failed:');
    console.log(error.stdout);
    console.log(error.stderr);
    
    // Try alternative compilation without project references
    console.log('🔄 Trying compilation without project references...');
    try {
      execSync('npx tsc src/main/*.ts --outDir dist/main --module commonjs --target es2020 --esModuleInterop --skipLibCheck --declaration --declarationMap --sourceMap', 
        { encoding: 'utf8' });
      console.log('✅ Alternative compilation succeeded!');
    } catch (altError) {
      console.log('❌ Alternative compilation also failed:');
      console.log(altError.message);
    }
  }
  
  // Check if main.js now exists
  if (fs.existsSync('dist/main/main.js')) {
    console.log('✅ main.js file now exists!');
    console.log('🚀 You can now run npm start');
  } else {
    console.log('❌ main.js still missing. Manual intervention needed.');
  }
  
} catch (error) {
  console.error('💥 Fix script failed:', error.message);
}
