const fs = require('fs')
const path = require('path')
const template = require('art-template');

const absPath = (relativePath) => path.join(__dirname, relativePath)
const getTpl = (pageType) => {
    return {
        tplText: fs.readFileSync(absPath(`./${pageType}.art`), {encoding: 'utf8'}),
        wrapper: function(wrapperText) {
            // 由里到外
            this.tplText = wrapperText.replace(/(<slot \/>) | (<slot>\s*<\/slot>)/, this.tplText);
            return this;
        },
        render: function(data) {
            return template.render(this.tplText, {...data, pageType, isDev: process.env.dev})
        }
    }
}

const wrapperTpl = () => fs.readFileSync(absPath('./wrapper.art'), {encoding: 'utf8'});
const wrapperAsideTpl = () => fs.readFileSync(absPath('./wrapperWithProfile.art'), {encoding: 'utf8'});


const aboutPage = (data = {}) => getTpl('about').wrapper(wrapperAsideTpl()).wrapper(wrapperTpl()).render(data);
const articlePage = (data = {}) => getTpl('article').wrapper(wrapperTpl()).render(data);
const tagsPage = (data = {}) => getTpl('tags').wrapper(wrapperAsideTpl()).wrapper(wrapperTpl()).render(data);
const categoryPage = (data = {}) => getTpl('category').wrapper(wrapperAsideTpl()).wrapper(wrapperTpl()).render(data)
const articleListPage = (data = {}) => getTpl('articleList').wrapper(wrapperAsideTpl()).wrapper(wrapperTpl()).render(data);
const linksPage = (data = {}) => getTpl('links').wrapper(wrapperAsideTpl()).wrapper(wrapperTpl()).render(data);

module.exports = {
    aboutPage, articlePage, tagsPage, categoryPage, articleListPage, linksPage
}