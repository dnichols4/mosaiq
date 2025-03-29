const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

// Build TypeScript
console.log('Building TypeScript...');
try {
  execSync('npx tsc', { 
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('TypeScript build completed');
} catch (error) {
  console.error('TypeScript build failed');
  process.exit(1);
}

// Copy CSS files recursively
console.log('Copying CSS files...');

// Function to copy CSS files recursively
function copyStylesRecursive(sourceDir, targetDir) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Read all items in the source directory
  const items = fs.readdirSync(sourceDir, { withFileTypes: true });

  // Process each item
  for (const item of items) {
    const srcPath = path.join(sourceDir, item.name);
    const destPath = path.join(targetDir, item.name);

    if (item.isDirectory()) {
      // Recursively process directories
      copyStylesRecursive(srcPath, destPath);
    } else if (item.name.endsWith('.css')) {
      // Copy CSS files
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcPath} to ${destPath}`);
    }
  }
}

// Start the recursive copy process from src/components
copyStylesRecursive(
  path.join(__dirname, 'src', 'components'),
  path.join(__dirname, 'dist', 'components')
);

console.log('CSS files copied successfully');
console.log('Build completed successfully');
