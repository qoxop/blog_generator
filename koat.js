const Koa = require('koa')

const app= new Koa()

app.use((ctx, next) => {
    if (ctx.request.path === '/') {
        console.log(1);
        next();
        console.log(2)
    }
})

app.use((ctx, next) => {
    if (ctx.request.path === '/') {
        console.log(3);
        next();
        console.log(4)
    }
})

app.use((ctx, next) => {
    if (ctx.request.path === '/') {
        console.log(5);
        ctx.body = 'Hello World';
        console.log(6)
    }
})
app.listen(3000)