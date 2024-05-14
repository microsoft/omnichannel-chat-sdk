const setOcUserAgent = (OCClient: any) => {
    const version = require('../../package.json').version;
    const userAgent = `omnichannel-chat-sdk/${version}`;
    OCClient.ocUserAgent = [userAgent, ...OCClient.ocUserAgent];
}

export default setOcUserAgent;