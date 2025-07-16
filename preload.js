const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Dialog methods
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showErrorBox: (title, content) => ipcRenderer.invoke('show-error-box', title, content),
  
  // Connection methods
  launchConnection: (connection) => ipcRenderer.invoke('launch-connection', connection),
  
  // Menu event listeners
  onMenuNewConnection: (callback) => ipcRenderer.on('menu-new-connection', callback),
  onMenuImportConnections: (callback) => ipcRenderer.on('menu-import-connections', callback),
  onMenuExportConnections: (callback) => ipcRenderer.on('menu-export-connections', callback),
  onMenuToggleTheme: (callback) => ipcRenderer.on('menu-toggle-theme', callback),
  onMenuSettings: (callback) => ipcRenderer.on('menu-settings', callback),
  onMenuUserManagement: (callback) => ipcRenderer.on('menu-user-management', callback),
  onMenuAuditLogs: (callback) => ipcRenderer.on('menu-audit-logs', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
