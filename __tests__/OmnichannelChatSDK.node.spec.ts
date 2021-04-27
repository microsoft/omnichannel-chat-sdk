/**
 * @jest-environment node
 */

import AriaTelemetry from "../src/telemetry/AriaTelemetry";
import * as settings from '../src/config/settings';
import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";

const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;

describe('Omnichannel Chat SDK (Node)', () => {
    (settings as any).ariaTelemetryKey = '';
    AWTLogManager.initialize = jest.fn();

    const omnichannelConfig = {
        orgUrl: '',
        orgId: '',
        widgetId: ''
    };

    beforeEach(() => {
        jest.clearAllMocks();
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

        await chatSDK.initialize();

        chatSDK.OCClient.sessionInit = jest.fn();
        chatSDK.IC3Client.initialize = jest.fn();
        chatSDK.IC3Client.joinConversation = jest.fn();

        await chatSDK.startChat();

        try {
            await chatSDK.createChatAdapter();
        } catch (error) {
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

        await chatSDK.initialize();

        chatSDK.OCClient.sessionInit = jest.fn();
        chatSDK.IC3Client.initialize = jest.fn();
        chatSDK.IC3Client.joinConversation = jest.fn();

        await chatSDK.startChat();

        try {
            await chatSDK.getVoiceVideoCalling();
        } catch (error) {
            expect(error).toEqual('VoiceVideoCalling is only supported on browser');
        }
    });

    afterEach(() => {
        if (global.navigator) {
            (global as any).navigator = undefined;
        }
    });
});