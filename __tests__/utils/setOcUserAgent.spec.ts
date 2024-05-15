import setOcUserAgent from "../../src/utils/setOcUserAgent";

describe("setOcUserAgent", () => {
    it("setOcUserAgent() should add `omnichannel-chat-sdk` as oc user agent", () => {
        const OCClient = {
            ocUserAgent: []
        }

        setOcUserAgent(OCClient, []);

        const version = require("../../package.json").version;
        const userAgent = `omnichannel-chat-sdk/${version}`;
        const expectedResult = [userAgent];

        expect(OCClient.ocUserAgent).toEqual(expectedResult);
    });
});
