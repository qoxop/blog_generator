const {writeFileSync, mkdirSync, accessSync} = require('fs')

function createFile(mypath, data) {
    const dir = dirname(mypath)
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