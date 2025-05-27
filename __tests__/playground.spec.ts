// import OmnichannelChatSDK from '../src/OmnichannelChatSDK';
const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;
import { isCoreServicesOrgUrlDNSError } from '../src/utils/internalUtils';
import setOcUserAgent from '../src/utils/setOcUserAgent';
import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";
import ACSClient from '../src/core/messaging/ACSClient';

jest.mock('@azure/communication-common');
jest.mock('@azure/communication-chat');
describe('Playground', () => {
    AWTLogManager.initialize = jest.fn();

    beforeAll(() => {
        if (global.navigator) {
            (global as any).navigator = undefined;
        }

        if (global.window.document) {
            (global as any).window.document = undefined;
        }
    });

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

    xit("ChatSDK.initialize() should pass default 'omnichannel-chat-sdk' user agent", async () => {
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


    xit("ChatSDK.initialize() with additional user agent should be added as part of oc user agent", async () => {
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

    it('ACSClient.conversation.registerOnNewMessage() with disablePolling set as \'true\' should NOT call ChatThreadClient.getMessages()', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();
        client.chatClient.on = jest.fn();

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        conversation.keepPolling = true;
        jest.spyOn(conversation, 'getMessages').mockResolvedValue([{id: 'id', sender: {displayName: 'name'}}]);

        (global as any).setTimeout = jest.fn();
        await conversation.registerOnNewMessage(() => {}, {disablePolling: true});

        expect(conversation.getMessages).toHaveBeenCalledTimes(0);
    });
});