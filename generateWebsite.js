const gulp = require('gulp');
const {writeFileSync, mkdirSync, accessSync} = require('fs')
const {cloneDeep, uniq} = require('lodash')
const {menus} = require('./meta.js')
const {join, dirname} = require('path')
const {tagsPage, categoryPage, articleListPage} = require('./src/tpl/index')

const DataController = (function() {
    const data = {
        articles: [], // preview, url, title, keywords, tags, createAt, modifyAt
    }
    return {
        addArticles: (article) => data.articles.push(article),
        getArticles: () => cloneDeep(data.articles).sort((a, b) => (a.createAt < b.createAt)),
        clearArticles: () => data.articles = [],
    }
})()


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
const createArray = (num) => {
    const arr = []
    for (let i = 1; i <= num; i++) {
        arr.push(i)
    }
    return arr;
}

function generateArticleList(cb) {
    const PAGE_SIZE = 10;
    const list = DataController.getArticles();
    // 所有的页码数字
    const pageNums = createArray(Math.floor(list.length / PAGE_SIZE));
    pageNums.forEach((pageNum, index) => {
        const artList = list.slice(index * PAGE_SIZE, index * PAGE_SIZE + PAGE_SIZE);
        let pageList = pageNums.slice(index, 5);
        // 分页条数量不足5, 向前补
        while(pageList.length < 5 && pageList[0] > 1) {
            pageList.unshift(pageList[0] -1);
        }
        const htmlStr = articleListPage({
            list: artList,
            title: `首页(${pageNum})`,
            keywords: artList.map(art => art.keywords).join(),
            menus: menus.map(item => item.name === 'home' ? ({...item, url: '#', className: 'actived'}) : item),
            pageTotal: pageNums.length,
            pageIndex: pageNum,
            pageList,
        });
        if (pageNum === 1) {
            createFile(join(__dirname, './site/index.html'), htmlStr)
        }
        createFile(join(__dirname, './site', `articles/${pageNum}.html`), htmlStr)
    })
    cb()
}

function generateCategorys(cb) {
    const categories = [
        {name: '前端开发'},
        {name: '算法学习'},
        {name: '后端开发'},
        {name: '经验总结'},
        {name: '读书笔记'}
    ]
    const list = DataController.getArticles();
    const cList = categories.map(item => {
        const regexp = new RegExp(`^${item.name}`)
        item.list = list.filter(({url}) => !!url.replace(/[\/\\\.]/g, '').match(regexp))
        return item;
    }).filter(item => item.list.length > 0)
    createFile(join(__dirname, './site/category.html'), categoryPage({
        cList,
        title: '分类归档',
        keywords: '分类归档',
        menus: menus.map(item => item.name === 'category' ? ({...item, url: '#', className: 'actived'}) : item),
    }))
    cb()
}

function generateTags(cb) {
    const list = DataController.getArticles();
    const tList = uniq(list.reduce((arr = [], cur) => {
            return arr.concat(cur.tags || [])
        }, [])
    ).map(tagName => {
        return {
            name: tagName,
            list: list.filter(({tags}) => tags.includes(tagName))
        }
    })
    createFile(join(__dirname, './site/tags.html'), tagsPage({
        tList,
        title: '标签',
        keywords: '标签归档',
        menus: menus.map(item => item.name === 'tags' ? ({...item, url: '#', className: 'actived'}) : item)
    }))
    cb()
}
function moveAsset() {
    return gulp.src('./assets/**/*.*')
    .pipe(gulp.dest('./site/assets'))
}
const generateWebsite = gulp.parallel(generateArticleList, generateCategorys, generateTags, moveAsset)

module.exports = {
    generateWebsite,
    addArticles: DataController.addArticles
}