import { app, BrowserWindow, ipcMain, protocol, session } from 'electron';
import * as path from 'path';
import { registerIpcHandlers } from './ipc';

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

  // Comment out CSP temporarily for debugging
  /*
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'"]
      }
    });
  });
  */

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
 * Initialize the application
 */
app.whenReady().then(() => {
  // Set CSP to allow external images
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"]
      }
    });
  });
  
  // Register a protocol for serving local files
  protocol.registerFileProtocol('local', (request, callback) => {
    const url = request.url.substr(8);
    callback({ path: url });
  });
  
  createWindow();
  registerIpcHandlers();
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
