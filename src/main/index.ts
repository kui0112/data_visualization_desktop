import { app, shell, BrowserWindow, ipcMain, session, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as path from 'node:path'
import * as fs from 'node:fs'
import * as ini from 'ini'

const defaultConfig = {
  maxIteration: 1000000,
  dark: false,
  displayOrder: 'zh_en_image',
  displayDuration: 8,
  subtitleLanguage: 'zh_en',
  vectorDisplayDuration: 8,
  pictureDisplayDuration: 8,
  pictureSubtitleAnimInterval: 0.25
}

async function createWindow(): Promise<void> {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      // 自动播放无需用户交互
      autoplayPolicy: 'no-user-gesture-required',
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  const reload = () => {
    // const bounds = mainWindow.getBounds()
    // mainWindow.webContents.reload()
    mainWindow.webContents.reloadIgnoringCache()
    // mainWindow.setBounds(bounds)
    // mainWindow.webContents.send('reload')
  }

  // 创建菜单
  const template = [
    {
      label: 'Home',
      click: () => {
        mainWindow.webContents.send('switch', 'Home')
      }
    },
    {
      label: 'KnowledgeGraph',
      click: () => {
        mainWindow.webContents.send('switch', 'KnowledgeGraph')
      }
    },
    {
      label: 'VectorAnimation',
      click: () => {
        mainWindow.webContents.send('switch', 'VectorAnimation')
      }
    },
    {
      label: 'Pictures',
      click: () => {
        mainWindow.webContents.send('switch', 'Pictures')
      }
    },
    {
      label: 'CameraView',
      click: () => {
        mainWindow.webContents.send('switch', 'CameraView')
      }
    },
    {
      label: 'Reload',
      click: () => {
        reload()
      }
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // 窗口最大化
  mainWindow.maximize()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 处理权限请求，总是允许
  session.defaultSession.setPermissionRequestHandler((_, __, callback) => {
    callback(true)
  })

  // 读取配置文件
  const cwd = process.cwd()
  const file = is.dev ? path.join(cwd, '/config.ini') : path.join(cwd, '/resources/config.ini')
  const contents = await fs.promises.readFile(file, 'utf-8')
  const cfg = {}
  const obj = ini.parse(contents)
  Object.entries(obj).forEach(([_, value]) => {
    Object.assign(cfg, value)
  })

  // 处理进程间通信
  ipcMain.handle('appConfig', () => {
    return {
      ...defaultConfig,
      ...cfg
    }
  })

  ipcMain.handle('isFullScreen', () => {
    return mainWindow.isFullScreen()
  })
  ipcMain.handle('setFullScreen', (_, flag: boolean) => {
    mainWindow.setFullScreen(flag)
  })
  ipcMain.handle('reloadSilently', () => {
    reload()
  })
  ipcMain.handle('openDevTools', () => {
    mainWindow.webContents.openDevTools({ mode: 'undocked' })
  })
  ipcMain.handle('closeDevTools', () => {
    mainWindow.webContents.closeDevTools()
  })
  ipcMain.handle('openNav', () => {
    mainWindow.setMenuBarVisibility(true)
  })
  ipcMain.handle('closeNav', () => {
    mainWindow.setMenuBarVisibility(false)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

