const { exec } = require('child_process');
const path = require('path');

// Simple workaround: transpile the main.ts file directly
exec('npx tsc src/main/main.ts --outDir dist/main --module commonjs --target es2020 --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck', 
  { cwd: 'packages/desktop-app' }, 
  (error, stdout, stderr) => {
    if (error) {
      console.error('Compilation error:', error);
      return;
    }
    if (stderr) {
      console.error('TypeScript warnings:', stderr);
    }
    console.log('Main file compiled successfully');
    console.log(stdout);
  });
