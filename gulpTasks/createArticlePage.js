const gulp = require('gulp');
const through = require('through2');
const markdownIt = require('markdown-it')('commonmark')
const posixPath = require('path').posix;
const dayjs = require('dayjs')
const myEmitter = require('../myEmitter');
const {INPUT_PATH, OUTPUT_PATH, AUTHOR} = require('../meta')
const {article} = require('../renderers/index')

let parser = markdownIt
    .use(require('markdown-it-task-lists'), {enable: true, label: true, labelAfter: true})
    .use(require('markdown-it-highlightjs'))
    .use(require("markdown-it-anchor"))
    .use(require('markdown-it-table-of-contents'), {includeLevel: [3, 4]});


/**
 * 修改md文件, 添加url
 * @param {*} vinylFile 
 */
function amendUrlFile(vinylFile) {
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
/**
 * 在流对象上添加标签数组
 * @param {*} vinylFile 
 */
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

/**
 * 在流对象上添加关键字数组
 * @param {*} vinylFile 
 */
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
/**
 * 在流对象上添加更新时间
 * @param {*} vinylFile 
 */
function addUpdateTime(vinylFile) {
    const {contents} = vinylFile;
    let updateTime = dayjs(vinylFile.stat.mtime).format('YYYY-MM-DD');
    const text = contents.toString().replace(/\n@updateAt\:([^\n]*)/g, (_, $1) => {
        if ($1) {
            updateTime = dayjs($1).format('YYYY-MM-DD');
        }
        return ""
    })
    return {contents: text, updateTime}
}
/**
 * 在流对象上添加author属性
 * @param {*} vinylFile 
 */
function addAuthor(vinylFile) {
    const {contents} = vinylFile;
    let author = AUTHOR;
    const text = contents.toString().replace(/\n@author\:([^\n]*)/g, (_, $1) => {
        if ($1) {
            author = $1;
        }
        return ""
    })
    return {contents: text, author}
}

/**
 * 结束流对象的修改，将文件名改为 .html
 * @param {*} vinylFile 
 */
function finalParse(vinylFile) {
    const {contents} = vinylFile;
    return {
        extname: '.html',
        contents: parser.render(contents.toString())
    }
}

/**
 * gulp插件
 * @param {*} handler 
 */
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
            const extraKeys = ['url', 'tags', 'keywords', 'updateTime', 'author'];
            const articleInfo = {
                html: vinylFile.contents.toString(),
                title: vinylFile.stem,
            }
            extraKeys.forEach(key => {
                if (vinylFile[key] === undefined) {
                    throw new Error();
                }
                articleInfo[key] = vinylFile[key];
            })
            myEmitter.emit(myEmitter.TYPE.AFTER_PARSE_MD_TO_HTML, articleInfo);
            vinylFile.contents = Buffer.from(article(articleInfo));
        }
        this.push(vinylFile);
        cb()
    })
}

function createArticlePage() {
    myEmitter.emit(myEmitter.TYPE.BEGIN_CREATE_ARTICLE_PAGE);
    return gulp.src([`${INPUT_PATH}/**/*.*`, `!${INPUT_PATH}/ignore/**/*.*`])
    .pipe(parserPlugin(amendUrlFile))
    .pipe(parserPlugin(addTags))
    .pipe(parserPlugin(addKeywords))
    .pipe(parserPlugin(addUpdateTime))
    .pipe(parserPlugin(addAuthor))
    .pipe(parserPlugin(finalParse))
    .pipe(generateArticlePage())
    .pipe(gulp.dest(OUTPUT_PATH));
};

module.exports = createArticlePage
