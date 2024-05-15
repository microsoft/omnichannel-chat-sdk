const setOcUserAgent = (OCClient: any, ocUserAgent?: string[]): void => { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types 
    const version = require('../../package.json').version; // eslint-disable-line @typescript-eslint/no-var-requires
    const userAgent = `omnichannel-chat-sdk/${version}`;
    OCClient.ocUserAgent = [userAgent, ...OCClient.ocUserAgent];

    if (ocUserAgent) {
        OCClient.ocUserAgent = [...ocUserAgent, ...OCClient.ocUserAgent];
    }
}

export default setOcUserAgent;