"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { Menu, shell, app } = require('electron');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const selectFolder = require('./selectFolder');
module.exports = (outdatedVersion, cacheDir, app, sharedFolderClient) => {
    const isMac = process.platform === 'darwin';
    const template = [
        ...(isMac ? [{
                label: app.name,
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            }] : []),
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open Folder',
                    click: () => __awaiter(void 0, void 0, void 0, function* () {
                        selectFolder().then((folder) => {
                            sharedFolderClient(folder);
                            config.write({ sharedFolder: folder });
                        }).catch(console.log);
                    })
                },
                isMac ? { role: 'close' } : { role: 'quit' },
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                    { type: 'separator' },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startspeaking' },
                            { role: 'stopspeaking' }
                        ]
                    }
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ])
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ] : [
                    { role: 'close' }
                ])
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: () => __awaiter(void 0, void 0, void 0, function* () {
                        shell.openExternal('https://remix-ide.readthedocs.io');
                    })
                },
                {
                    label: 'Medium Posts',
                    click: () => __awaiter(void 0, void 0, void 0, function* () {
                        shell.openExternal('https://medium.com/remix-ide');
                    })
                },
                {
                    label: 'Community Discussions',
                    click: () => __awaiter(void 0, void 0, void 0, function* () {
                        shell.openExternal('https://gitter.im/ethereum/remix');
                    })
                },
                {
                    label: 'Remix in StackExchange.com',
                    click: () => __awaiter(void 0, void 0, void 0, function* () {
                        shell.openExternal('https://ethereum.stackexchange.com/questions/tagged/remix');
                    })
                },
                {
                    label: 'Check Releases',
                    click: () => __awaiter(void 0, void 0, void 0, function* () {
                        shell.openExternal('https://github.com/ethereum/remix-desktop/releases');
                    })
                },
                {
                    label: 'Report Bugs / Issues',
                    click: () => __awaiter(void 0, void 0, void 0, function* () {
                        shell.openExternal('https://github.com/ethereum/remix-ide/issues');
                    })
                },
                { role: 'toggledevtools' },
                {
                    label: 'Clear the cache and restart Remix',
                    click: () => __awaiter(void 0, void 0, void 0, function* () {
                        deleteFolderRecursive(cacheDir);
                        app.relaunch();
                        app.exit(0);
                    })
                },
            ]
        }
    ];
    if (outdatedVersion) {
        template.push({
            label: 'New Release Available',
            submenu: [
                {
                    label: 'Remix Desktop release page',
                    click: () => __awaiter(void 0, void 0, void 0, function* () {
                        shell.openExternal('https://github.com/ethereum/remix-desktop/releases');
                    })
                },
            ]
        });
    }
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
};
const deleteFolderRecursive = function (directoryPath) {
    try {
        if (fs.existsSync(directoryPath)) {
            fs.readdirSync(directoryPath).forEach((file, index) => {
                const curPath = path.join(directoryPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    deleteFolderRecursive(curPath);
                }
                else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(directoryPath);
            console.log(directoryPath + ' deleted');
        }
    }
    catch (e) {
        console.error(e);
    }
};
//# sourceMappingURL=applicationMenu.js.map