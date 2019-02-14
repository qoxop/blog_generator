const gulp = require('gulp');
const through = require('through2');
const fs = require('fs')
const markdownIt = require('markdown-it')('commonmark')
const {join} = require('path')
const posixPath = require('path').posix

let parser = markdownIt
    .use(require('markdown-it-task-lists'), {enable: true, label: true, labelAfter: true})
    .use(require('markdown-it-highlightjs'))
    .use(require("markdown-it-anchor"))
    .use(require('markdown-it-table-of-contents'), {includeLevel: [3, 4]});


function amendFile(vinylFile) {
    const {contents, path, base} = vinylFile;
    const {join, dirname} = posixPath
    const url = path.replace(base).replace(/\\/g, '/')
    return {
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

function addKeywords() {
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
                vinylFile[key] = resObj[key];
            }
        }
        this.push(vinylFile);
        cb()
    })
}

const generateWebPage = (function() {
    const menus = [
        {text: 'HOME', url: '/index.html',  className: '', name: 'home' },
        {text: 'CATEGORY',  url: '/category.html', className: '', name: 'category' },
        {text: '想法', url: '/idea.html', className: '', name: 'idea' },
        {text: '链接', url: '/link.html', className: '', name: 'link'},
        {text: '关于我', url: '/about.html', className: '', name: 'about'}
    ]
    return function() {

    }
})()


gulp.task('parseMdfile', function() {
    return gulp.src('src/**/*.*')
    .pipe(parserPlugin(amendFile))
    .pipe(parserPlugin(addTags))
    .pipe(parserPlugin(addKeywords))
    .pipe(parserPlugin(finalParse))
});