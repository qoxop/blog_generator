const {clearStore} = require('../store')
const {createFile} = require('../util')
const {OUTPUT_PATH} = require('../meta')
const {join} = require('path')
const PAGE_SIZE = 10;

function createJsonData(cb) {
    const store = clearStore()
                    .sort((a1, a2) => (a1.updateTime > a2.updateTime ? 1 : -1))
                    .map(item => ({...item, html: undefined}));
    const allJson = JSON.stringify({data: store, total: store.length});
    createFile(join(OUTPUT_PATH, './json/all.json'), allJson);
    const pages = [];
    store.forEach((item, index) => {
        const pIndex = Math.floor(index/PAGE_SIZE);
        if (!pages[pIndex]) {
            pages[pIndex] = [];
        }
        pages[pIndex].push(item)
    })
    pages.forEach((item, index) => {
        createFile(
            join(OUTPUT_PATH, `./json/page_${index +1 }.json`),
            JSON.stringify({data: item, pageIndex: index + 1, pageSize: PAGE_SIZE})
        )
    });
    const groupByTags = store.reduce((obj, cur) => {
        if (cur.tags && cur.tags.length > 0) {
            cur.tags.forEach(tag => {
                if (!obj[tag]) obj[tag] = [];
                obj[tag].push(cur)
            })
        } else {
            obj.noTag.push(cur);
        }
        return obj;
    }, {noTag: []})
    const tagJson = JSON.stringify({data: groupByTags, total: store.length});
    createFile(OUTPUT_PATH, './json/tags.json', tagJson);
    cb()
}

module.exports = createJsonData;