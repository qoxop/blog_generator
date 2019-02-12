const http = require('http');
const sockjs = require('sockjs');

const wbss = sockjs.createServer();

wbss.on('connection', function(conn) {
    conn.on('data', function(msg) {
        conn.write(msg)
    })
})
const server = http.createServer();
wbss.attach(server);
server.listen(8081, '0.0.0.0')