const fs = require('fs');
const path = require('path');

/**
 * Clean up build artifacts
 */
function cleanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  // Read directory contents
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  // Clean each entry
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively clean subdirectories
      cleanDirectory(fullPath);
      
      // Check if directory is now empty and can be removed
      const subEntries = fs.readdirSync(fullPath);
      if (subEntries.length === 0) {
        fs.rmdirSync(fullPath);
      }
    } else {
      // Remove file
      fs.unlinkSync(fullPath);
    }
  }
}

// Clean packages
const packagesDir = path.join(__dirname, '..', 'packages');
if (fs.existsSync(packagesDir)) {
  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const pkg of packages) {
    const distDir = path.join(packagesDir, pkg, 'dist');
    console.log(`Cleaning ${distDir}`);
    cleanDirectory(distDir);
  }
}

console.log('Cleanup complete');
