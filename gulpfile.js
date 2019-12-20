const gulp = require('gulp');
const Koa = require('koa')
const path = require('path')
const route = require('koa-route')
const static = require('koa-static')
const websockify = require('koa-websocket')
const {spawn} = require('child_process')
const handleAssets = require('./gulpTasks/handleAssets')
const createArticlePage = require('./gulpTasks/createArticlePage')
const createJsonData = require('./gulpTasks/createJsonData');
const createPage = require('./gulpTasks/createOtherPage')
const {INPUT_PATH, REPO_PATH} = require('./meta')

let reloadHanders = [];
function runDevServe() {
    const app = websockify(new Koa())
    //设置静态资源的路径 
    const staticPath = './site'
    app.use(static(
        path.join(__dirname,  staticPath)
    ));
    // 404
    app.use( ctx => {
        ctx.body = '<h1>404</h1>'
    })
    // websocket
    app.ws.use(route.all('/hot_reload', (ctx) => {
        ctx.websocket.on('message', function(...p) {
            reloadHanders.push(() => ctx.websocket.send('reload page'))
        });
    }));
    // 监听
    app.listen(3000, () => {
        // opn('http://localhost', { app: ['chrome'] });
        console.log('server is starting at http://localhost:3000')
    })
}

function reload(cb) {
    reloadHanders.forEach((handle, index) => {
        try {
            if (typeof handle === 'function') {
                handle()
            } else {
                delete reloadHanders[index]
            }
        } catch (err) {
            delete reloadHanders[index]
        }
    })
    reloadHanders = reloadHanders.filter(handle => typeof handle === 'function')
    cb()
}

function setDev(cb) {
    process.env.dev = true;
    cb();
}

gulp.task('build', gulp.parallel(
    handleAssets,
    gulp.series(createArticlePage, createJsonData, createPage),
))
gulp.task('dev', gulp.series(
    setDev,
    'build',
    function(cb) {
        gulp.watch('./src/assets/**/*.*', gulp.series(handleAssets, reload))
        cb()
    },
    function(cb) {
        gulp.watch(['./src/*.html'], gulp.series(createArticlePage, createPage, reload))
        cb()
    },
    function(cb) {
        gulp.watch(INPUT_PATH, gulp.series(createArticlePage, createJsonData, createPage, reload))
        cb()
    },
    function (cb) {
        runDevServe();
        cb()
    }
))
// 发布到GitHubPage
gulp.task('publish', gulp.series(
    'build',
    () => gulp.src('./site/**/*.*').pipe(gulp.dest(REPO_PATH)),
    (cb) => {
        const add = spawn('git',['add', '-A'], {cwd: REPO_PATH, windowsHide: true})
        add.on('data', console.log)
        add.on('close', () => {
            const commit = spawn('git',['commit', '-m', '\'articlesChange\''], {cwd: REPO_PATH, windowsHide: true})
            console.log(`run command: git commmit -am 'articlesChange'`)
            commit.on('data', console.log)
            commit.on('close', code => {
                console.log(code)
                const push = spawn('git', ['push'], {cwd: REPO_PATH, windowsHide: true})
                push.on('data', console.log)
                push.on('close', cb)
            })
        })
        
    }
))