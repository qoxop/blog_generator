const fs = require('fs')
const markdownIt = require('markdown-it')('commonmark')
const {join} = require('path')
const posixPath = require('path').posix

let parser = markdownIt
    .use(require('markdown-it-task-lists'), {enable: true, label: true, labelAfter: true})
    .use(require('markdown-it-highlightjs'))
    .use(require("markdown-it-anchor"))
    .use(require('markdown-it-table-of-contents'), {includeLevel: [3, 4]});

/**
 * 生成与目录结构一致的树状结构
 * @param {string} inputPath 输入路径
 */
function createFilesTree(inputPath) {
    const filesTree = {}
    try {
        fs.accessSync(inputPath, fs.constants.R_OK | fs.constants.W_OK);
        const files = fs.readdirSync(inputPath, { withFileTypes: true})
        files.forEach(dirent => {
            if (!dirent.name.match(/^\./)) { // 忽视 . 开头的文件或文件夹
                if (dirent.isFile()) {
                    filesTree[dirent.name] = 1
                } else if (dirent.isDirectory()) {
                    filesTree[dirent.name] = createFilesTree(join(inputPath, dirent.name))
                }
            }
        })
        return filesTree;
    } catch (err) {
        return undefined;
    }
}


function parseFilesTree(inputPath, outputPath, options = {}, filesTree = null) {
    const {
        baseUrl,
        beforeParse, 
        extraClass = "",
        extraField = {}
    } = options
    
    if (filesTree === null) {
        filesTree = createFilesTree(inputPath)
    }
    const htmlFileTree = {}
    if (filesTree) {
        for(let key in filesTree) {
            
            if (filesTree[key] === 1) {
                if (key.match(/\.md$/)) {
                    const mdPath = join(inputPath, key);
                    const url = `${baseUrl}/${key}`.replace(/\.md$/, '.html');
                    // 初始化元数据
                    const info = { stat: fs.statSync(mdPath), url, mdPath, isFile: true }
                    // 预处理mdstr
                    const mdStr = beforeParse(fs.readFileSync(mdPath, {encoding: 'utf8'}), url);
                    
                    // 添加额外的字段属性
                    for (let key in extraField) {
                        if (typeof extraField[key] === 'function') {
                            info[key] = extraField[key](mdStr, parser.render)
                        }
                    }
                    // 文章名
                    info.title = key.replace(/\.md$/, '')
                    // 添加额外的class
                    if (extraClass) {
                        info.html = `<div class="${extraClass}">${parser.render(mdStr)}</div>`
                    } else {
                        info.html = parser.render(mdStr)
                    }
                    // 添加到树上面
                    htmlFileTree[key.replace(/\.md$/, '')] = info;
                } else {
                    // fs.copyFileSync(join(inputPath, key), join(outputPath, key))
                }
            } else {
                const url = `${baseUrl}/${key}`
                htmlFileTree[key] = parseFilesTree(join(inputPath, key), join(outputPath, key), {...options, baseUrl: url}, filesTree[key])
                htmlFileTree[key].isDir = true;
            }
        }
        return htmlFileTree
    } else {
        throw('读取markdown文件失败')
    }
}

function defaultBeforeParse(mdStr, url) {
    const {join, dirname} = posixPath
    // 兼容todolist语法
    mdStr = mdStr.replace(/^-\s[ ]\s/g, '[ ] ').replace(/^-\s[x]\s/g, '[x] ')
    // (mdStr.match(/\[[^\]]*\]\([^\)]*\.md\)/g) || []).forEach(item => mdStr = mdStr.replace(item, item.replace('.md', '.html')))
    // 替换链接的 .md 为 .html, 相对路径改为绝对路径 (\[[^\]]*\]\([^\)]*\))
    mdStr = mdStr.replace(/(\[[^\[\n]+\]\([^\(\n]+\))/g, ($1) => {
        return $1.replace(/(\]\(\.[\w\.\/\\]*\.[\w]+)/, ($1) => { 
            return '](' + join(dirname(url), $1.replace(/\.md$/, '.html').replace(/^\]\(/,''))
        });
    })
    return mdStr;
}
const defaultExtraField = {
    tags: (mdStr) => {
        return ['666', '666']
    },
    keywords: (mdStr) => {
        return ['999', '999']
    },
}

/**
 * 解析markdown目录文件生成元数据树
 * @param {string} inputPath 输入目录
 * @param {string} baseUrl 输出目录
 * @param {*} config 配置
 */
function generateMeta(inputPath, outputPath, config = {}) {
    const {
        baseUrl = '',
        beforeParse = (md, url) => md,
        extraClass,
        extraField = {},
        plugins = []
    } = config

    // 扩展插件
    plugins.forEach(({plugin, option}) => {
        parser = parser.use(typeof plugin === 'string' ? require(plugin) : plugin, option)
    })
    return parseFilesTree(
        inputPath,
        outputPath,
        {
            baseUrl,
            beforeParse: (md, url) => beforeParse(defaultBeforeParse(md, url), url),
            extraClass,
            extraField: {...defaultExtraField, ...extraField}
        }
    )
}

module.exports = generateMeta