module.exports = (sharedFolderClient, folder) => {
    console.log('set folder', folder, sharedFolderClient.sharedFolder)
    sharedFolderClient.sharedFolder(folder, false)
    sharedFolderClient.setupNotifications(folder)
}
