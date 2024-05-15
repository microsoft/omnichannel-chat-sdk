const setOcUserAgent = (OCClient: any, ocUserAgent?: string[]) => {
    const version = require('../../package.json').version;
    const userAgent = `omnichannel-chat-sdk/${version}`;
    OCClient.ocUserAgent = [userAgent, ...OCClient.ocUserAgent];

    if (ocUserAgent) {
        OCClient.ocUserAgent = [...ocUserAgent, ...OCClient.ocUserAgent];
    }
}

export default setOcUserAgent;