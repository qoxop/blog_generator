const myEmitter = require('./myEmitter');
const store = [];

const getStore = () => {
    return [...store]
}
const clearStore = () => {
    return store.splice(0, store.length) 
}

myEmitter.on(myEmitter.TYPE.AFTER_PARSE_MD_TO_HTML, (info) => {
    store.push(info)
})
myEmitter.on(myEmitter.TYPE.BEGIN_CREATE_ARTICLE_PAGE, () => {
    clearStore()
})

module.exports = {
    getStore, clearStore
}
