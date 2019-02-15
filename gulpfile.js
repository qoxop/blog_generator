const gulp = require('gulp');
const through = require('through2');
const markdownIt = require('markdown-it')('commonmark')
const posixPath = require('path').posix;
const dayjs = require('dayjs')
const {aboutPage, articlePage, ideasPage, categoryPage, articleListPage, linksPage} = require('./src/tpl/index')

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


let files_tmp = [];
const menus = [
    {text: 'HOME', url: '/index.html',  className: '', name: 'home' },
    {text: 'CATEGORY',  url: '/category.html', className: '', name: 'category' },
    {text: '想法', url: '/idea.html', className: '', name: 'idea' },
    {text: '链接', url: '/link.html', className: '', name: 'link'},
    {text: '关于我', url: '/about.html', className: '', name: 'about'}
]
const generateArticlePage = function() {
    return through.obj(function(vinylFile , enc, cb) {
        if (vinylFile.extname === '.html') {
            const data = {
                html: vinylFile.contents.toString(),
                title: vinylFile.stem,
                createAt: dayjs(vinylFile.stat.birthtime).format('YYYY-MM-DD'), 
                modifyAt: dayjs(vinylFile.stat.mtime).format('YYYY-MM-DD'),
                tags: vinylFile.tags.join(),
                keywords: vinylFile.keywords.join(),
                menus
            }
            files_tmp.push({
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

const createArray = (num) => {
    const arr = []
    for (let i = 1; i <= num; i++) {
        arr.push(i)
    }
    return arr;
}

gulp.task('parseMdfile', function() {
    return gulp.src('C:/work/myNotes/**/*.*')
    .pipe(parserPlugin(amendFile))
    .pipe(parserPlugin(addTags))
    .pipe(parserPlugin(addKeywords))
    .pipe(parserPlugin(finalParse))
    .pipe(generateArticlePage())
    .pipe(gulp.dest('./site'))
});

gulp.task('generateWebSite', function (cb) {
    const PAGE_SIZE = 10;
    const list = files_tmp.sort((a, b) => (a.createAt < b.createAt));
    files_tmp = [];
    // 所有的页码数字
    const pageNums = createArray(Math.floor(list.length / PAGE_SIZE))
    pageNums.forEach((pageNum, index) => {
        const artList = list.slice(index * PAGE_SIZE, PAGE_SIZE);
        articleListPage({
            list: artList,
            title: `首页 - ${pageNum}`,
            keywords: artList.map(art => art.keywords).join(),
            menus: menus.map(item => item.name === 'HOME' ? ({...item, url: '#', className: 'actived'}) : item)
        })
    })
    
    cb()
})
gulp.task('default', gulp.series('parseMdfile', function (cb) {
    console.log('done')
    cb()
}));