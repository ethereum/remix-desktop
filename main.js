const remixd = require('remixd')
const path = require('path')
const os = require('os')
const IPFS = require('ipfs')
const IPFSGateway = require('ipfs-http-gateway')

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
  win.loadURL('package://github.com/ethereum/remix-project')

  // Modify the user agent for all requests to the following urls.
  const filter = {
    urls: ['https://*.dyn.plugin.remixproject.org/ipfs/*']
  }
  let hashes = {}
  win.webContents.session.webRequest.onBeforeRequest(filter, (details, callback) => {
    let { url } = details;
    var reg = /dyn.plugin.remixproject.org\/ipfs\/(.*)/
    var regResult = reg.exec(url)
    const hash = regResult[1]
    hashes[hash] = url
    url = `http://localhost:5001/ipfs/${regResult[1]}`      
    callback({
      cancel: false,
      url: ( encodeURI(url ) )
    })
  })  
    
  win.webContents.session.webRequest.onErrorOccurred((details) => {
    console.error(details)
  })
}

app.on('ready', () => {
  remixdStart()
  createWindow()
  ipfsStart()
})

let remixdStart = () => {
  const remixIdeUrl = 'package://6fd22d6fe5549ad4c4d8fd3ca0b7816b.mod'
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
