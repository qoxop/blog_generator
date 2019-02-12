const Koa = require('koa')
const path = require('path')
const route = require('koa-route')
const static = require('koa-static')
const websockify = require('koa-websocket')
const { generateHtmlFiles, copyDirDeep } = require('./src/generate')
const hotReload = require('./src/hotReloadServe')

process.env.dev = true;

const pathInfo = {
  inputPath: 'C:/work/notes',
  outputPath: path.join(__dirname, './site/'),
  srcPath: path.join(__dirname, './src/'),
  assetsPath: path.join(__dirname, './assets/'),
  baseUrl: ''
}

const reloadHanders = [];

hotReload(
  pathInfo,
  generateHtmlFiles(pathInfo),
  copyDirDeep(pathInfo.assetsPath, path.join(pathInfo.outputPath, './assets/')),
  reloadHanders
)

const app = websockify(new Koa())

//设置静态资源的路径 
const staticPath = './site'
app.use(static(
    path.join(__dirname,  staticPath)
))

app.use( ctx => {
  ctx.body = '<h1>404</h1>'
})

// websocket
app.ws.use(route.all('/hot_reload', (ctx) => {
  ctx.websocket.on('message', function() {
    reloadHanders.push(() => ctx.websocket.send('reload page'))
  });
}));
 
app.listen(3000, () => {
  console.log('server is starting at port 3000')
})