const fs = require('fs');
const os = require('os');

const platfrom = os.platform()
function deepWatch(dirname, callback = console.log) {
    fs.watch(dirname, callback);
    if (fs.statSync(dirname).isDirectory()) {
        const files = fs.readdirSync(dirname, { withFileTypes: true})
        files.forEach(dirent => {
            if (dirent.isDirectory()) {
                deepWatch(dirname, callback)
            }
        })
    }
}

module.exports = function(pathInfo, generateHtmlFiles, copyAssets, reloadHanders) {
    let timeOutId
    const generateFiles = () => {
        clearTimeout(timeOutId);
        generateHtmlFiles();
        copyAssets();
        timeOutId = setTimeout(() => {
            reloadHanders.forEach(h => {
                try {
                    h()
                } catch(err) {
                    
                }
            })
        }, 1000)
    }
    const {inputPath, srcPath, assetsPath} = pathInfo;
    if(platfrom === 'darwin' || platfrom === 'win32') {
        fs.watch(inputPath, {recursive: true}, generateFiles);
        fs.watch(srcPath, {recursive: true}, generateFiles);
        fs.watch(assetsPath, {recursive: true}, generateFiles)
    } else {
        deepWatch(inputPath, generateFiles);
        deepWatch(srcPath, generateFiles);
        deepWatch(assetsPath, generateFiles);
    }
}