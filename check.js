const fs = require('fs');
const path = require('path');

// Check main.js file
const mainPath = path.join(__dirname, 'dist', 'main', 'main.js');
console.log(`Checking if file exists: ${mainPath}`);
console.log(`File exists: ${fs.existsSync(mainPath)}`);

// List directory contents
const dirPath = path.join(__dirname, 'dist', 'main');
console.log(`\nListing directory: ${dirPath}`);
try {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    console.log(file);
  });
} catch (err) {
  console.error(`Error reading directory: ${err.message}`);
}
