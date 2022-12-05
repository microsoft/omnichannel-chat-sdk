const http = require('http');
const fs = require('fs');
const path = require('path');

const staticPagePath = path.join(path.dirname(__dirname), 'public', 'index.html');

const entryPoint = staticPagePath;

const staticFiles = [
    path.join(path.dirname(__dirname), 'dist', 'lib.js'),
];

const staticDir = [
    path.join(path.dirname(__dirname), 'public', 'scripts'),
    path.join(path.dirname(__dirname), 'public', 'images')
];

const buildStaticFiles = async () => {
    staticDir.forEach(async (dir) => {
        const files = await fs.readdirSync(dir);
        files.forEach((file) => {
            staticFiles.push(path.join(dir, file));
        });
    });
}

const run = async () => {
    await buildStaticFiles();
}

run();

const renderDefaultPage = (res) => {
    res.setHeader("Content-type", "text/html");
    res.writeHead(200);
    fs.createReadStream(entryPoint).pipe(res);
};

const renderStaticFile = (staticFile, res) => {
    res.writeHead(200);
    fs.createReadStream(staticFile).pipe(res);
}

const server = http.createServer((req, res) => {
    try {
        if (req.url === "/") {
            renderDefaultPage(res);
            return;
        }

        const staticFileResult = staticFiles.filter((file) => file.replace(/\\/g, "/").endsWith(req.url.slice(1)));

        if (staticFileResult.length > 0) {
            const staticFile = staticFileResult[0];
            renderStaticFile(staticFile, res);
            return;
        }

        renderDefaultPage(res);
    } catch {
        console.log(`Invalid path: ${req.url}`);
        renderDefaultPage(res);
    }
})

server.listen(process.env.PORT || 8080);