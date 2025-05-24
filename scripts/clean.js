const fs = require('fs');
const path = require('path');
// glob is no longer needed if we explicitly delete
// const glob = require('glob');

/**
 * Clean up build artifacts within a directory recursively
 * Using fs.rmSync for more robust deletion
 */
function cleanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  // Use fs.rmSync with recursive and force options for directory removal
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    // console.log(`Removed directory: ${dirPath}`); // Optional: log removed directories
  } catch (error) {
     console.error(`Error removing directory ${dirPath}:`, error); // Log if directory removal fails
  }
}

/**
 * Delete a specific file
 * Using fs.rmSync for more robust deletion
 */
function cleanFile(filePath) {
    if (!fs.existsSync(filePath)) {
        // console.log(`File not found: ${filePath}`); // Optional: log if not found
        return;
    }
    try {
        // Use fs.rmSync with force option for file removal
        fs.rmSync(filePath, { force: true }); // force: true attempts to ignore errors
        console.log(`Deleted: ${filePath}`);
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
    }
}


// Get the project root directory (one level up from 'scripts')
const projectRoot = path.join(__dirname, '..');

console.log('Starting cleanup...');

// 1. Clean the root dist directory (if it exists)
const rootDistDir = path.join(projectRoot, 'dist');
console.log(`Cleaning root dist directory: ${rootDistDir}`);
cleanDirectory(rootDistDir); // Use the updated cleanDirectory function

// 2. Clean the root tsconfig.tsbuildinfo file (if it exists)
const rootTsBuildInfo = path.join(projectRoot, 'tsconfig.tsbuildinfo');
console.log(`Cleaning root tsconfig.tsbuildinfo file: ${rootTsBuildInfo}`);
cleanFile(rootTsBuildInfo); // Use the new cleanFile function


// 3. Clean packages dist directories and explicit tsconfig.tsbuildinfo files within packages
const packagesDir = path.join(projectRoot, 'packages'); // Use projectRoot to find packages
if (fs.existsSync(packagesDir)) {
  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const pkg of packages) {
    const packagePath = path.join(packagesDir, pkg); // Get the full path to the package directory

    // Clean the dist directory for the current package
    const packageDistDir = path.join(packagePath, 'dist');
    console.log(`Cleaning package dist directory: ${packageDistDir}`);
    cleanDirectory(packageDistDir); // Use the updated cleanDirectory function

    // Explicitly clean the tsconfig.tsbuildinfo file at the root of the current package
    const packageTsBuildInfo = path.join(packagePath, 'tsconfig.tsbuildinfo');
    console.log(`Cleaning package tsconfig.tsbuildinfo file: ${packageTsBuildInfo}`);
    cleanFile(packageTsBuildInfo); // Use the new cleanFile function
  }
} else {
    console.warn(`Packages directory not found at ${packagesDir}`);
}

console.log('Cleanup complete');
