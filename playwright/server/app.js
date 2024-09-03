const express = require('express')
const fs = require('fs');
const path = require('path');

const app = express();
const entryPoint = path.join(path.dirname(__dirname), 'public', 'debug.html');

app.use(express.static(entryPoint));
app.use('/scripts', express.static(path.join(path.dirname(__dirname), 'public', 'scripts')));
app.use('/images', express.static(path.join(path.dirname(__dirname), 'public', 'images')));
app.use('/dist', express.static(path.join(path.dirname(__dirname), 'dist')));

app.get('/', (req, res) => {
    res.setHeader("Content-type", "text/html");
    res.writeHead(200);
    fs.createReadStream(entryPoint).pipe(res);
});

app.get('/api/liveworkitem/:id', async (req, res) => {
    let response = {};
    let responseStatusCode = 400;
    const {params, query} = req;

    if (!query.orgId || !query.orgUrl || !query.widgetId) {
        res.writeHead(responseStatusCode);
        res.end();
        return;
    }

    try {
        const headers = {"Content-Type": "application/json"};
        const endpoint = query.auth === 'true'? `livechatconnector/getliveworkitemdetails`: `livechatconnector/auth/getliveworkitemdetails`;
        const requestPath = `${endpoint}/${query.orgId}/${query.widgetId}/${params.id}`;
        const url = `${query.orgUrl}/${requestPath}?channelId=lcw`;

        const apiResponse = await fetch(url, {headers});
        if (apiResponse.ok) {
            const liveWorkItemDetails = await apiResponse.json();
            const { State: state, ConversationId: conversationId } = liveWorkItemDetails;
            responseStatusCode = 200;
            response = {state, conversationId};
        }
    } catch (err) {
        responseStatusCode = 500;
        res.end();
        return;
    }

    res.writeHead(responseStatusCode);
    res.end(JSON.stringify(response));
});

app.listen(process.env.PORT || 8080);