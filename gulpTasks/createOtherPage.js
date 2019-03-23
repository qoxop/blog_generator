const {join} = require('path')
const {about, home, tags} = require('../renderers/index');
const {createFile} = require('../util');
const {OUTPUT_PATH} = require('../meta')

function createPage(cb) {
    createFile(join(OUTPUT_PATH, './about.html'), about());
    createFile(join(OUTPUT_PATH, './index.html'), home());
    createFile(join(OUTPUT_PATH, './tags.html'), tags());
    cb()
}
module.exports = createPage;