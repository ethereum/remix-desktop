const fs = require('fs')
const os = require('os')
const path = require('path')

const cacheDir = path.join(os.homedir(), '.cache_remix_ide')
const write = (data) => {
    const cache = read()
    try { 
        fs.writeFileSync(cacheDir + '/config.json', JSON.stringify({...cache, ...data}))
    } catch (e) { 
        console.error('Can\'t write config file', e)
    }
}

const read = () => {
    if(fs.existsSync(cacheDir + '/config.json')){
        try {
            const data = JSON.parse(fs.readFileSync(cacheDir + '/config.json'))
            return data
        }catch(e){
            console.error('Can\'t read config file', e)
        }
    }
    return undefined
}

exports.write = write
exports.read = read
