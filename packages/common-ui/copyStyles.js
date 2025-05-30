const fs = require('fs');
const path = require('path');

// Create dist/components directory if it doesn't exist
const componentsDir = path.join(__dirname, 'dist', 'components');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

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
