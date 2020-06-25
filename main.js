const remixd = require('remixd')
const path = require('path')
const os = require('os')

const { version } = require('./package.json')
const applicationMenu = require('./applicationMenu')
const { app, BrowserWindow, shell } = require('electron')
const { AppManager, registerPackageProtocol } = require('@philipplgh/electron-app-manager')

const cacheDir = path.join(os.homedir(), '.cache_remix_ide')
registerPackageProtocol(cacheDir)

console.log('running', version)
const updater = new AppManager({
  repository: 'https://github.com/ethereum/remix-desktop',
  auto: true,
  electron: true
})
const sharedFolderClient = new remixd.services.sharedFolder()

function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'build/icon.png')
  })
  applicationMenu(sharedFolderClient)
  win.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  })
  win.loadURL('package://github.com/ethereum/remix-ide')
}

app.on('ready', () => {
  remixdStart()
  createWindow()  
})

let remixdStart = () => {
  const remixIdeUrl = 'package://a7df6d3c223593f3550b35e90d7b0b1f.mod'
  console.log('start shared folder service')
  try {
    const websocketHandler = new remixd.Websocket(65520, { remixIdeUrl }, sharedFolderClient)

    websocketHandler.start((ws) => {
      console.log('set websocket')
      sharedFolderClient.setWebSocket(ws)
    })
  } catch (error) {
    throw new Error(error)
  }
}
