const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bubbleAPI', {
  togglePanel: () => ipcRenderer.send('toggle-panel'),
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
    moveWindowBy: (dx, dy) => ipcRenderer.send('move-bubble-by', dx, dy),
});
