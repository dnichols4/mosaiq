const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Execute build process for all packages in the correct order
 */
function buildPackages() {
  try {
    console.log('Building all packages...');
    
    // First, clean any existing build artifacts
    execSync('node scripts/clean.js', { stdio: 'inherit' });
    
    // Build packages in the correct order to respect dependencies
    const buildOrder = [
      'platform-abstractions',
      'core',
      'common-ui',
      'desktop-app'
    ];
    
    for (const pkg of buildOrder) {
      console.log(`\nBuilding package: ${pkg}`);
      execSync(`npm run build -w packages/${pkg}`, { stdio: 'inherit' });
    }
    
    console.log('\nAll packages built successfully!');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

/**
 * Ensure all packages have node_modules symlinks
 */
function ensureNodeModules() {
  const packagesDir = path.join(__dirname, '..', 'packages');
  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const pkg of packages) {
    const nodeModulesPath = path.join(packagesDir, pkg, 'node_modules');
    
    // Skip if node_modules already exists
    if (fs.existsSync(nodeModulesPath)) {
      continue;
    }
    
    console.log(`Creating node_modules symlinks for ${pkg}...`);
    
    try {
      // Create directory if it doesn't exist
      fs.mkdirSync(nodeModulesPath, { recursive: true });
      
      // Create symlinks for all workspace packages
      for (const depPkg of packages) {
        if (depPkg !== pkg) {
          const symlinkPath = path.join(nodeModulesPath, `@mosaiq/${depPkg}`);
          const targetPath = path.join('..', '..', depPkg);
          
          // Ensure parent directory exists
          fs.mkdirSync(path.join(nodeModulesPath, '@mosaiq'), { recursive: true });
          
          // Create symlink
          fs.symlinkSync(targetPath, symlinkPath, 'junction');
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not create symlinks for ${pkg}:`, error.message);
    }
  }
}

// Ensure node_modules symlinks exist
ensureNodeModules();

// Build all packages
buildPackages();
