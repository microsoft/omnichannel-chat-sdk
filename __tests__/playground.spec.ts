// import OmnichannelChatSDK from '../src/OmnichannelChatSDK';
const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;
import { isCoreServicesOrgUrlDNSError } from '../src/utils/internalUtils';
import setOcUserAgent from '../src/utils/setOcUserAgent';

describe('Playground', () => {
    xit("foo", async () => {
        const omnichannelConfig = {
            orgUrl: 'https://unqorgId-crmtest.crmlivetie.com',
            orgId: 'org-id',
            widgetId: 'widget-id'
        };

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

        const axiosErrorObject: any = {code: "ERR_NETWORK", isAxiosError: true};

        chatSDK.OCClient = {};
        chatSDK.OCClient.getChatConfig = jest.fn(() => {throw axiosErrorObject});
        (chatSDK as any).unqServicesOrgUrl = omnichannelConfig.orgUrl;
        (chatSDK as any).coreServicesOrgUrl = "https://m-[data-org-id].test.omnichannelengagementhub.com";
        (chatSDK as any).dynamicsLocationCode = "crmtest";

        // try {
        //     await chatSDK.initialize();
        // } catch (e) {
        //     console.log(e);
        // }
        try {
            await (chatSDK as any).getChatConfig();
        } catch (error) {
            console.log(error);
        }

        console.log((chatSDK as any).unqServicesOrgUrl);
        console.log((chatSDK as any).coreServicesOrgUrl);
        console.log(chatSDK.OCClient.getChatConfig.mock);
    });

    it("ChatSDK.initialize() should pass default 'omnichannel-chat-sdk' user agent", async () => {
        const omnichannelConfig = {
            orgUrl: '[data-org-url]',
            orgId: '[data-org-id]',
            widgetId: '[data-app-id]'
        };

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.getChatConfig = jest.fn();
        await chatSDK.initialize();
        console.log(chatSDK.OCClient.ocUserAgent);
    });


    it("ChatSDK.initialize() with additional user agent should be added as part of oc user agent", async () => {
        const omnichannelConfig = {
            orgUrl: '[data-org-url]',
            orgId: '[data-org-id]',
            widgetId: '[data-app-id]'
        };

        const chatSDKConfig = {
            ocUserAgent: ["user-agent"]
        }
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
        chatSDK.getChatConfig = jest.fn();
        await chatSDK.initialize();
        console.log(chatSDK.OCClient.ocUserAgent);
    });    
});