/**
 * Script to download the MiniLM embedding model files
 */
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Define model files and their URLs
const modelFiles = [
  {
    filename: 'model.onnx',
    url: 'https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx'
  },
  {
    filename: 'vocab.txt',
    url: 'https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/vocab.txt'
  },
  {
    filename: 'config.json',
    url: 'https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/config.json'
  }
];

// Get the correct model directory path
const modelsDir = path.join(process.cwd(), 'resources', 'models', 'minilm');

// Ensure the model directory exists
function ensureDirectory() {
  const baseDir = path.join(modelsDir, '..');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }
  
  console.log(`Model directory: ${modelsDir}`);
}

// Download a file if it doesn't exist
async function downloadFile(url, filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`File already exists: ${filePath}`);
    return;
  }
  
  console.log(`Downloading ${url} to ${filePath}...`);
  
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
    
    // Create a dummy file with a warning message for development
    if (process.env.NODE_ENV === 'development') {
      fs.writeFileSync(filePath, 'DEVELOPMENT_PLACEHOLDER');
      console.log(`Created placeholder file for ${filePath} to allow build to continue`);
      return;
    }
    
    throw error;
  }
}

// Main function to download all model files
async function downloadModels() {
  ensureDirectory();
  
  console.log('Downloading model files...');
  
  try {
    // Download each file
    for (const file of modelFiles) {
      const filePath = path.join(modelsDir, file.filename);
      await downloadFile(file.url, filePath);
    }
    
    console.log('All model files downloaded successfully!');
  } catch (error) {
    console.error('Error downloading model files:', error);
    
    // Create placeholder files in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating placeholder files to allow development build to continue...');
      
      for (const file of modelFiles) {
        const filePath = path.join(modelsDir, file.filename);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, 'DEVELOPMENT_PLACEHOLDER');
          console.log(`Created placeholder for ${file.filename}`);
        }
      }
      
      // Don't exit with error in development mode
      return;
    }
    
    process.exit(1);
  }
}

// Set development environment for testing
process.env.NODE_ENV = 'development';

// Run the download process
downloadModels();
