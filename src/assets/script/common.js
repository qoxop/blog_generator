// 自定义事件对象
const myEvent = (function() {
    let cbsStore = {};
    return {
        log() {console.log(cbsStore)},
        on: function (eventStr, cb) {
            if(!cbsStore[eventStr]) {
                cbsStore[eventStr] = []
            }
            cb.stopId = Date.now().toString() + Math.random().toString().replace('0.', '')
            cbsStore[eventStr].push(cb)
            return cb.stopId;
        },
        emit: function(eventStr, ...other) {
            if(cbsStore[eventStr]) {
                cbsStore[eventStr].forEach(cb => {
                    cb(...other)
                });
            }
        },
        removeListener: function(eventStr, stopId) {
            if(cbsStore[eventStr]) {
                cbsStore[eventStr] = cbsStore[eventStr].filter(cb => cb.stopId !== stopId);
            }
        },
        clearListener: function(eventStr) {
            cbsStore[eventStr] = null
        }
    }
})()
// 自定滚动事件
const BODY_SCROLL_EVENT = {
    DOWN: 'bodyScrollDown',
    UP: 'bodyScrollUp',
    TOP: 'bodyScrollTop',
    BOTTOM: 'bodyScrollBottom',
    PRELOAD: 'needPreload',
    SCROLL: 'bodyOnScroll'
}
// 时间变化事件
const TIME_EVENT = {
    YEAR_ADD: 'year_add',
    SCROLL_TIP_CHANGE: 'scroll_tip_change'
}

// ajax
const request = (function() {
    function getAjax() {
        if (typeof XMLHttpRequest === 'undefined') {
            var versions=['Microsoft.XMLHTTP', 'MSXML.XMLHTTP', 'Msxml2.XMLHTTP.7.0','Msxml2.XMLHTTP.6.0','Msxml2.XMLHTTP.5.0', 'Msxml2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP'];
            for (let i = 0; i < versions.length; i++) {
                try {
                    return new ActiveXObject(versions[i]);
                } catch(e) {}
            }
        } else {
            return new XMLHttpRequest();
        }
    };
    // 全局配置
    let config = {
        noCache: false,
        errHandler: null,
        responseHandler: function(data) {
            return data;
        }
    }
    // get 方法
    function get(url, params, cb) {
        const ajax = getAjax();
        const cfg = Object.assign({}, config, this.config);
        // 检测回调
        if(typeof params === 'function' && cb === undefined) {
            cb = params;
        } else if (params !== undefined) {
            // 参数拼接
            const query = Object.keys(params).map(key => (`${key}=${params[key]}`)).join('&');
            if(query) {
                if(/\?/.test(url)) {
                    url = url + '&' + query;
                } else {
                    url = url + '?' + query;
                }
            }
        }
        // 缓存控制
        if (cfg.noCache) {
            if(/\?/.test(url)) {
                url = url + '&noCacheUuid' + Date.now();
            } else {
                url = url + '?noCacheUuid' + Date.now();
            }
        }
        ajax.onreadystatechange = function() {
            if (ajax.readyState === 4) { 
                if(typeof cb === 'function') {
                    if (ajax.status === 200 || ajax.status === 304) {
                        if(typeof cb === 'function') {
                            cb(
                                typeof cfg.responseHandler === 'function' ?
                                cfg.responseHandler(ajax.responseText) :
                                ajax.responseText
                            )
                        }
                    } else {
                        if (typeof cfg.errHandler === 'function') {
                            errHandler(ajax.status);
                        }
                        cb(ajax.status, true);
                    }
                }
            }
        }
        ajax.open('GET', url);
        ajax.send()
    }
    function post(url, params, cb) {
        const ajax = getAjax();
        const cfg = Object.assign({}, config, this.config);
        let postData = null
        // 检测回调
        if(typeof params === 'function' && cb === undefined) {
            cb = params;
        } else if (params !== undefined) {
            // 参数拼接
            postData = Object.keys(params).map(key => (`${key}=${params[key]}`)).join('&');
        }
        // 缓存控制
        if (cfg.noCache) {
            if(/\?/.test(url)) {
                url = url + '&noCacheUuid' + Date.now();
            } else {
                url = url + '?noCacheUuid' + Date.now();
            }
        }
        ajax.onreadystatechange = function() {
            if (request.readyState === 4) { 
                if(typeof cb === 'function') {
                    if (request.status === 200 || request.status === 304) {
                        if(typeof cb === 'function') {
                            cb(
                                typeof cfg.responseHandler === 'function' ?
                                cfg.responseHandler(request.responseText) :
                                request.responseText
                            )
                        }
                    } else {
                        if (typeof cfg.errHandler === 'function') {
                            errHandler(request.status);
                        }
                        cb(request.status, true);
                    }
                }
            }
        }
        ajax.open('POST', url);
        ajax.send(postData)
    }
    const req = {
        get: get,
        post: post,
        setGlobalConfig: function(cfg) {
            config = Object.assign(config, cfg)
        }
    }
    function createReq(cfg) {
        return Object.assign(req, {config: cfg})
    }
    return Object.assign(createReq, req);
})()

function createArticleList(list, positionInfo) {
    const fragment = document.createDocumentFragment();
    const years = [];
    list.forEach(item => {
        const li = document.createElement('li');
        const year = item.updateTime.substr(0, 4);
        const tpl = `
            <div class="time">
                <time>${item.updateTime}</time>
            </div>
            <div class="article-info">
                <div class="article-title">
                    <a href="${item.url}" class="article-link iconfont">${item.title}</a>
                </div>
                <div class="article-tags">
                    ${item.tags.map(tag => (`<a href="/tags.html#${tag}">${tag}</a>`)).join('')}
                </div>
            </div>
        `
        li.innerHTML = tpl;
        if (!document.getElementById(year) && !years.includes(year)) {
            years.push(year);
            li.setAttribute('id', year)
        }
        if (positionInfo) {
            setTimeout(() => {
                const key = item.updateTime.substr(0, 7).replace('-', '年') + '月';
                if(!positionInfo[key]) {
                    positionInfo[key] = li.getBoundingClientRect().y - document.body.getBoundingClientRect().y;
                }
                
            }, 0)
        }
        fragment.appendChild(li);
    })
    return fragment;
}


function bodyScrollHandler () {
    let PreY =  document.body.getBoundingClientRect().y;
    let td = 0;
    document.body.onscroll = (e) => {
        if (td === 0) {
            td = setTimeout(() => {
                td = 0;
                const DOMRect = document.body.getBoundingClientRect();
                const curY = DOMRect.y;
                const curBottom = DOMRect.bottom;
                myEvent.emit(BODY_SCROLL_EVENT.SCROLL, curY);
                if(curY - PreY < -1) {
                    myEvent.emit(BODY_SCROLL_EVENT.DOWN, e);
                }
                if(curY - PreY > 1) {
                    myEvent.emit(BODY_SCROLL_EVENT.UP, e);
                }
                if(curY > -1) {
                    myEvent.emit(BODY_SCROLL_EVENT.TOP, e);
                }
                if(curBottom - window.innerHeight < 16) {
                    myEvent.emit(BODY_SCROLL_EVENT.BOTTOM, e);
                }
                if (curBottom - window.innerHeight < 100) {
                    myEvent.emit(BODY_SCROLL_EVENT.PRELOAD)
                }
                PreY = curY;
            }, 50)
        }
    }
}
function autoHideHeader() {
    const header = document.querySelector('body>header');
    myEvent.on(BODY_SCROLL_EVENT.DOWN, () => {
        header.setAttribute('class', 'hide')
    })
    myEvent.on(BODY_SCROLL_EVENT.UP, () => {
        header.setAttribute('class', '')
    })
}


function DataController() {
    this.data = [];
    this.pageIndex = 0;
    this.hasMore = true;
    this.loading = false;
    request.setGlobalConfig({responseHandler: (res) => JSON.parse(res)})
    this.load = function (cb) {
        if (!this.loading && this.hasMore) {
            this.loading = true;
            request.get(`/json/page_${++this.pageIndex}.json`, (res, fail) => {
                if (fail || (res && res.data && !res.data.length)) {
                    // 无数据
                    this.hasMore = false;
                } else {
                    this.data = this.data.concat(res.data)
                    const years =  Object.keys(res.data.map(item => item.updateTime.substr(0, 4)).reduce((yObj, year) => Object.assign(yObj, {[year]: 1}), {})).sort();
                    myEvent.emit(TIME_EVENT.YEAR_ADD, years)

                }
                cb(fail ? [] : res.data)
                this.loading = false;
            })
        }
    }
    this.preload = function(cb) {
        this.data = [];
        this.pageIndex = 0;
        this.hasMore = true;
        this.load(cb)
    }
    this.fetchAll = function(cb) {
        request.get('/json/all.json', (res, fail) => {
            if (fail || (res && res.data && !res.data.length)) {
                // 无数据
                this.hasMore = false;
            } else {
                this.data = res.data;
            }
            cb(fail ? [] : res.data)
            this.loading = false;
        })
    }
}

function displayScrollTips(PositionInfo, distance) {
    if (!distance) {
        distance = 15;
    }
    const scrollTips = document.getElementById('scrollTips');
    myEvent.on(BODY_SCROLL_EVENT.SCROLL, function(curY) {
        for(let key in PositionInfo) {
            if(-curY + distance < PositionInfo[key]) {
                scrollTips.innerText = key;
                myEvent.emit(TIME_EVENT.SCROLL_TIP_CHANGE, key)
                break;
            }
            
        }
    })
}

function renderHomePage() {
    const PositionInfo = {}
    displayScrollTips(PositionInfo);
    const dataCtrl = new DataController();
    function checking() {
        if (document.body.getBoundingClientRect().bottom  - window.innerHeight < 100) {
            myEvent.emit(BODY_SCROLL_EVENT.PRELOAD);
        }
    }
    myEvent.on(BODY_SCROLL_EVENT.PRELOAD, function () {
        dataCtrl.load(function(data) {
            if(!dataCtrl.hasMore) {
                // 没有就不监听了
                myEvent.clearListener(BODY_SCROLL_EVENT.PRELOAD);
            } else {
                // apendChild
                const ul = document.querySelector('#home_article_list>ul');
                if (ul) {
                    ul.appendChild(createArticleList(data, PositionInfo));
                    setTimeout(checking, 20);
                } else {
                    console.error('#home_article_list>ul not exit');
                }
            }
        })
    })
    checking();
}

function renderYearBar() {
    const yearDomMap = {};
    const timelineDom = document.getElementById('yearsbar');
    myEvent.on(TIME_EVENT.YEAR_ADD, function(years) {
        const liFragment = document.createDocumentFragment()
        years.forEach(y => {
            if (!yearDomMap[y]) {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#${y}"><span>${y}</span></a>`
                yearDomMap[y] = li;
                liFragment.appendChild(li);
            }
        })
        if (liFragment.hasChildNodes()) {
            timelineDom.appendChild(liFragment)
        }
    })
    myEvent.on(TIME_EVENT.SCROLL_TIP_CHANGE, function(tip) {
        const curYear = tip.substr(0, 4)
        for (let year in yearDomMap) {
            if(year >= curYear) {
                yearDomMap[year].setAttribute('class', 'actived');
            } else {
                yearDomMap[year].setAttribute('class', 'unactived');
            }
        }
    })
}

function assistToolsHandler() {
    const backToTop = document.querySelector('.back-to-top')
    const header = document.querySelector('body>header>div.header')
    const TOOLS_EVENT = {
        BACK_TO_TOP: 'back-to-top',
    }
    myEvent.on(TOOLS_EVENT.BACK_TO_TOP, () => {
        document.body.scrollIntoView();
    })
    if (backToTop) {
        backToTop.addEventListener('click', function() {
            myEvent.emit(TOOLS_EVENT.BACK_TO_TOP)
        })
    }
    if (header) {
        header.addEventListener('dblclick', function() {
            myEvent.emit(TOOLS_EVENT.BACK_TO_TOP)
        })
    }
}

function createTagPage(listGroupByTag, PositionInfo) {
    const TagsListGroup = document.createDocumentFragment();
    const ListGroup = document.createDocumentFragment();
    for (let tagName in listGroupByTag) {
        // 添加标签链接
        const tag = document.createElement('li');
        tag.innerHTML = `<a href="#${tagName}">${tagName}</a>`
        TagsListGroup.appendChild(tag);
        // 添加文章列表
        if(listGroupByTag[tagName] && listGroupByTag[tagName].length > 0) {
            // title
            const dt = document.createElement('dt');
            dt.innerText = tagName;
            dt.setAttribute('id', tagName);
            ListGroup.appendChild(dt)
            // detail 
            const dd = document.createElement('dd');
            const ul = document.createElement('ul');
            ul.innerHTML = listGroupByTag[tagName].reduce((htmlStr, cur) => {
                const itemStr = `<li><a class="iconfont" href="${cur.url}">${cur.title}</a></li>`
                return htmlStr + itemStr;
            }, '')
            dd.appendChild(ul)
            ListGroup.appendChild(dd);
            setTimeout(() => {
                const bt = dd.getBoundingClientRect().bottom;
                const tp = dd.getBoundingClientRect().top;
                PositionInfo[tagName] = (bt + tp) / 2  - document.body.getBoundingClientRect().y;
            }, 0)
        }
    }
    document.getElementById('tags_list').appendChild(TagsListGroup);
    document.getElementById('tag_article_list').appendChild(ListGroup);
}

function renderTagsPage() {
    const PositionInfo = {};
    displayScrollTips(PositionInfo, 30);
    const dataCtrl = new DataController();
    dataCtrl.fetchAll((data) => {
        const listGroupByTag = data.reduce((obj, cur) => {
            if (cur.tags && cur.tags.length > 0) {
                cur.tags.forEach(tag => {
                    if (!obj[tag]) obj[tag] = [];
                    obj[tag].push(cur)
                })
            } else {
                obj['未分类'].push(cur);
            }
            return obj;
        }, {'未分类': []})
        createTagPage(listGroupByTag, PositionInfo);
        setTimeout(() => {
            const tagTitle = document.getElementById(window.location.hash.replace('#', ''))
            if (tagTitle) {
                tagTitle.scrollIntoView()
            }
        })
    })
}