[![Join the chat at https://gitter.im/ethereum/remix](https://badges.gitter.im/ethereum/remix.svg)](https://gitter.im/ethereum/remix?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Remix Desktop
**Remix Desktop** is an Electron version of Remix IDE.  It works on Linux, Windows, & Macs.

It is not a web app - but like the name says, it is a desktop app.  To find out more about Remix IDE - please go to the Remix-project repo.

### Download
To download this desktop version of Remix IDE, See releases: [https://github.com/ethereum/remix-desktop/releases](https://github.com/ethereum/remix-desktop/releases)

## The differences between Remix Desktop & Remix IDE - the web app
### Accessing your hard drive
Remix IDE - the web app, works in a browser and as such, has some inherent limitations accessing your computer's file system. Remix Desktop, is not a web app - so accessing your filesystem is easy.  This is not to say that Remix - the web app cannot access you filesystem,but you need to have the NPM package **remixd** running to make the bridge between your browser and a selected folder on your computer.

Saving and accessing files saved on your computer are the big advantage of Remix Desktop.  You clone repos to a folder on your hard drive and select the Remix Desktop working directory.
**IMAGE NEEDED**

### Deploying to a public testnet with Injected Web3 & Metamask
Remix Desktop does not have access to the Metamask - the browser plugin - so deploying to a public chain currently involves using the Wallet Connect plugin

## Updates to Remix IDE & Updates to Remix Desktop
Please check subscribe to our Twitter feed @EthereumRemix - so we can alert you when you need to download a new version of Remix Desktop.  We also post announcements in our gitter chat: https://gitter.im/ethereum/remix

## Where to go to for help
Please post your questions to: https://gitter.im/ethereum/remix

## Reporting issues
For posting issues - you can alert us in the gitter chat - or post the issue to this repo.