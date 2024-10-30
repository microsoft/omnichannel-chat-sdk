/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @jest-environment node
 */

import * as settings from '../src/config/settings';

import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";
import AriaTelemetry from "../src/telemetry/AriaTelemetry";

const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;

describe('Omnichannel Chat SDK (Node) Parallel initialization', () => {
    (settings as any).ariaTelemetryKey = '';
    AWTLogManager.initialize = jest.fn();

    const omnichannelConfig = {
        orgUrl: '[data-org-url]',
        orgId: '[data-org-id]',
        widgetId: '[data-app-id]'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('ChatSDK.startChat() with sendDefaultInitContext should not work on non-browser platform', async () => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.getChatConfig = jest.fn();

        await chatSDK.initialize({ useParallelLoad: true });

        chatSDK.IC3Client = {
            initialize: jest.fn(),
            joinConversation: jest.fn()
        }

        const optionalParams = {
            sendDefaultInitContext: true
        }

        jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
            ChatId: '',
            Token: '',
            RegionGtms: '{}'
        }));

        jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());

        const errorMessage = 'UnsupportedPlatform';
        let failure = false;

        try {
            await chatSDK.startChat(optionalParams);
        } catch (error : any ) {
            failure = true;
            expect(error.message).toBe(errorMessage);
        }

        expect(failure).toBe(true);
    });

    it('ChatSDK.createChatAdapter() should not work on React Native platform', async () => {
        (global as any).navigator = {};
        (global.navigator as any).product = 'ReactNative';

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.scenarioMarker = {
            startScenario: jest.fn(),
            failScenario: jest.fn(),
            completeScenario: jest.fn()
        };
        chatSDK.getChatConfig = jest.fn();
        chatSDK.getChatToken = jest.fn();

        await chatSDK.initialize({ useParallelLoad: true });

        chatSDK.ACSClient.initialize = jest.fn();
        chatSDK.ACSClient.joinConversation = jest.fn();
        // if chatSDK.AMSClient is null, retry 3 times before failing and wait 2 second between each retry

        while (chatSDK.AMSClient === null) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        chatSDK.AMSClient.initialize = jest.fn();

        chatSDK.OCClient.sessionInit = jest.fn();

        await chatSDK.startChat();

        try {
            await chatSDK.createChatAdapter();
            fail("Error should have been thrown");
        } catch (error : any ) {
            console.log(error);
            expect(error).toEqual('ChatAdapter is only supported on browser');
        }
    });

    it('ChatSDK.getVoiceVideoCalling() should not work on React Native platform', async () => {
        (global as any).navigator = {};
        (global.navigator as any).product = 'ReactNative';

        const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK.scenarioMarker = {
            startScenario: jest.fn(),
            failScenario: jest.fn(),
            completeScenario: jest.fn()
        };
        chatSDK.getChatConfig = jest.fn();
        chatSDK.getChatToken = jest.fn();

        await chatSDK.initialize({ useParallelLoad: true });

        while (chatSDK.AMSClient === null) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        chatSDK.ACSClient.initialize = jest.fn();
        chatSDK.ACSClient.joinConversation = jest.fn();
        chatSDK.AMSClient.initialize = jest.fn();

        chatSDK.OCClient.sessionInit = jest.fn();

        jest.spyOn(console, 'error');

        await chatSDK.startChat();

        try {
            await chatSDK.getVoiceVideoCalling();
            fail("Error should have been thrown");
        } catch (error : any ) {
            console.log(error);
            expect(error.message).toEqual('UnsupportedPlatform');
            expect(console.error).toHaveBeenCalledWith('VoiceVideoCalling is only supported on browser');
        }
    });

    afterEach(() => {
        if (global.navigator) {
            (global as any).navigator = undefined;
        }
    });
});