const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;
import IFileInfo from "@microsoft/omnichannel-ic3core/lib/interfaces/IFileInfo";
import FileSharingProtocolType from "@microsoft/omnichannel-ic3core/lib/model/FileSharingProtocolType";
import IFileMetadata from "@microsoft/omnichannel-ic3core/lib/model/IFileMetadata";
import IMessage from "@microsoft/omnichannel-ic3core/lib/model/IMessage";
import PersonType from "@microsoft/omnichannel-ic3core/lib/model/PersonType";
import libraries from "../src/utils/libraries";
import ChatAdapterProtocols from "../src/core/ChatAdapterProtocols";
import AriaTelemetry from "../src/telemetry/AriaTelemetry";
import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";

describe('Omnichannel Chat SDK', () => {

    describe('Configurations', () => {
        it('ChatSDK should require omnichannelConfig as parameter', () => {
            try {
                new OmnichannelChatSDK();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('ChatSDK should throw an error if a required omnichannelConfig value is missing', () => {
            const omnichannelConfig = {
                orgUrl: '',
                orgId: ''
            };

            try {
                new OmnichannelChatSDK(omnichannelConfig);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('ChatSDK should be able to pick custom ic3ClientVersion if set', async () => {
            const omnichannelConfig = {
                orgUrl: '',
                orgId: '',
                widgetId: ''
            };

            const chatSDKConfig = {
                ic3Config: {
                    ic3ClientVersion: 'version'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            const url = chatSDK.resolveIC3ClientUrl();

            expect(url).toBe(libraries.getIC3ClientCDNUrl(chatSDKConfig.ic3Config.ic3ClientVersion));
        });

        it('ChatSDK should be able to pick custom ic3ClientCDNUrl if set', async () => {
            const omnichannelConfig = {
                orgUrl: '',
                orgId: '',
                widgetId: ''
            };

            const chatSDKConfig = {
                ic3Config: {
                    ic3ClientVersion: 'version',
                    ic3ClientCDNUrl: 'cdn'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            const url = chatSDK.resolveIC3ClientUrl();

            expect(url).toBe(chatSDKConfig.ic3Config.ic3ClientCDNUrl);
        });

        it('ChatSDK should pick the default ic3ClientCDNUrl if no ic3Config is set', async () => {
            const omnichannelConfig = {
                orgUrl: '',
                orgId: '',
                widgetId: ''
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            const url = chatSDK.resolveIC3ClientUrl();

            expect(url).toBe(libraries.getIC3ClientCDNUrl());
        });

        it('ChatSDK should be able to pick custom webChatIC3AdapterVersion if set', async () => {
            const omnichannelConfig = {
                orgUrl: '',
                orgId: '',
                widgetId: ''
            };

            const chatSDKConfig = {
                chatAdapterConfig: {
                    webChatIC3AdapterVersion: 'version'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            const url = chatSDK.resolveChatAdapterUrl(ChatAdapterProtocols.IC3);

            expect(url).toBe(libraries.getIC3AdapterCDNUrl(chatSDKConfig.chatAdapterConfig.webChatIC3AdapterVersion));
        });

        it('ChatSDK should be able to pick custom webChatIC3AdapterCDNUrl if set', async () => {
            const omnichannelConfig = {
                orgUrl: '',
                orgId: '',
                widgetId: ''
            };

            const chatSDKConfig = {
                chatAdapterConfig: {
                    webChatIC3AdapterVersion: 'version',
                    webChatIC3AdapterCDNUrl: 'cdn'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            const url = chatSDK.resolveChatAdapterUrl(ChatAdapterProtocols.IC3);

            expect(url).toBe(chatSDKConfig.chatAdapterConfig.webChatIC3AdapterCDNUrl);
        });

        it('ChatSDK should pick the default webChatIC3AdapterCDNUrl if no chatAdapterConfig is set', async () => {
            const omnichannelConfig = {
                orgUrl: '',
                orgId: '',
                widgetId: ''
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            const url = chatSDK.resolveChatAdapterUrl(ChatAdapterProtocols.IC3);

            expect(url).toBe(libraries.getIC3AdapterCDNUrl());
        });

        it('ChatSDK should throw an error if ChatSDK.resolveChatAdapterUrl() is called with other protocol than IC3', async () => {
            const omnichannelConfig = {
                orgUrl: '',
                orgId: '',
                widgetId: ''
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

            const protocol = ChatAdapterProtocols.DirectLine;
            try {
                chatSDK.resolveChatAdapterUrl(protocol);
            } catch (error) {
                expect(error.toString()).toContain(`ChatAdapter for protocol ${protocol} currently not supported`);
            }
        });

        it('Telemetry should be disabled if set', () => {
            const omnichannelConfig = {
                orgUrl: '',
                orgId: '',
                widgetId: ''
            };

            const chatSDKConfig = {
                telemetry: {
                    disable: true
                }
            };

            jest.spyOn(AriaTelemetry, 'disable');

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);

            expect(chatSDK.chatSDKConfig.telemetry.disable).toBe(true);
            expect(AriaTelemetry.disable).toHaveBeenCalledTimes(1);
        });

        it('Telemetry should be enabled by default', () => {
            jest.clearAllMocks();

            const omnichannelConfig = {
                orgUrl: '',
                orgId: '',
                widgetId: ''
            };

            jest.spyOn(AriaTelemetry, 'disable');

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

            expect(chatSDK.chatSDKConfig.telemetry.disable).toBe(false);
            expect(AriaTelemetry.disable).toHaveBeenCalledTimes(0);
        });

        it('ChatSDK should be able to pick up custom ariaTelemetryKey if set', () => {
            const omnichannelConfig = {
                orgUrl: '',
                orgId: '',
                widgetId: ''
            };

            const chatSDKConfig = {
                telemetry: {
                    ariaTelemetryKey: 'custom'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);

            expect(chatSDK.chatSDKConfig.telemetry.ariaTelemetryKey).toBe(chatSDKConfig.telemetry.ariaTelemetryKey);
        });
    });

    describe('Functionalities', () => {
        const omnichannelConfig = {
            orgUrl: '',
            orgId: '',
            widgetId: ''
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('ChatSDK.initialize() should instantiate OCSDK & IC3Core/IC3Client', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            jest.spyOn(chatSDK, 'getIC3Client');

            await chatSDK.initialize();

            expect(chatSDK.getIC3Client).toHaveBeenCalledTimes(1);
            expect(chatSDK.getChatConfig).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient).toBeDefined();
            expect(chatSDK.IC3Client).toBeDefined();
        });

        it('ChatSDK.initialize() call multiple times should instantiate OCSDK & IC3Core/IC3Client only once', async () => {
            jest.resetAllMocks();

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            jest.spyOn(chatSDK, 'getIC3Client');

            await chatSDK.initialize();
            await chatSDK.initialize();
            await chatSDK.initialize();

            expect(chatSDK.isInitialized).toBe(true);
            expect(chatSDK.getIC3Client).toHaveBeenCalledTimes(1);
            expect(chatSDK.getChatConfig).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.getPreChatSurvey() with preChat enabled should return a pre chat survey', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            const samplePreChatSurvey = '{"type":"AdaptiveCard", "version":"1.1", "body":[]}';

            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => Promise.resolve({
                DataMaskingInfo: {
                    setting: {
                        msdyn_maskforcustomer: 'false'
                    }
                },
                LiveWSAndLiveChatEngJoin: {
                    PreChatSurvey: samplePreChatSurvey,
                    msdyn_prechatenabled: 'true'
                }
            }));

            await chatSDK.getLiveChatConfig(false);
            const preChatSurvey = await chatSDK.getPreChatSurvey(false);
            expect(preChatSurvey).toBe(samplePreChatSurvey);
        });

        it('ChatSDK.getPreChatSurvey() with preChat disabled should NOT return a pre chat survey', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            const samplePreChatSurvey = '{"type":"AdaptiveCard", "version":"1.1", "body":[]}';

            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => Promise.resolve({
                DataMaskingInfo: {
                    setting: {
                        msdyn_maskforcustomer: 'false'
                    }
                },
                LiveWSAndLiveChatEngJoin: {
                    PreChatSurvey: samplePreChatSurvey,
                    msdyn_prechatenabled: false
                }
            }));

            await chatSDK.getLiveChatConfig(false);
            const preChatSurvey = await chatSDK.getPreChatSurvey(false);
            expect(preChatSurvey).toBe(null);
        });

        it('ChatSDK.getDataMaskingRules() should return active data masking rules', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            const dataMaskingRules = {
                'SSN': "\\b(?!000|666|9)\\d{3}[- ]?(?!00)\\d{2}[- ]?(?!0000)\\d{4}\\b"
            }

            chatSDK.dataMaskingRules = dataMaskingRules;

            await chatSDK.initialize();

            expect(await chatSDK.getDataMaskingRules()).toBe(dataMaskingRules);
        });

        it('ChatSDK.startchat() should start an OC chat', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();

            expect(chatSDK.OCClient.getChatToken).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(1);
            expect(chatSDK.IC3Client.initialize).toHaveBeenCalledTimes(1);
            expect(chatSDK.IC3Client.joinConversation).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.startChat() should fail if OCClient.sessiontInit() fails', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockRejectedValue(Promise.reject());
            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve());

            jest.spyOn(console, 'error');

            try {
                await chatSDK.startChat();
            } catch (error) {
                expect(console.error).toHaveBeenCalled();
            }

            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(1);
            expect(chatSDK.IC3Client.initialize).toHaveBeenCalledTimes(0);
            expect(chatSDK.IC3Client.joinConversation).toHaveBeenCalledTimes(0);
        });

        it('ChatSDK.startChat() should fail if IC3Client.initialize() fails', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'initialize').mockRejectedValue(Promise.reject());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve());

            jest.spyOn(console, 'error');

            try {
                await chatSDK.startChat();
            } catch (error) {
                expect(console.error).toHaveBeenCalled();
            }

            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(1);
            expect(chatSDK.IC3Client.initialize).toHaveBeenCalledTimes(1);
            expect(chatSDK.IC3Client.joinConversation).toHaveBeenCalledTimes(0);
        });

        it('ChatSDK.startChat() should fail if IC3Client.joinConversation() fails', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockRejectedValue(Promise.reject());

            jest.spyOn(console, 'error');

            try {
                await chatSDK.startChat();
            } catch (error) {
                expect(console.error).toHaveBeenCalled();
            }

            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(1);
            expect(chatSDK.IC3Client.initialize).toHaveBeenCalledTimes(1);
            expect(chatSDK.IC3Client.joinConversation).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.startchat() with existing liveChatContext should not call OCClient.getChatToken()', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();
            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'getLWIDetails').mockResolvedValue(Promise.resolve({
                State: 'Open',
                ConversationId: 'id'
            }));
            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve());

            const liveChatContext = {
                chatToken: {
                    chatId: '',
                    token: '',
                    regionGtms: {}
                },
                requestId: 'requestId'
            }

            const optionaParams = {
                liveChatContext
            }

            await chatSDK.startChat(optionaParams);

            expect(chatSDK.OCClient.getChatToken).toHaveBeenCalledTimes(0);
            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(1);
            expect(chatSDK.IC3Client.initialize).toHaveBeenCalledTimes(1);
            expect(chatSDK.IC3Client.joinConversation).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.startChat() with invalid liveChatContext should throw an error', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();
            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'getLWIDetails').mockResolvedValue(Promise.reject());

            const liveChatContext = {
                chatToken: {
                    chatId: '',
                    token: '',
                    regionGtms: {}
                },
                requestId: 'requestId'
            }

            const optionaParams = {
                liveChatContext
            }

            try {
                await chatSDK.startChat(optionaParams);
            } catch (error) {
                expect(error.message).toEqual('InvalidConversation');
            }
        });


        it('ChatSDK.startChat() with liveChatContext of a closed conversation should throw an error', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();
            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'getLWIDetails').mockResolvedValue(Promise.resolve({
                State: 'Closed',
                ConversationId: 'id'
            }));

            const liveChatContext = {
                chatToken: {
                    chatId: '',
                    token: '',
                    regionGtms: {}
                },
                requestId: 'requestId'
            }

            const optionaParams = {
                liveChatContext
            }

            try {
                await chatSDK.startChat(optionaParams);
            } catch (error) {
                expect(error.message).toEqual('ClosedConversation');
            }
        });

        it('ChatSDK.getLiveChatConfig() should return the cached value by default', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            chatSDK.liveChatConfig = {
                id: 0
            }

            const liveChatConfig = await chatSDK.getLiveChatConfig();

            expect(liveChatConfig.id).toBe(chatSDK.liveChatConfig.id);
            expect(chatSDK.getChatConfig).toHaveBeenCalledTimes(0);
        });

        it('ChatSDK.startChat() with preChatResponse should pass it to OCClient.sessionInit() call\'s optional parameters', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            chatSDK.IC3Client = {
                initialize: jest.fn(),
                joinConversation: jest.fn()
            }

            const optionaParams = {
                preChatResponse: 'preChatResponse'
            }

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat(optionaParams);

            const sessionInitOptionalParams = {
                initContext: {
                    preChatResponse: optionaParams.preChatResponse
                }
            }

            expect(chatSDK.OCClient.sessionInit.mock.calls[0][1]).toMatchObject(sessionInitOptionalParams);
        });

        it('ChatSDK.startChat() with customContext, browser, os, locale, device defined in sessionInitOptionalParams should pass it to OCClient.sessionInit() call\'s optional parameters', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            chatSDK.IC3Client = {
                initialize: jest.fn(),
                joinConversation: jest.fn()
            }

            const optionaParams = {
                preChatResponse: 'preChatResponse',
                customContext: {},
                browser: 'browser',
                os: 'os',
                locale: 'locale',
                device: 'device'
            }

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat(optionaParams);

            const sessionInitOptionalParams = {
                initContext: {
                    preChatResponse: optionaParams.preChatResponse,
                    browser: optionaParams.browser,
                    os: optionaParams.os,
                    locale: optionaParams.locale,
                    device: optionaParams.device
                }
            }

            expect(chatSDK.OCClient.sessionInit.mock.calls[0][1]).toMatchObject(sessionInitOptionalParams);
        });

        it('ChatSDK.startChat() with initContext defined should override IStartChatOptionalParams', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            chatSDK.IC3Client = {
                initialize: jest.fn(),
                joinConversation: jest.fn()
            }

            const optionaParams = {
                preChatResponse: 'preChatResponse',
                customContext: {},
                browser: 'browser',
                os: 'os',
                locale: 'locale',
                device: 'device',
                initContext: {
                    preChatResponse: 'override',
                    customContext: 'override',
                    browser: 'override',
                    os: 'override',
                    locale: 'override',
                    device: 'override'
                }
            }

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat(optionaParams);

            const sessionInitOptionalParams = {
                initContext: {
                    preChatResponse: optionaParams.initContext.preChatResponse,
                    customContext: optionaParams.initContext.customContext,
                    browser: optionaParams.initContext.browser,
                    os: optionaParams.initContext.os,
                    locale: optionaParams.initContext.locale,
                    device: optionaParams.initContext.device
                }
            }

            expect(chatSDK.OCClient.sessionInit.mock.calls[0][1]).toMatchObject(sessionInitOptionalParams);
        });

        it('ChatSDK.startChat() with authenticatedUserToken should pass it to OCClient.sessionInit() call\'s optional parameters', async() => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    return 'authenticatedUserToken'
                }
            };
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            const oldGetChatConfig = chatSDK.getChatConfig;
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            chatSDK.IC3Client = {
                initialize: jest.fn(),
                joinConversation: jest.fn()
            }

            const optionaParams = {
                authenticatedUserToken: 'authenticatedUserToken'
            }

            jest.spyOn(chatSDK.OCClient, 'getChatConfig').mockResolvedValue(Promise.resolve({
                DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
                LiveWSAndLiveChatEngJoin: { PreChatSurvey: { msdyn_prechatenabled: false } },
                LiveChatConfigAuthSettings: {}
            }));

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());

            chatSDK.getChatConfig = oldGetChatConfig;
            await chatSDK.getChatConfig();

            await chatSDK.startChat({});

            const sessionInitOptionalParams = {
                authenticatedUserToken: optionaParams.authenticatedUserToken,
                initContext: {}
            }

            // console.warn(chatSDK.OCClient.sessionInit.mock.calls[0][1]);

            expect(chatSDK.OCClient.sessionInit.mock.calls[0][1]).toMatchObject(sessionInitOptionalParams);
        });

        it('ChatSDK.getCurrentLiveChatContext() should return chat session data', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            chatSDK.IC3Client = {
                initialize: jest.fn(),
                joinConversation: jest.fn()
            }

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();

            const chatContext = await chatSDK.getCurrentLiveChatContext();

            expect(Object.keys(chatContext).includes('chatToken')).toBe(true);
            expect(Object.keys(chatContext).includes('requestId')).toBe(true);
        });

        it('ChatSDK.getCurrentLiveChatContext() with empty chatToken should return an empty chat session data', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            chatSDK.IC3Client = {
                initialize: jest.fn(),
                joinConversation: jest.fn()
            }

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());

            const chatContext = await chatSDK.getCurrentLiveChatContext();

            expect(Object.keys(chatContext).length).toBe(0);
            expect(Object.keys(chatContext).includes('chatToken')).toBe(false);
            expect(Object.keys(chatContext).includes('requestId')).toBe(false);
        });

        it('ChatSDK.getConversationDetails() should call OCClient.getLWIDetails()', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            chatSDK.IC3Client = {
                initialize: jest.fn(),
                joinConversation: jest.fn()
            }

            jest.spyOn(chatSDK.OCClient, 'getLWIDetails').mockResolvedValue({
                State: 'state',
                ConversationId: 'id',
                AgentAcceptedOn: 'agentAcceptedOn'
            });

            await chatSDK.getConversationDetails();

            expect(chatSDK.OCClient.getLWIDetails).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.getMessages should call conversation.getMessages()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve({
                getMessages: () => {}
            }));

            await chatSDK.startChat();

            jest.spyOn(chatSDK.conversation, 'getMessages').mockResolvedValue(Promise.resolve());

            await chatSDK.getMessages();
            expect(chatSDK.conversation.getMessages).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.sendMessage() should mask characters if enabled', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve({
                sendMessage: (message: any) => {}
            }));

            await chatSDK.startChat();
            jest.spyOn(chatSDK.conversation, 'sendMessage').mockResolvedValue(Promise.resolve());

            chatSDK.chatSDKConfig = {
                dataMasking: {
                    disable: false,
                    maskingCharacter: '#'
                }
            }

            chatSDK.dataMaskingRules = {
                'SSN': "\\b(?!000|666|9)\\d{3}[- ]?(?!00)\\d{2}[- ]?(?!0000)\\d{4}\\b"
            }

            const messageToSend = {
                content: 'Sending my SSN 514-12-3456'
            }

            const regex = new RegExp(chatSDK.dataMaskingRules.SSN as string, 'g');
            let match;
            let {content} = messageToSend;
            while (match = regex.exec(content)) {
                let replaceStr = match[0].replace(/./g, chatSDK.chatSDKConfig.dataMasking.maskingCharacter);
                content = content.replace(match[0], replaceStr);
            }

            await chatSDK.sendMessage(messageToSend);

            expect(chatSDK.chatSDKConfig.dataMasking.disable).toBe(false);
            expect(chatSDK.conversation.sendMessage).toHaveBeenCalledTimes(1);
            expect((chatSDK.conversation.sendMessage.mock.calls[0][0] as any).content).toBe(content);
        });

        it('ChatSDK.sendMessage() should NOT mask characters if disabled', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve({
                sendMessage: (message: any) => {}
            }));

            await chatSDK.startChat();
            jest.spyOn(chatSDK.conversation, 'sendMessage').mockResolvedValue(Promise.resolve());

            chatSDK.chatSDKConfig = {
                dataMasking: {
                    disable: true,
                    maskingCharacter: '#'
                }
            }

            chatSDK.dataMaskingRules = {
                'SSN': "\\b(?!000|666|9)\\d{3}[- ]?(?!00)\\d{2}[- ]?(?!0000)\\d{4}\\b"
            }

            const messageToSend = {
                content: 'Sending my SSN 514-12-3456'
            }

            await chatSDK.sendMessage(messageToSend);

            expect(chatSDK.chatSDKConfig.dataMasking.disable).toBe(true);
            expect(chatSDK.conversation.sendMessage).toHaveBeenCalledTimes(1);
            expect((chatSDK.conversation.sendMessage.mock.calls[0][0] as any).content).toBe(messageToSend.content);
        });

        it('ChatSDK.sendMessage() should send message with custom tags if set', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve({
                sendMessage: (message: any) => {}
            }));

            await chatSDK.startChat();
            jest.spyOn(chatSDK.conversation, 'sendMessage').mockResolvedValue(Promise.resolve());

            const messageToSend = {
                content: 'sample',
                tags: ['system']
            }

            await chatSDK.sendMessage(messageToSend);
            expect(chatSDK.conversation.sendMessage).toHaveBeenCalledTimes(1);
            expect((chatSDK.conversation.sendMessage.mock.calls[0][0] as any).tags.length).not.toBe(0);
        });

        it('ChatSDK.sendMessage() should send message with custom timestamp if set', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve({
                sendMessage: (message: any) => {}
            }));

            await chatSDK.startChat();
            jest.spyOn(chatSDK.conversation, 'sendMessage').mockResolvedValue(Promise.resolve());

            const messageToSend = {
                content: 'sample',
                timestamp: 'timestamp'
            }

            await chatSDK.sendMessage(messageToSend);
            expect(chatSDK.conversation.sendMessage).toHaveBeenCalledTimes(1);
            expect((chatSDK.conversation.sendMessage.mock.calls[0][0] as any).timestamp).toEqual(messageToSend.timestamp);
        });

        it('ChatSDK.sendTypingEvent() should call conversation.sendMessageToBot()', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve({
                indicateTypingStatus: (value: number) => {},
                getMembers: () => {},
                sendMessageToBot: (botId: string, message: any) => {}
            }));

            await chatSDK.startChat();

            const members = [
                {id: 'id', type: PersonType.Bot}
            ];

            jest.spyOn(chatSDK.conversation, 'indicateTypingStatus').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.conversation, 'getMembers').mockResolvedValue(Promise.resolve(members));
            jest.spyOn(chatSDK.conversation, 'sendMessageToBot').mockResolvedValue(Promise.resolve());

            await chatSDK.sendTypingEvent();
            expect(chatSDK.conversation.indicateTypingStatus).toHaveBeenCalledTimes(1);
            expect(chatSDK.conversation.getMembers).toHaveBeenCalledTimes(1);
            expect(chatSDK.conversation.sendMessageToBot).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.sendTypingEvent() should fail if conversation.sendMessageToBot() fails', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve({
                indicateTypingStatus: (value: number) => {},
                getMembers: () => {},
                sendMessageToBot: (botId: string, message: any) => {}
            }));

            await chatSDK.startChat();

            const members = [
                {id: 'id', type: PersonType.Bot}
            ];

            jest.spyOn(chatSDK.conversation, 'indicateTypingStatus').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.conversation, 'getMembers').mockResolvedValue(Promise.resolve(members));
            jest.spyOn(chatSDK.conversation, 'sendMessageToBot').mockRejectedValue(Promise.reject());

            jest.spyOn(console, 'error');

            try {
                await chatSDK.sendTypingEvent();
            } catch (error) {
                expect(console.error).toHaveBeenCalled();
            }

            expect(chatSDK.conversation.indicateTypingStatus).toHaveBeenCalledTimes(1);
            expect(chatSDK.conversation.getMembers).toHaveBeenCalledTimes(1);
            expect(chatSDK.conversation.sendMessageToBot).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.uploadFileAttachment() should call conversation.sendFileData() & conversation.sendFileMessage()', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve({
                sendFileData: (fileInfo: IFileInfo, fileSharingProtocolType: FileSharingProtocolType) => {},
                sendFileMessage: (fileMetaData: IFileMetadata, message: IMessage) => {}
            }));

            await chatSDK.startChat();

            jest.spyOn(chatSDK.conversation, 'sendFileData').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.conversation, 'sendFileMessage').mockResolvedValue(Promise.resolve());

            const fileInfo = {};
            await chatSDK.uploadFileAttachment(fileInfo);
            expect(chatSDK.conversation.sendFileData).toHaveBeenCalledTimes(1);
            expect(chatSDK.conversation.sendFileMessage).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.downloadFileAttachment() should call conversation.downloadFile()', async() => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve({
                downloadFile: () => {}
            }));

            await chatSDK.startChat();

            jest.spyOn(chatSDK.conversation, 'downloadFile').mockResolvedValue(Promise.resolve());

            const fileMetaData = {};
            await chatSDK.downloadFileAttachment(fileMetaData);
            expect(chatSDK.conversation.downloadFile).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.emailLiveChatTranscript() should call OCClient.emailTranscript()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'emailTranscript').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve({
                sendMessage: (message: any) => {}
            }));

            await chatSDK.startChat();

            const emailBody = {
                emailAddress: 'sample@microsoft.com',
                attachmentMessage: 'sample',
                CustomerLocale: 'sample'
            };

            await chatSDK.emailLiveChatTranscript(emailBody);

            expect(chatSDK.OCClient.emailTranscript).toHaveBeenCalledTimes(1);
        });


        it('ChatSDK.emailLiveChatTranscript() with authenticatedUserToken should pass it to OCClient.emailTranscript()', async () => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    return 'authenticatedUserToken'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            chatSDK.IC3Client.initialize = jest.fn();
            chatSDK.IC3Client.joinConversation = jest.fn();

            const optionaParams = {
                authenticatedUserToken: 'authenticatedUserToken'
            }

            jest.spyOn(chatSDK.OCClient, 'getChatConfig').mockResolvedValue(Promise.resolve({
                DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
                LiveWSAndLiveChatEngJoin: { PreChatSurvey: { msdyn_prechatenabled: false } },
                LiveChatConfigAuthSettings: {}
            }));

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'emailTranscript').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();
            chatSDK.authenticatedUserToken = optionaParams.authenticatedUserToken;

            const emailBody = {
                emailAddress: 'sample@microsoft.com',
                attachmentMessage: 'sample',
                CustomerLocale: 'sample'
            };

            const emailTranscriptOptionalParams = {
                authenticatedUserToken: optionaParams.authenticatedUserToken
            }

            await chatSDK.emailLiveChatTranscript(emailBody);

            expect(chatSDK.OCClient.emailTranscript).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[0][3]).toMatchObject(emailTranscriptOptionalParams);
        });

        it('ChatSDK.getLiveChatTranscript() should call OCClient.getChatTranscripts()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'getChatTranscripts').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve({
                sendMessage: (message: any) => {}
            }));

            await chatSDK.startChat();
            await chatSDK.getLiveChatTranscript();

            expect(chatSDK.OCClient.getChatTranscripts).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.getLiveChatTranscript() with authenticatedUserToken should pass it to OCClient.getChatTranscripts()', async () => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    return 'authenticatedUserToken'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            chatSDK.IC3Client.initialize = jest.fn();
            chatSDK.IC3Client.joinConversation = jest.fn();

            const optionaParams = {
                authenticatedUserToken: 'authenticatedUserToken'
            }

            jest.spyOn(chatSDK.OCClient, 'getChatConfig').mockResolvedValue(Promise.resolve({
                DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
                LiveWSAndLiveChatEngJoin: { PreChatSurvey: { msdyn_prechatenabled: false } },
                LiveChatConfigAuthSettings: {}
            }));

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'getChatTranscripts').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();
            chatSDK.authenticatedUserToken = optionaParams.authenticatedUserToken;

            await chatSDK.startChat();

            const getChatTranscriptOptionalParams = {
                authenticatedUserToken: optionaParams.authenticatedUserToken
            }

            await chatSDK.getLiveChatTranscript();

            expect(chatSDK.OCClient.getChatTranscripts).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.getChatTranscripts.mock.calls[0][3]).toMatchObject(getChatTranscriptOptionalParams);
        });

        it('ChatSDK.getIC3Client() should return IC3Core if platform is Node', async () => {
            const IC3SDKProvider = require('@microsoft/omnichannel-ic3core').SDKProvider;
            const platform = require('../src/utils/platform').default;
            const HostType = require('@microsoft/omnichannel-ic3core/lib/interfaces/HostType').default;

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            jest.spyOn(platform, 'isNode').mockReturnValue(true);
            jest.spyOn(platform, 'isReactNative').mockReturnValue(false);
            jest.spyOn(platform, 'isBrowser').mockReturnValue(false);
            jest.spyOn(chatSDK, 'getIC3Client');
            jest.spyOn(IC3SDKProvider, 'getSDK');

            await chatSDK.initialize();

            expect(chatSDK.getIC3Client).toHaveBeenCalledTimes(1);
            expect(chatSDK.IC3SDKProvider).toBeDefined();
            expect(IC3SDKProvider.getSDK).toHaveBeenCalledTimes(1);

            expect(IC3SDKProvider.getSDK.mock.calls[0][0].hostType).toBe(HostType.Page);
            expect(platform.isNode).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.getIC3Client() should return IC3Core if platform is RN', async () => {
            const IC3SDKProvider = require('@microsoft/omnichannel-ic3core').SDKProvider;
            const platform = require('../src/utils/platform').default;
            const HostType = require('@microsoft/omnichannel-ic3core/lib/interfaces/HostType').default;

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            jest.spyOn(platform, 'isNode').mockReturnValue(false);
            jest.spyOn(platform, 'isReactNative').mockReturnValue(true);
            jest.spyOn(platform, 'isBrowser').mockReturnValue(false);
            jest.spyOn(chatSDK, 'getIC3Client');
            jest.spyOn(IC3SDKProvider, 'getSDK');

            await chatSDK.initialize();

            expect(chatSDK.getIC3Client).toHaveBeenCalledTimes(1);
            expect(chatSDK.IC3SDKProvider).toBeDefined();
            expect(IC3SDKProvider.getSDK).toHaveBeenCalledTimes(1);

            expect(IC3SDKProvider.getSDK.mock.calls[0][0].hostType).toBe(HostType.Page);
            expect(platform.isReactNative).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.onNewMessage() with rehydrate flag should call ChatSDK.getMessages()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient.sessionInit = jest.fn();
            chatSDK.IC3Client.initialize = jest.fn();
            chatSDK.IC3Client.joinConversation = jest.fn();

            const messages = [
                {clientmessageid: 2},
                {clientmessageid: 1},
                {clientmessageid: 1},
                {clientmessageid: 0}
            ]

            await chatSDK.startChat();

            chatSDK.conversation = {
                registerOnNewMessage: jest.fn(),
                getMessages: jest.fn()
            };

            jest.spyOn(chatSDK, 'getMessages').mockResolvedValue(messages);

            await chatSDK.onNewMessage(() => {}, {rehydrate: true});

            expect(chatSDK.getMessages).toHaveBeenCalledTimes(1);
            expect(chatSDK.conversation.registerOnNewMessage).toHaveBeenCalledTimes(1);
        });

        it('Ability to add multiple "onNewMessage" event handler', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient.sessionInit = jest.fn();
            chatSDK.IC3Client.initialize = jest.fn();
            chatSDK.IC3Client.joinConversation = jest.fn();

            await chatSDK.startChat();

            chatSDK.conversation = {
                registerOnNewMessage: jest.fn()
            };

            const count = 3;
            for (let i = 0; i < count; i++) {
                chatSDK.onNewMessage(() => {});
            }

            expect(chatSDK.conversation.registerOnNewMessage).toHaveBeenCalledTimes(count);
        });

        it('Ability to add multiple "onTypingEvent" event handler', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient.sessionInit = jest.fn();
            chatSDK.IC3Client.initialize = jest.fn();
            chatSDK.IC3Client.joinConversation = jest.fn();

            await chatSDK.startChat();

            chatSDK.conversation = {
                registerOnNewMessage: jest.fn()
            };

            const count = 3;
            for (let i = 0; i < count; i++) {
                chatSDK.onTypingEvent(() => {});
            }

            expect(chatSDK.conversation.registerOnNewMessage).toHaveBeenCalledTimes(count);
        });

        it('Ability to add multiple "onAgentEndSession" event handler', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient.sessionInit = jest.fn();
            chatSDK.IC3Client.initialize = jest.fn();
            chatSDK.IC3Client.joinConversation = jest.fn();

            await chatSDK.startChat();

            chatSDK.conversation = {
                registerOnThreadUpdate: jest.fn()
            };

            const count = 3;
            for (let i = 0; i < count; i++) {
                chatSDK.onAgentEndSession(() => {});
            }

            expect(chatSDK.conversation.registerOnThreadUpdate).toHaveBeenCalledTimes(count);
        });

        it('ChatSDK.endChat() should end conversation', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();

            chatSDK.OCClient.sessionInit = jest.fn();
            chatSDK.OCClient.sessionClose = jest.fn();
            chatSDK.IC3Client.initialize = jest.fn();
            chatSDK.IC3Client.joinConversation = jest.fn();

            await chatSDK.startChat();

            chatSDK.conversation = {
                disconnect: jest.fn()
            };

            const conversationDisconnectFn = spyOn(chatSDK.conversation, 'disconnect');
            await chatSDK.endChat();

            expect(chatSDK.OCClient.sessionClose).toHaveBeenCalledTimes(1);
            expect(conversationDisconnectFn).toHaveBeenCalledTimes(1);
            expect(chatSDK.conversation).toBe(null);
            expect(chatSDK.chatToken).toMatchObject({});
        });

        it('ChatSDK.endChat() should fail if OCClient.sessionClose() fails', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize();
            await chatSDK.startChat();

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.IC3Client, 'joinConversation').mockResolvedValue(Promise.resolve({
                disconnect: () => {}
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionClose').mockRejectedValue(Promise.reject());

            try {
                await chatSDK.endChat();
            } catch (error) {
                expect(console.error).toHaveBeenCalled();
            }

            expect(chatSDK.OCClient.sessionClose).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.endChat() with authenticatedUserToken should pass it to OCClient.sessionClose() call\'s optional parameters', async () => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    return 'authenticatedUserToken'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize();

            chatSDK.IC3Client.initialize = jest.fn();
            chatSDK.IC3Client.joinConversation = jest.fn();

            const optionaParams = {
                authenticatedUserToken: 'authenticatedUserToken'
            }

            jest.spyOn(chatSDK.OCClient, 'getChatConfig').mockResolvedValue(Promise.resolve({
                DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
                LiveWSAndLiveChatEngJoin: { PreChatSurvey: { msdyn_prechatenabled: false } },
                LiveChatConfigAuthSettings: {}
            }));

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'sessionClose').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();

            chatSDK.authenticatedUserToken = optionaParams.authenticatedUserToken;
            chatSDK.conversation = {
                disconnect: jest.fn()
            };

            const sessionCloseOptionalParams = {
                authenticatedUserToken: optionaParams.authenticatedUserToken
            }

            await chatSDK.endChat();
            expect(chatSDK.OCClient.sessionClose).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.sessionClose.mock.calls[0][1]).toMatchObject(sessionCloseOptionalParams);
        });
    });
})
