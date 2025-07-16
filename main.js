const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.ico'), // You'll need to add an icon
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Connection',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-connection');
          }
        },
        { type: 'separator' },
        {
          label: 'Import Connections',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-import-connections', result.filePaths[0]);
            }
          }
        },
        {
          label: 'Export Connections',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-export-connections', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Dark Mode',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => {
            mainWindow.webContents.send('menu-toggle-theme');
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu-settings');
          }
        },
        {
          label: 'User Management',
          click: () => {
            mainWindow.webContents.send('menu-user-management');
          }
        },
        {
          label: 'Audit Logs',
          click: () => {
            mainWindow.webContents.send('menu-audit-logs');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About RDMasterX',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About RDMasterX',
              message: 'RDMasterX',
              detail: 'Remote Connection Manager v1.0.0\nBuilt with Electron, React, and Node.js'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
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

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-error-box', (event, title, content) => {
  dialog.showErrorBox(title, content);
});

// Handle connection launching
ipcMain.handle('launch-connection', async (event, connection) => {
  try {
    const { spawn } = require('child_process');
    
    switch (connection.type) {
      case 'rdp':
        // Launch RDP connection
        spawn('mstsc', [`/v:${connection.host}:${connection.port || 3389}`], {
          detached: true,
          stdio: 'ignore'
        });
        break;
      case 'ssh':
        // Launch SSH connection in Windows Terminal or default terminal
        spawn('wt', ['ssh', `${connection.username}@${connection.host}`, '-p', connection.port || '22'], {
          detached: true,
          stdio: 'ignore'
        });
        break;
      case 'vnc':
        // You would need a VNC client installed
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'VNC Connection',
          message: 'VNC connection feature requires a VNC client to be installed.',
          detail: `Host: ${connection.host}:${connection.port || 5900}`
        });
        break;
      case 'telnet':
        spawn('wt', ['telnet', connection.host, connection.port || '23'], {
          detached: true,
          stdio: 'ignore'
        });
        break;
      case 'web':
        // Open web URL in default browser
        const { shell } = require('electron');
        shell.openExternal(connection.url);
        break;
      default:
        throw new Error(`Unsupported connection type: ${connection.type}`);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
