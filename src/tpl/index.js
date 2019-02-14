const fs = require('fs')
const path = require('path')
const template = require('art-template');

const absPath = (relativePath) => path.join(__dirname, relativePath)
const readTpl = (tplPath) => {
    return {
        tplText: fs.readFileSync(absPath(tplPath), {encoding: 'utf8'}),
        wrapper: function(wrapperText) {
            // 由里到外
            this.tplText = wrapperText.replace(/(<slot \/>) | (<slot>\s*<\/slot>)/, this.tplText);
            return this;
        },

    }
    
}

const wrapperTpl = readTpl('./wrapper.art')
const wrapperAsideTpl = readTpl('./wrapperAside.art')

function Tpl (pageType) {
    this.tplText = readTpl(`./${pageType}.art`)
    this.pageType = pageType
    
    this.wrapper = (wrapperText) => {
        // 由里到外
        this.tplText = wrapperText.replace(/(<slot \/>) | (<slot>\s*<\/slot>)/, this.tplText);
        return this;
    }
    this.render = (data = {}) => {
        return template.render(this.tplText, {...data, pageType: this.pageType, isDev: process.env.dev})
    }
}
const wrapper = (wrapperText) => {
    // 由里到外
    this.tplText = wrapperText.replace(/(<slot \/>) | (<slot>\s*<\/slot>)/, this.tplText);
    return this;
}
const about = (new Tpl('about')).wrapper(wrapperAsideTpl).wrapper(wrapperTpl)
const article = (new Tpl('article')).wrapper(wrapperTpl)
const ideas = (new Tpl('idea')).wrapper(wrapperAsideTpl).wrapper(wrapperTpl)
const category = (new Tpl('category')).wrapper(wrapperAsideTpl).wrapper(wrapperTpl)
const articleList = (new Tpl('articleList')).wrapper(wrapperAsideTpl).wrapper(wrapperTpl)
const links = (new Tpl('link')).wrapper(wrapperAsideTpl).wrapper(wrapperTpl)
const _about = function() {
    
}

module.exports = {
    about, article, ideas, category, links, articleList
}