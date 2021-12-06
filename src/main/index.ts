import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { DashboardService } from './DashboardService'
import { MonerodService } from './MonerodService'
import { TrayService } from './TrayService'

app.disableHardwareAcceleration()

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
let moneroService = new MonerodService()
const dashboardService = new DashboardService()

async function bootstrap() {
  if (moneroService.getMonerodFilepath() === undefined) {
    moneroService.askMonerodFilePath()
  }

  const trayManager = new TrayService(moneroService)

  if (trayManager.getAutostart() === true && moneroService.getMonerodFilepath() !== undefined) {
    await moneroService.startDaemon()
  }

  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
    },
  })

  // note: your contextMenu, Tooltip and Title code will go here!

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  } else {
    const pkg = await import('../../package.json')
    const url = `http://${pkg.env.HOST || '127.0.0.1'}:${pkg.env.PORT}`

    win.loadURL(url)
    // win.maximize()
    // win.webContents.openDevTools()
  }
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

ipcMain.on('get-monero-message', (event, arg) => {
    moneroService.monerodLatestData$.subscribe(data => {
      event.reply('get-monero-reply', data)
    })
})

ipcMain.on('set-timer-message', (event, arg) => {
  console.log(arg)
  dashboardService.setTimer(arg)
})

ipcMain.on('get-timer-message', (event, arg) => {
  dashboardService.timer$.subscribe(newTimer => {
    event.reply('get-timer-message-reply', newTimer)
  })
})

ipcMain.on('set-monero-switch', async (event, arg) => {
  if (arg === true) {
    await moneroService.startDaemon()
  } else if (arg === false) {
    await moneroService.stopDaemon()
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
