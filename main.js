const { app, BrowserWindow, Tray, Menu, screen, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const APP_URL = 'https://prompt-forge-shubham.lovable.app';
const BUBBLE_SIZE = 72;
const PANEL_WIDTH = 400;
const PANEL_HEIGHT = 600;

let bubbleWindow = null;
let panelWindow = null;
let tray = null;

// --- The small floating icon — this is what's always on screen ---
function createBubble() {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  bubbleWindow = new BrowserWindow({
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    x: sw - BUBBLE_SIZE - 24,
    y: sh - BUBBLE_SIZE - 24,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  bubbleWindow.setAlwaysOnTop(true, 'screen-saver'); // stays above fullscreen apps/games too
  bubbleWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  bubbleWindow.loadFile('bubble.html');
}

// --- The actual Prompt Forge app — hidden until you click the bubble ---
function createPanel() {
  panelWindow = new BrowserWindow({
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    show: false,
    frame: true,
    alwaysOnTop: true,
    webPreferences: { contextIsolation: true },
  });
  panelWindow.setAlwaysOnTop(true, 'screen-saver');
  panelWindow.loadURL(APP_URL);

  panelWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      panelWindow.hide();
    }
  });
}

function togglePanel() {
  if (!panelWindow) createPanel();

  if (panelWindow.isVisible()) {
    panelWindow.hide();
    return;
  }

  // Pop the panel out right next to wherever the bubble currently is
  const b = bubbleWindow.getBounds();
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  let x = b.x - PANEL_WIDTH + BUBBLE_SIZE;
  let y = b.y - PANEL_HEIGHT - 12;
  x = Math.max(8, Math.min(x, sw - PANEL_WIDTH - 8));
  if (y < 0) y = Math.min(b.y + BUBBLE_SIZE + 12, sh - PANEL_HEIGHT - 8);

  panelWindow.setBounds({ x, y, width: PANEL_WIDTH, height: PANEL_HEIGHT });
  panelWindow.show();
  panelWindow.focus();
}

// --- Remove / restore the bubble — this is the "you can turn it off" option ---
function hideBubble() {
  if (bubbleWindow) bubbleWindow.hide();
  if (panelWindow) panelWindow.hide();
}

function showBubble() {
  if (!bubbleWindow) createBubble();
  else bubbleWindow.show();
}

function quitApp() {
  app.isQuitting = true;
  app.quit();
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
  tray.setToolTip('Prompt Forge');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Show bubble', click: showBubble },
      { label: 'Hide bubble', click: hideBubble },
      { type: 'separator' },
      { label: 'Quit', click: quitApp },
    ])
  );
}

ipcMain.on('toggle-panel', togglePanel);
ipcMain.on('move-bubble-by', (event, dx, dy) => {
    if (!bubbleWindow) return;
    const [x, y] = bubbleWindow.getPosition();
    bubbleWindow.setPosition(x + dx, y + dy);
});
ipcMain.on('show-context-menu', () => {
  Menu.buildFromTemplate([
    { label: 'Hide bubble', click: hideBubble },
    { type: 'separator' },
    { label: 'Quit', click: quitApp },
  ]).popup();
});

app.whenReady().then(() => {
  createBubble(); // visible on launch by default — this is the requirement
  createPanel();
  createTray();

  try {
        autoUpdater.checkForUpdatesAndNotify();
  } catch (err) {
        console.error('Auto-update check failed:', err);
  }
});

// Don't quit when a window closes — keep living via the bubble/tray so it
// can be reopened. Only "Quit" from the right-click menu or tray exits.
app.on('window-all-closed', () => {});

app.on('activate', () => {
  if (!bubbleWindow) createBubble();
});
