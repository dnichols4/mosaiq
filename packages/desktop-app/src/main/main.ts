import { app, BrowserWindow, ipcMain, protocol, session } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { registerIpcHandlers } from './ipc';
import { AdapterFactory } from './adapters/AdapterFactory';

// Configure cache settings to prevent disk cache errors
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disk-cache-dir', path.join(app.getPath('userData'), 'Cache'));

let mainWindow: BrowserWindow | null = null;

/**
 * Create the main application window
 */
function createWindow() {
  console.log('Creating window...');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
  });

  // CSP is set in app.whenReady() to avoid conflicts

  // Load the renderer
  const rendererPath = path.join(__dirname, '../renderer/index.html');
  console.log('Loading renderer from:', rendererPath);
  mainWindow.loadFile(rendererPath);
  
  // Add error handler
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorDescription);
  });
  
  // Enable developer tools for debugging
  mainWindow.webContents.openDevTools();
  
  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Ensure required resources are available
 * Checks if model resources are available
 */
async function ensureResources() {
  // Ensure models directory exists
  const modelsDir = path.join(app.getAppPath(), 'resources', 'models');
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }
  
  // Ensure MiniLM model directory exists
  const miniLMDir = path.join(modelsDir, 'minilm');
  if (!fs.existsSync(miniLMDir)) {
    fs.mkdirSync(miniLMDir, { recursive: true });
  }
  
  // Check if model files are available
  const modelFiles = ['model.onnx', 'vocab.txt', 'config.json'];
  let missingFiles = false;
  
  for (const file of modelFiles) {
    const modelFile = path.join(miniLMDir, file);
    if (!fs.existsSync(modelFile)) {
      missingFiles = true;
      console.warn(`Model file ${file} not found. Classification will not work until models are installed.`);
    }
  }
  
  return !missingFiles;
}

/**
 * Initialize the application
 */
app.whenReady().then(async () => {
  // Set comprehensive CSP that allows inline scripts and external images
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:;"]
      }
    });
  });
  
  // Register a protocol for serving local files
  protocol.registerFileProtocol('local', (request, callback) => {
    const url = request.url.substr(8);
    callback({ path: url });
  });
  
  // Ensure required resources are available
  await ensureResources();
  
  createWindow();
  
  // Register IPC handlers (which will initialize classification)
  await registerIpcHandlers();
  
  console.log('Application initialized');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('quit', async () => {
  // Clean up resources
  await AdapterFactory.releaseResources();
});
