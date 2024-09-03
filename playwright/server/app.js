const express = require('express')
const fs = require('fs');
const path = require('path');

const app = express();
const entryPoint = path.join(path.dirname(__dirname), 'public', 'index.html');

app.use(express.static(entryPoint));
app.use('/scripts', express.static(path.join(path.dirname(__dirname), 'public', 'scripts')));
app.use('/images', express.static(path.join(path.dirname(__dirname), 'public', 'images')));
app.use('/dist', express.static(path.join(path.dirname(__dirname), 'dist')));

app.get('/', (req, res) => {
    res.setHeader("Content-type", "text/html");
    res.writeHead(200);
    fs.createReadStream(entryPoint).pipe(res);
});

app.listen(process.env.PORT || 8080);