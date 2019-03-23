const {writeFileSync, mkdirSync, accessSync} = require('fs')
const path = require('path')

function createFile(mypath, data) {
    const dir = path.dirname(mypath)
    try {
        accessSync(dir)
    } catch(e) {
        mkdirSync(dir)
        try {
            accessSync(dir)
        } catch(err) {
            throw err;
        }
    }
    writeFileSync(mypath, data)
}

module.exports = {
    createFile
}