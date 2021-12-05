import { app, BrowserWindow } from 'electron'
import { MonerodService } from './MonerodService'
import { TrayService } from './TrayService'

app.disableHardwareAcceleration()

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
let moneroService = new MonerodService()

async function bootstrap() {
  if (moneroService.getMonerodFilepath() === undefined) {
    moneroService.askMonerodFilePath()
  }

  const trayManager = new TrayService(moneroService)  

  if (trayManager.getAutostart() === true && moneroService.getMonerodFilepath() !== undefined) {
    await moneroService.startDaemon()
  }


  // win = new BrowserWindow({
  //   webPreferences: {
  //     preload: path.join(__dirname, '../preload/index.cjs'),
  //   },
  // })



  // note: your contextMenu, Tooltip and Title code will go here!

  // if (app.isPackaged) {
  //   win.loadFile(path.join(__dirname, '../renderer/index.html'))
  // } else {
  //   const pkg = await import('../../package.json')
  //   const url = `http://${pkg.env.HOST || '127.0.0.1'}:${pkg.env.PORT}`

  //   win.loadURL(url)monerodLatestData
  //   win.maximize()
  //   win.webContents.openDevTools()
  // }
}

app.whenReady().then(bootstrap)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (win) {
    // someone tried to run a second instance, we should focus our window.
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

// @TODO
// auto update
/* if (app.isPackaged) {
  app.whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) =>
      // maybe you need to record some log files.
      console.error('Failed check update:', e)
    )
} */
