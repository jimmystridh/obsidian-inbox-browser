const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Inbox operations
  loadInbox: () => ipcRenderer.invoke('load-inbox'),
  
  // Metadata operations
  fetchMetadata: (url) => ipcRenderer.invoke('fetch-metadata', url),
  
  // Item processing
  processItem: (action, item) => ipcRenderer.invoke('process-item', action, item),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // File change listener
  onInboxFileChanged: (callback) => {
    ipcRenderer.on('inbox-file-changed', callback);
    return () => ipcRenderer.removeListener('inbox-file-changed', callback);
  }
});