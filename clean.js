const fs = require('fs');
const path = require('path');

function deleteFolderRecursive(pathToDelete) {
  if (fs.existsSync(pathToDelete)) {
    fs.readdirSync(pathToDelete).forEach((file) => {
      const curPath = path.join(pathToDelete, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursive call
        deleteFolderRecursive(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(pathToDelete);
    console.log(`Deleted: ${pathToDelete}`);
  }
}

// Clean the dist directory
console.log('Cleaning dist directory...');
deleteFolderRecursive(path.join(__dirname, 'dist'));
console.log('Clean complete!');
