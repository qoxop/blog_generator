const myEvent = (function() {
    let cbsStore = {};
    return {
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


function createArticleList(list) {
    const fragment = document.createDocumentFragment();
    list.forEach(item => {
        const li = document.createElement('li');
        const tpl = `
            <div class="time">
                <time>${item.date}</time>
            </div>
            <div class="article-info">
                <div class="article-title">
                    <a href="#" class="article-link">${item.title}</a>
                </div>
                <div class="article-tags">
                    ${item.tags.map(tag => ("<a href=\"#\">"+tag+"</a>")).join('')}
                </div>
            </div>
        `
        li.innerHTML = tpl;
        fragment.appendChild(li);
    })
    return fragment;
}

const BODY_SCROLL_EVENT = {
    DOWN: 'bodyScrollDown',
    UP: 'bodyScrollUp',
    TOP: 'bodyScrollTop',
    BOTTOM: 'bodyScrollBottom'
}
function handlerBodyScroll () {
    let PreY =  document.body.getBoundingClientRect().y;
    let td = 0;
    document.body.onscroll = (e) => {
        if (td === 0) {
            td = setTimeout(() => {
                td = 0;
                const DOMRect = document.body.getBoundingClientRect();
                const curY = DOMRect.y;
                const curBottom = DOMRect.bottom;
                if(curY - PreY < -1) {
                    myEvent.emit(BODY_SCROLL_EVENT.DOWN, e);
                }
                if(curY - PreY > 1) {
                    myEvent.emit(BODY_SCROLL_EVENT.UP, e);
                }
                if(curY > -1) {
                    myEvent.emit(BODY_SCROLL_EVENT.TOP, e);
                }
                if(window.innerHeight - curBottom < 16) {
                    myEvent.emit(BODY_SCROLL_EVENT.BOTTOM, e);
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


window.addEventListener('load', () => {
    console.log(666)
    handlerBodyScroll();
    autoHideHeader();
})