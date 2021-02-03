const remixd = require('@remix-project/remixd')
const path = require('path')
const os = require('os')
const IPFS = require('ipfs')
const IPFSGateway = require('ipfs-http-gateway')

const { version } = require('./package.json')
const applicationMenu = require('./applicationMenu')
const { app, BrowserWindow, shell } = require('electron')
const { AppManager, registerPackageProtocol } = require('electron-app-manager')

const cacheDir = path.join(os.homedir(), '.cache_remix_ide')
registerPackageProtocol(cacheDir)

const remixIdeUrl = 'package://6fd22d6fe5549ad4c4d8fd3ca0b7816b.mod'

console.log('running', version)
const updater = new AppManager({
  repository: 'https://github.com/ethereum/remix-desktop',
  auto: true,
  electron: true
})

function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'build/icon.png')
  })
  win.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  })
  win.loadURL('package://github.com/ethereum/remix-project')
  
  // Modify the user agent for all requests to the following urls.
  const filter = {
    urls: ['https://*.dyn.plugin.remixproject.org/ipfs/*']
  }
  let hashes = {}
  win.webContents.session.webRequest.onBeforeRequest(filter, (details, callback) => {
    let { url } = details;
    let reg = /dyn.plugin.remixproject.org\/ipfs\/(.*)/
    let regResult = reg.exec(url)
    const hash = regResult[1]
    hashes[hash] = url
    url = `http://localhost:5001/ipfs/${regResult[1]}`      
    callback({
      cancel: false,
      url: ( encodeURI(url ) )
    })
  })  
    
  win.webContents.session.webRequest.onErrorOccurred((details) => {
    // console.error(details)
  })
}

app.on('ready', () => {
  remixdStart()
  createWindow()
  ipfsStart()
})

let sharedFolderClient = new remixd.services.sharedFolder()
let gitClient = new remixd.services.GitClient() 
const services = {
  git: () => { 
    gitClient.options.customApi = {}
    return gitClient
  },
  folder: () => { 
    sharedFolderClient.options.customApi = {}
    return sharedFolderClient
  }
}

applicationMenu((folder) => {
  console.log('set folder', folder)
  sharedFolderClient.sharedFolder(folder, false)
  sharedFolderClient.setupNotifications(folder)
  gitClient.sharedFolder(folder, false)
})

const ports = {
  git: 65521,
  folder: 65520
}

function startService (service, callback) {
  try {
    const socket = new remixd.Websocket(ports[service], { remixIdeUrl }, () => services[service]())
    socket.start(callback)
  } catch (e) {
    console.error(e)
  }
}

let remixdStart = () => {
  console.log('start shared folder service')
  const currentFolder = process.cwd()
  try {
    startService('folder', (ws, client) => {
      client.setWebSocket(ws)
      client.sharedFolder(currentFolder, false)
      client.setupNotifications(currentFolder)
    })
    
    startService('git', (ws, client) => {
      client.setWebSocket(ws)
      client.sharedFolder(currentFolder, false)
    })
    
  } catch (error) {
    throw new Error(error)
  }
}

let ipfsStart = async () => {
  try {
    const repo = os.homedir() + '/.remix-ipfsnode'
    const node = await IPFS.create({
      repo,
      config: {
        Addresses: {
          Gateway: `/ip4/127.0.0.1/tcp/5001`
        }        
      }
    })
    const gateway = new IPFSGateway(node)
    const id = await node.id()
    gateway.start()
    console.log('ipfs node', id)
    console.log('ipfs node repo', repo)
  } catch (err) {
    console.error(err)
  }
}
