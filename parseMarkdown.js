const gulp = require('gulp');
const through = require('through2');
const markdownIt = require('markdown-it')('commonmark')
const posixPath = require('path').posix;
const dayjs = require('dayjs')
const {menus, notePath} = require('./meta.js')
const {addArticles} = require('./generateWebsite.js')
const { articlePage} = require('./src/tpl/index')

let parser = markdownIt
    .use(require('markdown-it-task-lists'), {enable: true, label: true, labelAfter: true})
    .use(require('markdown-it-highlightjs'))
    .use(require("markdown-it-anchor"))
    .use(require('markdown-it-table-of-contents'), {includeLevel: [3, 4]});


function amendFile(vinylFile) {
    const {contents, path, base} = vinylFile;
    const {join, dirname} = posixPath
    const url = path.replace(base, '').replace(/\\/g, '/').replace(/.md$/, '.html')
    return {
        url,
        contents: contents.toString()
                    .replace(/^-\s[ ]\s/g, '[ ] ').replace(/^-\s[x]\s/g, '[x] ') // 兼容todolist语法
                    .replace(/(\[[^\[\n]+\]\([^\(\n]+\))/g, ($1) => {
                        return $1.replace(/(\]\(\.[\w\.\/\\]*\.[\w]+)/, ($1) => { 
                            return '](' + join(dirname(url), $1.replace(/\.md$/, '.html').replace(/^\]\(/,''))
                        });
                    }) // 替换链接的 .md 为 .html, 相对路径改为绝对路径 (\[[^\]]*\]\([^\)]*\))
    }
}

function addTags(vinylFile) {
    const {contents} = vinylFile;
    const tags = [];
    // 去除@tags, 提取tags
    const text = contents.toString().replace(/\n@tags\:([^\n]*)/g, (_, $1) => {
        tags.push(...($1.split(",").map(tag => tag.trim())))
        return ""
    })
    return {contents: text, tags}
}
function finalParse(vinylFile) {
    const {contents} = vinylFile;
    return {
        extname: '.html',
        contents: parser.render(contents.toString())
    }
    
}

function addKeywords(vinylFile) {
    const {contents} = vinylFile;
    const keywords = [];
    // 去除@keywords, 提取keywords
    const text = contents.toString().replace(/\n@keywords\:([^\n]*)/g, (_, $1) => {
        keywords.push(...($1.split(",").map(keyword => keyword.trim())))
        return ""
    })
    return {contents: text, keywords}
}

function parserPlugin(hanler) {
    return through.obj(function(vinylFile , enc, cb) {
        if (vinylFile.extname === '.md') {
            const resObj = hanler(vinylFile);
            for (let key in resObj) {
                vinylFile[key] = key === 'contents' ? Buffer.from(resObj[key]) : resObj[key];
            }
        }
        this.push(vinylFile);
        cb()
    })
}


const generateArticlePage = function() {
    return through.obj(function(vinylFile , enc, cb) {
        if (vinylFile.extname === '.html') {
            let myMenus = menus;
            if (vinylFile.stem === 'link' || vinylFile.stem === 'about') {
                myMenus = menus.map(item => item.name === vinylFile.stem ? ({...item, url: '#', className: 'actived'}) : item)
            }
            const data = {
                html: vinylFile.contents.toString(),
                title: vinylFile.stem,
                createAt: dayjs(vinylFile.stat.birthtime).format('YYYY-MM-DD'), 
                modifyAt: dayjs(vinylFile.stat.mtime).format('YYYY-MM-DD'),
                tags: vinylFile.tags,
                keywords: vinylFile.keywords.join(),
                menus: myMenus
            }
            addArticles({
                preview: data.html.split(/\<\!--\s*more\s* --\>/)[0] || "",
                url: vinylFile.url,
                title: data.title,
                keywords: data.keywords,
                tags: data.tags,
                createAt: data.createAt, 
                modifyAt: data.modifyAt
            })
            vinylFile.contents = Buffer.from(articlePage(data))
        }
        this.push(vinylFile);
        cb()
    })
}

function parseMarkdown() {
    return gulp.src([`${notePath}/**/*.*`, `!${notePath}/ignore/**/*.*`])
    .pipe(parserPlugin(amendFile))
    .pipe(parserPlugin(addTags))
    .pipe(parserPlugin(addKeywords))
    .pipe(parserPlugin(finalParse))
    .pipe(generateArticlePage())
    .pipe(gulp.dest('./site'))
};

module.exports = {
    parseMarkdown
}



