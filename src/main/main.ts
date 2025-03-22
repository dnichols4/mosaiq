import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import * as path from 'path';
import { registerIpcHandlers } from './ipc';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: process.env.NODE_ENV === 'production',
    },
  });

  // In development, load from localhost
  // In production, load from local file
  // Always load from file for the PoC
  const rendererPath = path.join(__dirname, '../renderer/index.html');
  console.log('Loading renderer from:', rendererPath);
  mainWindow.loadFile(rendererPath);
  
  // Always open DevTools for the PoC
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
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
