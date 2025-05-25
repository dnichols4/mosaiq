const fs = require('fs');
const path = require('path');

function cleanTsBuildInfo(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        cleanTsBuildInfo(filePath);
      } else if (file.endsWith('.tsbuildinfo')) {
        console.log('  Removing:', path.relative(projectRoot, filePath));
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    // Directory doesn't exist or can't be read, ignore
  }
}

console.log('🧹 Cleaning build artifacts...');

// Get project root (parent of scripts directory)
const projectRoot = path.dirname(__dirname);
console.log(`Project root: ${projectRoot}`);

// Clean each package
const packages = ['platform-abstractions', 'core', 'common-ui', 'desktop-app'];

packages.forEach(pkg => {
  const pkgPath = path.join(projectRoot, 'packages', pkg);
  
  if (!fs.existsSync(pkgPath)) {
    console.log(`⚠️  Package ${pkg} not found at ${pkgPath}, skipping...`);
    return;
  }
  
  console.log(`Cleaning ${pkg}...`);
  
  // Remove dist directories
  const distPath = path.join(pkgPath, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log(`  Removed ${path.relative(projectRoot, distPath)}`);
  }
  
  // Remove tsbuildinfo files
  cleanTsBuildInfo(pkgPath);
});

console.log('✅ Clean complete!');
