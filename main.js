const fs = require('fs')
const remixd = require('@remix-project/remixd')
const utils = remixd.utils
const path = require('path')
const os = require('os')
const fetch = require('node-fetch')
const semver = require('semver')
const IPFS = require('ipfs')
const IPFSGateway = require('ipfs-http-gateway')

const { version } = require('./package.json')
const applicationMenu = require('./applicationMenu')
const { app, BrowserWindow, shell } = require('electron')
const { AppManager, registerPackageProtocol } = require('electron-app-manager')

const cacheDir = path.join(os.homedir(), '.cache_remix_ide')
registerPackageProtocol(cacheDir)

const remixIdeUrl = 'package://6fd22d6fe5549ad4c4d8fd3ca0b7816b.mod'

async function warnLatestVersion (current) {
  const res = await fetch('https://api.github.com/repos/ethereum/remix-desktop/releases/latest')
  let latest = (await res.json()).tag_name
  latest = latest.indexOf('v') === 0 ? latest.replace('v', '') : latest
  let ret = ''
  console.log(latest, current)
  if (semver.eq(latest, current)) {
    console.log('\x1b[32m%s\x1b[0m', `[INFO] you are using the latest version ${latest}`)
    ret = 'OK'
  } else if (semver.gt(latest, current)) {
    console.log('\x1b[33m%s\x1b[0m', `[WARN] latest version of remix-desktop is ${latest}, you are using ${current}`)
    console.log('\x1b[33m%s\x1b[0m', `[WARN] please download the latest version:`)
    console.log('\x1b[33m%s\x1b[0m', `[WARN] https://github.com/ethereum/remix-desktop/releases`)
    ret = 'OUTDATED'
  }
  return ret
}

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

let sharedFolderClient = new remixd.services.sharedFolder()
let slitherClient = new remixd.services.SlitherClient() 
let hardhatClient = new remixd.services.HardhatClient() 
const services = {
  hardhat: () => { 
    hardhatClient.options.customApi = {}
    return hardhatClient
  },
  slither: () => { 
    slitherClient.options.customApi = {}
    return slitherClient
  },
  folder: () => { 
    sharedFolderClient.options.customApi = {}
    return sharedFolderClient
  }
}

const setupApplicationMenu = async () => {
  let status = ""
  try {
    status = await warnLatestVersion(version)
  } catch (e) {
    console.log('unable to verify latest version')
    console.log(e)
  }
  applicationMenu(status === 'OUTDATED', (folder) => {
    sharedFolderClient.sharedFolder(folder, false)
    sharedFolderClient.setupNotifications(folder)
    slitherClient.sharedFolder(folder)
    hardhatClient.sharedFolder(folder)
  })
}


// Similar object is also defined in websocket.ts
const ports = {
  git: 65521,
  hardhat: 65522,
  slither: 65523,
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
      client.sharedFolder(currentFolder)
      client.setupNotifications(currentFolder)
    })
    
    startService('slither', (ws, client) => {
      client.setWebSocket(ws)
      client.sharedFolder(currentFolder)
    })

    startService('hardhat', (ws, client) => {
      client.setWebSocket(ws)
      client.sharedFolder(currentFolder)
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

app.on('ready', () => {
  setupApplicationMenu()
  remixdStart()
  createWindow()
  ipfsStart()
})
