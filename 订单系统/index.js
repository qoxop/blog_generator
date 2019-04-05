const Koa = require('koa')
const path = require('path')
const static = require('koa-static')


const app = new Koa()

//设置静态资源的路径 
app.use(static(
    path.join(__dirname,  './')
))

app.use( ctx => {
    ctx.body = '<h1>404</h1>'
})

app.listen(3000, () => {
    console.log('server is starting at port 3000')
})