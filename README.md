# Prompt Forge — Desktop Bubble

A small floating smiling icon (🙂) that sits on top of everything on your screen — games, Chrome, movies, whatever — and opens Prompt Forge when you click it.

## What it does
- On launch: a small round icon appears in the bottom-right corner, **always on top**, across every app and workspace
- **Drag** it anywhere on screen
- **Click** it → the Prompt Forge panel pops open right next to it
- **Click again** → panel closes, bubble stays
- **Right-click** the bubble → "Hide bubble" (removes it from screen) or "Quit"
- Tray icon (system tray / menu bar) → bring the bubble back after hiding it, or quit fully

## Requirements
- [Node.js](https://nodejs.org) installed (v18+)

## Run it (development mode)
```bash
cd prompt-forge-desktop
npm install
npm start
```

## Build a real installer
```bash
npm run dist
```
Output lands in `dist/`:
- Windows → `.exe` (NSIS installer)
- Mac → `.dmg`
- Linux → `.AppImage`

Build **on the OS you're installing on** — a `.dmg` needs to be built on a Mac, an `.exe` on Windows (or via Wine on Linux, which can be finicky). Since it's unsigned, expect an "unknown publisher" warning on first install — that's normal for a personal app; click through it.

## Files
- `main.js` — window/bubble/panel/tray logic
- `bubble.html` — the floating icon itself
- `preload.js` — safe bridge between the icon's click/right-click and the main process
- `assets/icon.png` — tray + app icon (placeholder — swap for your own)

## Customizing
- Bubble size / panel size → `BUBBLE_SIZE`, `PANEL_WIDTH`, `PANEL_HEIGHT` in `main.js`
- Bubble look (color, emoji/icon) → `bubble.html`
- Which URL opens in the panel → `APP_URL` in `main.js`
- Auto-start on login → add the `auto-launch` npm package, register it in `app.whenReady()`

## Next: Android
Same "always-on-screen bubble" concept on Android uses the **same UX pattern as Messenger's chat heads** — a native Android app (Kotlin, not this codebase) requesting the "draw over other apps" (`SYSTEM_ALERT_WINDOW`) permission, which the user grants once in Settings. That's a separate project — say the word and I'll start it.

## Getting real Windows .exe / Mac .dmg installers
This repo already includes `.github/workflows/build.yml` which builds all three platforms in the cloud for free via GitHub Actions (this is the standard way to cross-build Electron apps — Windows needs Wine, Mac needs actual Mac tooling, neither of which most dev machines have).

1. Push this folder to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Prompt Forge desktop bubble"
   gh repo create prompt-forge-desktop --private --source=. --push
   ```
   (or create the repo on github.com and `git remote add origin ...` + `git push`)
2. Go to the repo's **Actions** tab → the "Build Desktop Installers" workflow runs automatically on push (or click "Run workflow" to trigger manually)
3. Wait ~3-5 minutes → open the finished run → under **Artifacts**, download:
   - `prompt-forge-windows-latest` → contains the `.exe`
   - `prompt-forge-macos-latest` → contains the `.dmg`
   - `prompt-forge-ubuntu-latest` → contains the `.AppImage`
