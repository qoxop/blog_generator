const {join, dirname} = require('path')
const {writeFileSync, readFileSync, mkdirSync, constants, accessSync, readdirSync, unlinkSync} = require('fs')
const child_process = require('child_process')
const {chunk, get, forEach} = require('lodash')
const {about, article, ideas, category, links, articleList} = require('./tpl/index')
const parse = require('./parse')
const dayjs = require('dayjs')


const PAGE_SIZE = 10;

const common = {}

const menus = [
    {text: 'HOME', url: '/index.html',  className: '', name: 'home' },
    {text: 'CATEGORY',  url: '/category.html', className: '', name: 'category' },
    {text: '想法', url: '/idea.html', className: '', name: 'idea' },
    {text: '链接', url: '/link.html', className: '', name: 'link'},
    {text: '关于我', url: '/about.html', className: '', name: 'about'}
]

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

/**
 * 合并common-data 到render-data
 * @param {*} data 
 */
const mergeCommon = (data) => {
    return {...common, ...data}
}

/**
 * 生成菜单数组
 * @param {*} name 
 */
const generateMenus = (name) => {
    return menus.map(item => item.name === name ? ({...item, url: '#', className: 'actived'}) : item)
}

const transitionMetaToList = (meta) => {
    const list = []
    for (key in meta) {
        if (meta[key].isFile) {
            list.push({
                ...meta[key],
                createAt: dayjs(meta[key].stat.birthtime).format("YYYY-MM-DD"),
                modifyAt: dayjs(meta[key].stat.mtime).format("YYYY-MM-DD"),
                timestamp: meta[key].stat.mtime,
                preview: meta[key].html.split(/\<\!--\s*more\s* --\>/)[0] || "",
                stat: undefined,
            })
        } else {
            list.push(...transitionMetaToList(meta[key]))
        }
    }
    return list
}


const createArray = (num) => {
    const arr = []
    for (let i = 1; i <= num; i++) {
        arr.push(i)
    }
    return arr;
}

const generateMap = {
    home: (meta, joinOutputPath) => {
        const dlist = chunk(transitionMetaToList(meta).sort((a, b) => (a.timestamp < b.timestamp)), PAGE_SIZE);
        const list = dlist[0] || [];
        const keywords = list.reduce((keywords, cur) => {
            return keywords.concat(cur.keywords || [])
        }, []).join(',') + ',首页';
        const data = mergeCommon({
            list, title: '首页', keywords, 
            menus: generateMenus('home'),
            pageList: createArray(dlist.length).slice(0, PAGE_SIZE),
            pageIndex: 1, pageTotal: dlist.length
        })
        createFile(joinOutputPath('./index.html'), articleList.render(data))
    },
    articleList: (meta, joinOutputPath) => {
        const dlist = chunk(transitionMetaToList(meta).sort((a, b) => (a.timestamp < b.timestamp)), PAGE_SIZE);
        createArray(dlist.length);
        dlist.forEach((list, index) => {
            const keywords = list.reduce((keywords, cur) => {
                return keywords.concat(cur.keywords || [])
            }, []);
            let pageList = createArray(dlist.length).slice(0, PAGE_SIZE);
            if(index > 2 && dlist.length > 5) {
                pageList = createArray(dlist.length).slice(index - 2, PAGE_SIZE);
                while(pageList.length < 5) {
                    pageList.unshift(pageList[0] -1)
                }
            }
            const data = mergeCommon({
                list, title: `首页 - ${index + 1}`, keywords,
                menus: generateMenus('home'),  pageList,
                pageIndex: index + 1, pageTotal: dlist.length
            })
            createFile(joinOutputPath(`./articles/${index + 1}.html`), articleList.render(data))
        })
    },
    category: (meta, joinOutputPath) => {
        const categories = [
            {name: '前端开发', rPaths: ['前端开发']},
            {name: '算法学习', rPaths: ['算法学习']},
            {name: '后端开发', rPaths: ['后端开发']},
            {name: '经验总结', rPaths: ['经验总结']},
            {name: '读书笔记', rPaths: ['读书笔记']}
        ]
        const keywords = '分类归档'
        const cList = categories.map(item => {
            const list = []
            item.rPaths.forEach(rp => {
                list.push(...transitionMetaToList(get(meta, rp, {})))
            })
            return {...item, list, rPaths: undefined}
        })
        const data = mergeCommon({cList, title: '分类归档', keywords, menus: generateMenus('category')})
        createFile(joinOutputPath(`./category.html`), category.render(data))
    },
    article: (meta, joinOutputPath) => {
        const list = transitionMetaToList(meta);
        list.forEach(art => {
            const {html, createAt, modifyAt, tags = [], keywords = [], title} = art
            const menus = generateMenus('article')
            const data = mergeCommon({html, title, createAt, modifyAt, menus, tags, keywords: keywords.join()})
            createFile(joinOutputPath(`./${art.url}`), article.render(data))
        })
    },
    idea: (meta, joinOutputPath) => {
        const ideaPath = 'anything.idea'
        const art = get(meta, ideaPath, {})
        const {html, createAt, modifyAt, tags = [], keywords = []} = art
        const menus = generateMenus('idea')
        const data = mergeCommon({html, title: '记录', createAt, modifyAt, menus, keywords: keywords.join()})
        createFile(joinOutputPath('./idea.html'), ideas.render(data))
    },
    link: (meta, joinOutputPath) => {
        const ideaPath = 'anything.link'
        const art = get(meta, ideaPath, {})
        const {html, createAt, modifyAt, tags = [], keywords = []} = art
        const menus = generateMenus('link')
        const data = mergeCommon({html, title: '链接', createAt, modifyAt, menus, keywords: keywords.join()})
        createFile(joinOutputPath('./link.html'), links.render(data))
    },
    about: (meta, joinOutputPath) => {
        const ideaPath = 'anything.about'
        const art = get(meta, ideaPath, {})
        const {html, createAt, modifyAt, keywords = []} = art
        const menus = generateMenus('about')
        const data = mergeCommon({html, title: '关于我', createAt, modifyAt, menus, keywords: keywords.join()})
        createFile(joinOutputPath('./about.html'), about.render(data))
    }
}


function generateHtmlFiles (pathsInfo = {}) {
    const {outputPath, inputPath, baseUrl} = pathsInfo;
    // 检测可访问性
    try {
        accessSync(outputPath, constants.R_OK | constants.W_OK);
        accessSync(inputPath, constants.R_OK | constants.W_OK);
    } catch (err) {
        mkdirSync(outputPath)
        try {
            accessSync(outputPath, constants.R_OK | constants.W_OK);
        } catch (err) {
            throw(err)
        }
    }
    // 清空输出文件夹
    const files = readdirSync(outputPath, { withFileTypes: true})
    files.forEach(dirent => {
        if (dirent.isFile()) {
            unlinkSync(`${outputPath}/${dirent.name}`)
        } else if (dirent.isDirectory() && !dirent.name.match(/^\./)) {
            // 嗯...，这个地方有点暴力
            child_process.execSync(`rm -rf '${outputPath}/${dirent.name}'`)
        }
    })
    const meta = parse(inputPath, outputPath, {baseUrl});
    forEach(generateMap, (generate) => {
        generate(meta, (rPath) => join(pathsInfo.outputPath, rPath))
    })
    return () => generateHtmlFiles (pathsInfo)
}
function copyDirDeep(src, dest) { // 拷贝静态资源
    try {
        // 可访问性
        accessSync(src, constants.R_OK | constants.W_OK);
        // 递归拷贝
        const files = readdirSync(src, { withFileTypes: true})
        files.forEach(dirent => {
            if (dirent.isFile()) {
                createFile(join(dest, dirent.name), readFileSync(join(src, dirent.name)))
            } else if (dirent.isDirectory()) {
                copyAssets(join(src, dirent.name), join(dest, dirent.nam))
            }
        })
    } catch (err) {
        throw err;
    }
    return () => copyDirDeep(src, dest)
}

module.exports = {
    generateHtmlFiles,
    copyDirDeep,
}