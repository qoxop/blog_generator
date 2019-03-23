const Koa = require('koa')
const path = require('path')
const route = require('koa-route')
const static = require('koa-static')
const websockify = require('koa-websocket')

process.env.dev = true;

const app = websockify(new Koa())

//设置静态资源的路径 
app.use(static(
    path.join(__dirname,  './site')
))

app.use( ctx => {
  ctx.body = '<h1>404</h1>'
})

// // websocket
// app.ws.use(route.all('/hot_reload', (ctx) => {
//   ctx.websocket.on('message', function() {
//     reloadHanders.push(() => ctx.websocket.send('reload page'))
//   });
// }));

app.listen(3000, () => {
  console.log('server is starting at port 3000')
})