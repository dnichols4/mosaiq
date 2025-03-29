const { execSync } = require('child_process');
const path = require('path');

// Display output
function log(message) {
  console.log(`\x1b[36m${message}\x1b[0m`);
}

log('Building common-ui package...');
try {
  execSync('npm run build', { 
    cwd: path.join(__dirname, '../packages/common-ui'),
    stdio: 'inherit'
  });
  log('common-ui package built successfully');
} catch (error) {
  console.error('Error building common-ui:', error);
  process.exit(1);
}
