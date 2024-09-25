const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;

import { SDKProvider, uuidv4 } from "@microsoft/ocsdk";
import { defaultLocaleId, getLocaleStringFromId } from "../src/utils/locale";

import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";
import AriaTelemetry from "../src/telemetry/AriaTelemetry";
import ChatAdapterProtocols from "../src/core/messaging/ChatAdapterProtocols";
import ConversationMode from '../src/core/ConversationMode';
import OmnichannelErrorCodes from "../src/core/OmnichannelErrorCodes";
import { defaultChatSDKConfig } from "../src/validators/SDKConfigValidators";
import libraries from "../src/utils/libraries";
import sleep from "../src/utils/sleep";

describe('Omnichannel Chat SDK, Parallel initialization', () => {

    function fail(message = 'Test Expected to Fail') {
        throw new Error(message);
    }

    AWTLogManager.initialize = jest.fn();

    const omnichannelConfigGlobal = {
        orgUrl: '[data-org-url]',
        orgId: '[data-org-id]',
        widgetId: '[data-app-id]'
    };

    describe('Configurations', () => {
        it('ChatSDK should require omnichannelConfig as parameter', () => {
            try {
                new OmnichannelChatSDK();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('ChatSDK should throw an error if a required omnichannelConfig property is missing', () => {
            const omnichannelConfig = {
                orgUrl: '[data-org-url]',
                orgId: '[data-org-id]'
            };

            try {
                new OmnichannelChatSDK(omnichannelConfig);
                fail();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('ChatSDK should throw an error if a required omnichannelConfig value is just blank spaces', () => {
            const omnichannelConfig = {
                orgUrl: '[data-org-url]',
                orgId: '[data-org-id]',
                widgetId: '   '
            };

            try {
                new OmnichannelChatSDK(omnichannelConfig);
                fail();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe("Empty 'widgetId' in OmnichannelConfiguration");
            }
        });

        it('ChatSDK should throw an error if a required omnichannelConfig value is missing', () => {
            const omnichannelConfig = {
                orgUrl: '[data-org-url]',
                orgId: '[data-org-id]',
                widgetId: undefined
            };

            try {
                new OmnichannelChatSDK(omnichannelConfig);
                fail();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe("Empty 'widgetId' in OmnichannelConfiguration");
            }
        });

        it('ChatSDK should throw an error if a required omnichannelConfig value is declared as undefined', () => {
            const omnichannelConfig = {
                orgUrl: '[data-org-url]',
                orgId: '[data-org-id]',
                widgetId: undefined
            };
            try {
                new OmnichannelChatSDK(omnichannelConfig);
                fail();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe("Empty 'widgetId' in OmnichannelConfiguration");
            }
        });

        it('ChatSDK should not throw an error if a required omnichannelConfig value is not string', () => {
            const omnichannelConfig = {
                orgUrl: '[data-org-url]',
                orgId: 1234,
                widgetId: true
            };
            const result = new OmnichannelChatSDK(omnichannelConfig);
            expect(result).toBeInstanceOf(OmnichannelChatSDK);
        });

        it('ChatSDK should throw an error if a required omnichannelConfig value is a string with blank space', () => {
            const omnichannelConfig = {
                orgUrl: '[data-org-url]',
                orgId: '[data-org-id]',
                widgetId: ' '
            };

            try {
                new OmnichannelChatSDK(omnichannelConfig);
                fail();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('ChatSDK should be able to pick custom ic3ClientVersion if set', async () => {

            const chatSDKConfig = {
                ic3Config: {
                    ic3ClientVersion: 'version'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal, chatSDKConfig);
            const url = chatSDK.resolveIC3ClientUrl();

            expect(url).toBe(libraries.getIC3ClientCDNUrl(chatSDKConfig.ic3Config.ic3ClientVersion));
        });

        it('ChatSDK should be able to pick custom ic3ClientCDNUrl if set', async () => {

            const chatSDKConfig = {
                ic3Config: {
                    ic3ClientVersion: 'version',
                    ic3ClientCDNUrl: 'cdn'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal, chatSDKConfig);
            const url = chatSDK.resolveIC3ClientUrl();

            expect(url).toBe(chatSDKConfig.ic3Config.ic3ClientCDNUrl);
        });

        it('ChatSDK should pick the default ic3ClientCDNUrl if no ic3Config is set', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal);
            const url = chatSDK.resolveIC3ClientUrl();

            expect(url).toBe(libraries.getIC3ClientCDNUrl());
        });

        it('ChatSDK should be able to pick custom webChatACSAdapterVersion if set', async () => {

            const chatSDKConfig = {
                chatAdapterConfig: {
                    webChatACSAdapterVersion: 'version'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal, chatSDKConfig);
            const url = chatSDK.resolveChatAdapterUrl(ChatAdapterProtocols.ACS);

            expect(url).toBe(libraries.getACSAdapterCDNUrl(chatSDKConfig.chatAdapterConfig.webChatACSAdapterVersion));
        });

        it('ChatSDK should be able to pick custom webChatACSAdapterCDNUrl if set', async () => {

            const chatSDKConfig = {
                chatAdapterConfig: {
                    webChatACSAdapterVersion: 'version',
                    webChatACSAdapterCDNUrl: 'cdn'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal, chatSDKConfig);
            const url = chatSDK.resolveChatAdapterUrl(ChatAdapterProtocols.ACS);

            expect(url).toBe(chatSDKConfig.chatAdapterConfig.webChatACSAdapterCDNUrl);
        });

        it('ChatSDK should pick the default webChatACSAdapterCDNUrl if no chatAdapterConfig is set', async () => {

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal);
            const url = chatSDK.resolveChatAdapterUrl(ChatAdapterProtocols.ACS);

            expect(url).toBe(libraries.getACSAdapterCDNUrl());
        });

        it('ChatSDK should be able to pick custom webChatDirectLineVersion if set', async () => {

            const chatSDKConfig = {
                chatAdapterConfig: {
                    webChatDirectLineVersion: 'version'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal, chatSDKConfig);
            const url = chatSDK.resolveChatAdapterUrl(ChatAdapterProtocols.DirectLine);

            expect(url).toBe(libraries.getDirectLineCDNUrl(chatSDKConfig.chatAdapterConfig.webChatDirectLineVersion));
        });

        it('ChatSDK should be able to pick custom webChatDirectLineCDNUrl if set', async () => {

            const chatSDKConfig = {
                chatAdapterConfig: {
                    webChatDirectLineVersion: 'version',
                    webChatDirectLineCDNUrl: 'cdn'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal, chatSDKConfig);
            const url = chatSDK.resolveChatAdapterUrl(ChatAdapterProtocols.DirectLine);

            expect(url).toBe(chatSDKConfig.chatAdapterConfig.webChatDirectLineCDNUrl);
        });

        it('ChatSDK should pick the default webChatDirectLineCDNUrl if no chatAdapterConfig is set', async () => {

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal);
            const url = chatSDK.resolveChatAdapterUrl(ChatAdapterProtocols.DirectLine);

            expect(url).toBe(libraries.getDirectLineCDNUrl());
        });

        it('ChatSDK should throw an error if ChatSDK.resolveChatAdapterUrl() is called with other protocol than supported protocols', async () => {

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal);
            const protocol = "UnsupportedProtocol";
            try {
                chatSDK.resolveChatAdapterUrl(protocol);
                fail();
            } catch (error) {
                expect(error.toString()).toContain(`ChatAdapter for protocol ${protocol} currently not supported`);
            }
        });

        it('Telemetry should be disabled if set', () => {

            const chatSDKConfig = {
                telemetry: {
                    disable: true
                }
            };

            jest.spyOn(AriaTelemetry, 'disable');

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal, chatSDKConfig);

            expect(chatSDK.chatSDKConfig.telemetry.disable).toBe(true);
            expect(AriaTelemetry.disable).toHaveBeenCalledTimes(1);
        });

        it('Telemetry should be enabled by default', () => {
            jest.clearAllMocks();

            jest.spyOn(AriaTelemetry, 'disable');

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal);

            expect(chatSDK.chatSDKConfig.telemetry.disable).toBe(false);
            expect(AriaTelemetry.disable).toHaveBeenCalledTimes(0);
        });

        it('ChatSDK should be able to pick up custom ariaTelemetryKey if set', () => {
            const chatSDKConfig = {
                telemetry: {
                    ariaTelemetryKey: 'custom'
                }
            };

            const fn = jest.spyOn(AriaTelemetry, 'initialize');

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal, chatSDKConfig);

            expect(AriaTelemetry.initialize).toHaveBeenCalledTimes(1);
            expect(chatSDK.chatSDKConfig.telemetry.ariaTelemetryKey).toBe(chatSDKConfig.telemetry.ariaTelemetryKey);
            expect(fn.mock.calls[0][0]).toBe(chatSDKConfig.telemetry.ariaTelemetryKey);
        });

        it('ChatSDK should be able to pick up custom ariaCollectorUri if set', () => {
            const chatSDKConfig = {
                telemetry: {
                    ariaCollectorUri: 'custom'
                }
            };

            const fn = jest.spyOn(AriaTelemetry, 'setCollectorUri');

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal, chatSDKConfig);

            expect(AriaTelemetry.initialize).toHaveBeenCalledTimes(1);
            expect(chatSDK.chatSDKConfig.telemetry.ariaCollectorUri).toBe(chatSDKConfig.telemetry.ariaCollectorUri);
            expect(AriaTelemetry.setCollectorUri).toHaveBeenCalledTimes(1);
            expect(fn.mock.calls[0][0]).toBe(chatSDKConfig.telemetry.ariaCollectorUri);
        });

        it('ChatSDK should be able to pick up the default persistent chat config if not set', () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(chatSDK.chatSDKConfig.persistentChat.disable).toBe(defaultChatSDKConfig.persistentChat!.disable);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(chatSDK.chatSDKConfig.persistentChat.tokenUpdateTime).toBe(defaultChatSDKConfig.persistentChat!.tokenUpdateTime);
        });

        it('ChatSDK should be able to pick up the custom persistent chat config if set', () => {

            const chatSDKConfig = {
                persistentChat: {
                    disable: false,
                    tokenUpdateTime: 100
                }
            }

            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal, chatSDKConfig);

            expect(chatSDK.chatSDKConfig.persistentChat.disable).toBe(chatSDKConfig.persistentChat.disable);
            expect(chatSDK.chatSDKConfig.persistentChat.tokenUpdateTime).toBe(chatSDKConfig.persistentChat.tokenUpdateTime);
        });

        it('ChatSDK should be able to pick up the default chat reconnect config if not set', () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfigGlobal);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(chatSDK.chatSDKConfig.chatReconnect.disable).toBe(defaultChatSDKConfig.chatReconnect!.disable);
        });

        it('ChatSDK should be able to pick up the custom chat reconnect config if set', () => {
            const omnichannelConfig = {
                orgUrl: '[data-org-url]',
                orgId: '[data-org-id]',
                widgetId: '[data-app-id]'
            };

            const chatSDKConfig = {
                chatReconnect: {
                    disable: false
                }
            }

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);

            expect(chatSDK.chatSDKConfig.chatReconnect.disable).toBe(chatSDKConfig.chatReconnect.disable);
        });

        it("ChatSDK.initialize() should pass default 'omnichannel-chat-sdk' user agent", async () => {
            const omnichannelConfig = {
                orgUrl: '[data-org-url]',
                orgId: '[data-org-id]',
                widgetId: '[data-app-id]'
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            const version = require("../package.json").version;
            const userAgent = `omnichannel-chat-sdk/${version}`;
            const expectedResult = [userAgent];

            expect(chatSDK.OCClient.ocUserAgent).toEqual(expectedResult)
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

            await chatSDK.initialize({ useParallelLoad: true });
            const version = require("../package.json").version;
            const userAgent = `omnichannel-chat-sdk/${version}`;
            const expectedResult = [...chatSDKConfig.ocUserAgent, userAgent];

            expect(chatSDK.OCClient.ocUserAgent).toEqual(expectedResult)
        });
    });

    describe('Functionalities', () => {
        const omnichannelConfig = {
            orgUrl: '[data-org-url]',
            orgId: '[data-org-id]',
            widgetId: '[data-app-id]'
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('ChatSDK.initialize() with an unsupported liveChatVersion should throw an exception', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.liveChatVersion = 'invalid';

            try {
                await chatSDK.initialize({ useParallelLoad: true });
            } catch (e) {
                expect(e.message).toBe("UnsupportedLiveChatVersion");
            }
        });

        it('ChatSDK.initialize() should instantiate OCSDK & ACSClient & AMSClient', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            expect(chatSDK.getChatConfig).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient).toBeDefined();
            expect(chatSDK.IC3Client).not.toBeDefined();
            expect(chatSDK.ACSClient).toBeDefined();
            expect(chatSDK.AMSClient).toBeDefined();
        });

        it('ChatSDK.initialize() with OCSDK failure should throw an exception', async () => {

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            const currentSDK = SDKProvider.getSDK;

            SDKProvider.getSDK = jest.fn(() => { throw Error("OCSDK Error") });
            chatSDK.SDKProvider = SDKProvider;

            try {
                await chatSDK.initialize({ useParallelLoad: true }); fail();
            } catch (e) {
                console.error(e)
                expect(e.message).toBe("OmnichannelClientInitializationFailure");
                expect(chatSDK.OCClient).not.toBeDefined();
                expect(chatSDK.getChatConfig).toHaveBeenCalledTimes(0);
            }

            SDKProvider.getSDK = currentSDK;
        });

        it('ChatSDK.initialize() with ChatSDK.getChatConfig() failure should throw \'ChatConfigRetrievalFailure\' as exception', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn(() => { throw Error() });

            try {
                await chatSDK.initialize({ useParallelLoad: true }); fail();
            } catch (e) {
                expect(e.message).toBe("ChatConfigRetrievalFailure");
                expect(chatSDK.getChatConfig).toHaveBeenCalledTimes(1);
            }
        });

        it('ChatSDK.initialize() with sendCacheHeaders set to \'true\' should be passed to ChatSDK.getChatConfig()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            const getLiveChatConfigOptionalParams = {
                sendCacheHeaders: true,
            };

            await chatSDK.initialize({ useParallelLoad: true, getLiveChatConfigOptionalParams });

            jest.spyOn(chatSDK.OCClient, 'getChatConfig')

            expect(chatSDK.getChatConfig).toHaveBeenCalledTimes(1);
            expect(chatSDK.getChatConfig.mock.calls[0][0].sendCacheHeaders).toEqual(getLiveChatConfigOptionalParams.sendCacheHeaders);
        });

        it('ChatSDK.initialize() with sendCacheHeaders set to \'false\' should be passed to ChatSDK.getChatConfig()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            const getLiveChatConfigOptionalParams = {
                sendCacheHeaders: false
            };

            await chatSDK.initialize(

                {
                    useParallelLoad: true,
                    getLiveChatConfigOptionalParams
                });

            jest.spyOn(chatSDK.OCClient, 'getChatConfig')

            expect(chatSDK.getChatConfig).toHaveBeenCalledTimes(1);
            expect(chatSDK.getChatConfig.mock.calls[0][0].sendCacheHeaders).toEqual(getLiveChatConfigOptionalParams.sendCacheHeaders);
        });

        it('ChatSDK should use default locale id if chat config\'s locale id is invalid', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => Promise.resolve({
                DataMaskingInfo: {
                    setting: {
                        msdyn_maskforcustomer: 'false'
                    }
                },
                LiveWSAndLiveChatEngJoin: { PreChatSurvey: { msdyn_prechatenabled: false } },
                ChatWidgetLanguage: {
                    msdyn_localeid: undefined,
                    msdyn_languagename: undefined
                }
            }));

            expect(chatSDK.localeId).toBe(defaultLocaleId)
        });

        it('ChatSDK.getChatConfig() with sendCacheHeaders set to \'true\' should be passed to OCClient.getChatConfig()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => Promise.resolve({
                DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
                LiveWSAndLiveChatEngJoin: { PreChatSurvey: { msdyn_prechatenabled: false } },
                LiveChatConfigAuthSettings: {},
                ChatWidgetLanguage: {
                    msdyn_localeid: '1033',
                    msdyn_languagename: 'English - United States'
                }
            }));

            const optionalParams = {
                sendCacheHeaders: true
            };

            await chatSDK.getChatConfig(optionalParams);
            expect(chatSDK.OCClient.getChatConfig.mock.calls[0][1]).toEqual(optionalParams.sendCacheHeaders);
        });

        it('ChatSDK.getChatConfig() failure should throw an exception by default', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

            const mockedErrorMessage = "MockedErrorMessage";
            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => { throw Error(mockedErrorMessage) });

            try {
                await chatSDK.getChatConfig();
                fail();
            } catch (e) {
                expect(e.message).toBe(mockedErrorMessage);
            }
        });

        it('ChatSDK.getChatConfig() with sendCacheHeaders set to \'false\' should be passed to OCClient.getChatConfig()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => Promise.resolve({
                DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
                LiveWSAndLiveChatEngJoin: { PreChatSurvey: { msdyn_prechatenabled: false } },
                LiveChatConfigAuthSettings: {},
                ChatWidgetLanguage: {
                    msdyn_localeid: '1033',
                    msdyn_languagename: 'English - United States'
                }
            }));

            const optionalParams = {
                sendCacheHeaders: false
            };

            await chatSDK.getChatConfig(optionalParams);
            expect(chatSDK.OCClient.getChatConfig.mock.calls[0][1]).toEqual(optionalParams.sendCacheHeaders);
        });

        it('ChatSDK.getChatConfig() with AuthSettings should call ChatSDK.setAuthTokenProvider()', async () => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    return 'authenticatedUserToken'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);

            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => Promise.resolve({
                DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
                LiveWSAndLiveChatEngJoin: { PreChatSurvey: { msdyn_prechatenabled: false } },
                LiveChatConfigAuthSettings: {},
                ChatWidgetLanguage: {
                    msdyn_localeid: '1033',
                    msdyn_languagename: 'English - United States'
                }
            }));

            jest.spyOn(chatSDK, 'setAuthTokenProvider');
            await chatSDK.getChatConfig();

            expect(chatSDK.OCClient.getChatConfig).toHaveBeenCalledTimes(1);
            expect(chatSDK.setAuthTokenProvider).toHaveBeenCalledTimes(1);
        });

        it('Authenticated Chat with chatSDKConfig.getAuthToken() returning \'undefined\' as token should fail silently with \'UndefinedAuthToken\'', async () => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    return undefined
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);

            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => Promise.resolve({
                DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
                LiveWSAndLiveChatEngJoin: { PreChatSurvey: { msdyn_prechatenabled: false } },
                LiveChatConfigAuthSettings: {},
                ChatWidgetLanguage: {
                    msdyn_localeid: '1033',
                    msdyn_languagename: 'English - United States'
                }
            }));

            jest.spyOn(chatSDK, 'setAuthTokenProvider');
            jest.spyOn(chatSDK.scenarioMarker, 'failScenario');
            await chatSDK.getChatConfig();

            const expectedResponse = 'UndefinedAuthToken';
            const exceptionDetails = JSON.parse(chatSDK.scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);

            expect(chatSDK.OCClient.getChatConfig).toHaveBeenCalledTimes(1);
            expect(chatSDK.setAuthTokenProvider).toHaveBeenCalledTimes(1);
            expect(chatSDK.scenarioMarker.failScenario).toHaveBeenCalledTimes(1);
            expect(exceptionDetails.response).toBe(expectedResponse);
        });

        it('Authenticated Chat with chatSDKConfig.getAuthToken() failing should fail silently with \'GetAuthTokenFailed\'', async () => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    throw Error("Operation Failed")
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);

            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => Promise.resolve({
                DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
                LiveWSAndLiveChatEngJoin: { PreChatSurvey: { msdyn_prechatenabled: false } },
                LiveChatConfigAuthSettings: {},
                ChatWidgetLanguage: {
                    msdyn_localeid: '1033',
                    msdyn_languagename: 'English - United States'
                }
            }));

            jest.spyOn(chatSDK, 'setAuthTokenProvider');
            jest.spyOn(chatSDK.scenarioMarker, 'failScenario');
            await chatSDK.getChatConfig();

            const expectedResponse = 'GetAuthTokenFailed';
            const exceptionDetails = JSON.parse(chatSDK.scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);

            expect(chatSDK.OCClient.getChatConfig).toHaveBeenCalledTimes(1);
            expect(chatSDK.setAuthTokenProvider).toHaveBeenCalledTimes(1);
            expect(chatSDK.scenarioMarker.failScenario).toHaveBeenCalledTimes(1);
            expect(exceptionDetails.response).toBe(expectedResponse);
        });

        it('Authenticated Chat without chatSDKConfig.getAuthToken() initially set should not be called', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => Promise.resolve({
                DataMaskingInfo: { setting: { msdyn_maskforcustomer: false } },
                LiveWSAndLiveChatEngJoin: { PreChatSurvey: { msdyn_prechatenabled: false } },
                LiveChatConfigAuthSettings: {},
                ChatWidgetLanguage: {
                    msdyn_localeid: '1033',
                    msdyn_languagename: 'English - United States'
                }
            }));

            jest.spyOn(chatSDK, 'setAuthTokenProvider');
            await chatSDK.getChatConfig();

            expect(chatSDK.OCClient.getChatConfig).toHaveBeenCalledTimes(1);
            expect(chatSDK.setAuthTokenProvider).toHaveBeenCalledTimes(0);
        });

        it('Authenticated Chat without chatSDKConfig.getAuthToken() initially set should throw \'GetAuthTokenNotFound\' error on ChatSDK.startChat()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.authSettings = {};

            await chatSDK.initialize({ useParallelLoad: true });
            jest.spyOn(chatSDK, 'setAuthTokenProvider');
            jest.spyOn(chatSDK.scenarioMarker, 'failScenario');

            const expectedResponse = 'GetAuthTokenNotFound';

            try {
                await chatSDK.startChat();
            } catch (e) {
                expect(e.message).toBe(expectedResponse);
            }

            const exceptionDetails = JSON.parse(chatSDK.scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);

            expect(chatSDK.setAuthTokenProvider).toHaveBeenCalledTimes(1);
            expect(chatSDK.scenarioMarker.failScenario).toHaveBeenCalledTimes(1);
            expect(exceptionDetails.response).toBe(expectedResponse);
        });

        it('Authenticated Chat without chatSDKConfig.getAuthToken() initially set should throw \'UndefinedAuthToken\' error on ChatSDK.startChat() if auth token is undefined', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.authSettings = {};

            await chatSDK.initialize({ useParallelLoad: true });
            jest.spyOn(chatSDK, 'setAuthTokenProvider');
            jest.spyOn(chatSDK.scenarioMarker, 'failScenario');

            const expectedResponse = 'UndefinedAuthToken';

            const authTokenProvider = async () => undefined;
            await chatSDK.setAuthTokenProvider(authTokenProvider);

            try {
                await chatSDK.startChat();
                fail();
            } catch (e) {
                expect(e.message).toBe(expectedResponse);
            }

            console.log(chatSDK.scenarioMarker.failScenario.mock.calls);

            const exceptionDetails = JSON.parse(chatSDK.scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);

            expect(chatSDK.setAuthTokenProvider).toHaveBeenCalledTimes(2); // Returning two times because 1st setAuthTokenProvider() call returns undefined token, then startChat() would retry if token is undefined
            expect(chatSDK.scenarioMarker.failScenario).toHaveBeenCalledTimes(2);
            expect(exceptionDetails.response).toBe(expectedResponse);
        });

        it('Authenticated Chat without chatSDKConfig.getAuthToken() initially set should throw \'GetAuthTokenFailed\' error on ChatSDK.startChat() if we failed to retrieve auth token', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.authSettings = {};

            await chatSDK.initialize({ useParallelLoad: true });
            jest.spyOn(chatSDK, 'setAuthTokenProvider');
            jest.spyOn(chatSDK.scenarioMarker, 'failScenario');

            const expectedResponse = 'GetAuthTokenFailed';

            const authTokenProvider = async () => { throw Error("Operation Failed") };
            await chatSDK.setAuthTokenProvider(authTokenProvider);

            try {
                await chatSDK.startChat();
                fail();
            } catch (e) {
                expect(e.message).toBe(expectedResponse);
            }

            console.log(chatSDK.scenarioMarker.failScenario.mock.calls);

            const exceptionDetails = JSON.parse(chatSDK.scenarioMarker.failScenario.mock.calls[0][1].ExceptionDetails);

            expect(chatSDK.setAuthTokenProvider).toHaveBeenCalledTimes(2);
            expect(chatSDK.scenarioMarker.failScenario).toHaveBeenCalledTimes(2);
            expect(exceptionDetails.response).toBe(expectedResponse);
        });

        it('Authenticated Chat with liveChatContext should call OCClient.validateAuthChatRecord()', async () => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    return 'authenticatedUserToken'
                }
            };
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.authSettings = {};

            await chatSDK.initialize({ useParallelLoad: true });
            while (chatSDK.AMSClient === null) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}',
                AttachmentConfiguration: {
                    AttachmentServiceEndpoint: 'AttachmentServiceEndpoint'
                }
            }));

            jest.spyOn(chatSDK, 'getConversationDetails').mockResolvedValue(Promise.resolve({ state: 'state' }));
            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'validateAuthChatRecord').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.AMSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve());

            const optionalParams = {
                liveChatContext: { requestId: 'requestId', chatToken: { chatId: 'chatId' } }
            }

            await chatSDK.startChat(optionalParams);

            expect(chatSDK.OCClient.validateAuthChatRecord).toHaveBeenCalledTimes(1);
        });

        it('Authenticated Chat with liveChatContext should throw an exception if OCClient.validateAuthChatRecord() fails', async () => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    return 'authenticatedUserToken'
                }
            };
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.authSettings = {};

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}',
                AttachmentConfiguration: {
                    AttachmentServiceEndpoint: 'AttachmentServiceEndpoint'
                }
            }));

            jest.spyOn(chatSDK, 'getConversationDetails').mockResolvedValue(Promise.resolve({ state: 'state' }));
            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'validateAuthChatRecord').mockResolvedValue(Promise.reject());
            jest.spyOn(chatSDK.AMSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve());

            const optionalParams = {
                liveChatContext: { requestId: 'requestId', chatToken: { chatId: 'chatId' } }
            }

            try {
                await chatSDK.startChat(optionalParams);
                fail();
            } catch (e) {
                expect(e.message).toBe('AuthenticatedChatConversationRetrievalFailure');
                expect(chatSDK.OCClient.validateAuthChatRecord).toHaveBeenCalledTimes(1);
            }
        });

        it('ChatSDK.getPreChatSurvey() with preChat enabled should return a pre chat survey', async () => {
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
                },
                ChatWidgetLanguage: {
                    msdyn_localeid: '1033',
                    msdyn_languagename: 'English - United States'
                }
            }));

            await chatSDK.getLiveChatConfig({ useRuntimeCache: false });
            const preChatSurvey = await chatSDK.getPreChatSurvey(false);
            expect(preChatSurvey).toBe(samplePreChatSurvey);
        });

        it('ChatSDK.getPreChatSurvey() with preChat disabled should NOT return a pre chat survey', async () => {
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
                },
                ChatWidgetLanguage: {
                    msdyn_localeid: '1033',
                    msdyn_languagename: 'English - United States'
                }
            }));

            await chatSDK.getLiveChatConfig({ useRuntimeCache: false });
            const preChatSurvey = await chatSDK.getPreChatSurvey(false);
            expect(preChatSurvey).toBe(null);
        });

        it('ChatSDK.getDataMaskingRules() should return active data masking rules', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            const dataMaskingRules = {
                'SSN': "\\b(?!000|666|9)\\d{3}[- ]?(?!00)\\d{2}[- ]?(?!0000)\\d{4}\\b"
            }

            chatSDK.dataMaskingRules = dataMaskingRules;

            await chatSDK.initialize({ useParallelLoad: true });
            expect(await chatSDK.getDataMaskingRules()).toBe(dataMaskingRules);
        });

        it('ChatSDK.startChat() should throw an exception if ChatSDK.initialize() is not called', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);

            try {
                await chatSDK.startChat();
                fail();
            } catch (e) {
                expect(e.message).toBe('UninitializedChatSDK');
            }
        });

        it('ChatSDK.startChat() should start an OC chat', async () => {
            // global.fetch = jest.fn();
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true }); let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}',
                AttachmentConfiguration: {
                    AttachmentServiceEndpoint: 'AttachmentServiceEndpoint'
                }
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.AMSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();

            expect(chatSDK.OCClient.getChatToken).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(1);
            expect(chatSDK.AMSClient.initialize).toHaveBeenCalledTimes(1);
            expect(chatSDK.ACSClient.initialize).toHaveBeenCalledTimes(1);
            expect(chatSDK.ACSClient.joinConversation).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.startChat() should throw an error if OCClient.sessionInit() fails', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            try {
                jest.spyOn(chatSDK.OCClient, 'sessionInit').mockRejectedValue(new Error('Async error message'));

                await chatSDK.startChat();
                fail();
            } catch (error) {
                expect(error.message).toBe("ConversationInitializationFailure");
            }

            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(1);
        });


        it('ChatSDK.startChat() should not call OCClient.sessionInit() if OCClient.getChatToken() fails', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(new Error("Async error message"));
            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockRejectedValue(Promise.resolve());

            try {
                await chatSDK.startChat();
                fail();
            } catch (e) {
                expect(e.message).toBe("ChatTokenRetrievalFailure");
            }

            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(0);
        });

        it('ChatSDK.startChat() should throw a \'WidgetUseOutsideOperatingHour\' error if OCClient.sessionInit() fails with \'705\' error code', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const axiosErrorObject: any = {};
            axiosErrorObject.isAxiosError = true;
            axiosErrorObject.response = {};
            axiosErrorObject.response.headers = {};
            axiosErrorObject.response.headers.errorcode = OmnichannelErrorCodes.WidgetUseOutsideOperatingHour.toString();

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockRejectedValue(axiosErrorObject);

            try {
                await chatSDK.startChat();
                fail();
            } catch (error) {
                expect(error).toBeDefined();
                expect(error.message).toBe(OmnichannelErrorCodes[OmnichannelErrorCodes.WidgetUseOutsideOperatingHour].toString());
            }

            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.startChat() should throw an exception if ACSClient.initialize() fails', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'initialize').mockRejectedValue(new Error('Async error message'));
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.AMSClient, 'initialize').mockResolvedValue(Promise.resolve());

            try {
                await chatSDK.startChat();
                fail();
            } catch (error) {
                expect(error.message).toBe("MessagingClientInitializationFailure");
            }

            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(1);
            expect(chatSDK.ACSClient.initialize).toHaveBeenCalledTimes(1);
            expect(chatSDK.ACSClient.joinConversation).toHaveBeenCalledTimes(0);
            expect(chatSDK.AMSClient.initialize).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.startChat() should throw an exception if AMSClient.initialize() fails', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.AMSClient, 'initialize').mockRejectedValue(new Error('Async error message'));

            try {
                await chatSDK.startChat();
            } catch (error) {
                expect(error.message).toBe("MessagingClientInitializationFailure");
            }

            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(1);
            expect(chatSDK.ACSClient.initialize).toHaveBeenCalledTimes(1);
            expect(chatSDK.ACSClient.joinConversation).toHaveBeenCalledTimes(1);
            expect(chatSDK.AMSClient.initialize).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.startChat() should throw an exception if ACSClient.joinConversation() fails', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockRejectedValue(new Error('Async error message'));
            jest.spyOn(chatSDK.AMSClient, 'initialize').mockResolvedValue(Promise.resolve());

            try {
                await chatSDK.startChat();
            } catch (error) {
                expect(error.message).toBe("MessagingClientConversationJoinFailure");
            }

            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(1);
            expect(chatSDK.ACSClient.initialize).toHaveBeenCalledTimes(1);
            expect(chatSDK.ACSClient.joinConversation).toHaveBeenCalledTimes(1);
            expect(chatSDK.AMSClient.initialize).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.startchat() with existing liveChatContext should not call OCClient.getChatToken() & OCClient.sessionInit()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


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
            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.AMSClient, 'initialize').mockResolvedValue(Promise.resolve());

            const liveChatContext = {
                chatToken: {
                    chatId: '',
                    token: '',
                    regionGtms: {}
                },
                requestId: 'requestId'
            }

            const optionalParams = {
                liveChatContext
            }

            await chatSDK.startChat(optionalParams);

            expect(chatSDK.OCClient.getChatToken).toHaveBeenCalledTimes(0);
            expect(chatSDK.OCClient.sessionInit).toHaveBeenCalledTimes(0);
        });

        it('ChatSDK.startChat() with invalid liveChatContext should throw an error', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true }); let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

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

            const optionalParams = {
                liveChatContext
            }

            try {
                await chatSDK.startChat(optionalParams);
                fail();
            } catch (error) {
                expect(error.message).toEqual('InvalidConversation');
            }
        });

        it('ChatSDK.startChat() with liveChatContext of a closed conversation should throw an error', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

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

            const optionalParams = {
                liveChatContext
            }

            try {
                await chatSDK.startChat(optionalParams);
                fail();
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

        it('ChatSDK.getLiveChatConfig() with useRuntimeCache set to \'true\' should take precedence and return the cache value', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            chatSDK.liveChatConfig = {
                id: 0
            }

            const optionalParams = {
                useRuntimeCache: true,
                sendCacheHeaders: true
            };

            const liveChatConfig = await chatSDK.getLiveChatConfig(optionalParams);
            expect(liveChatConfig.id).toBe(chatSDK.liveChatConfig.id);
            expect(chatSDK.getChatConfig).toHaveBeenCalledTimes(0);
        });

        it('ChatSDK.getLiveChatConfig() with useRuntimeCache set to \'false\' should call ChatSDK.getChatConfig()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            const optionalParams = {
                useRuntimeCache: false,
                sendCacheHeaders: true
            };

            await chatSDK.getLiveChatConfig(optionalParams);
            expect(chatSDK.getChatConfig).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.getLiveChatConfig() with no useRuntimeCache should call ChatSDK.getChatConfig()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            const optionalParams = {
                sendCacheHeaders: true
            };

            await chatSDK.getLiveChatConfig(optionalParams);
            expect(chatSDK.getChatConfig).toHaveBeenCalledTimes(1);
        });


        it("ChatSDK.startChat() with an unsupported locale should throw an exception", async () => {
            const omnichannelConfig = {
                orgUrl: '[data-org-url]',
                orgId: '[data-org-id]',
                widgetId: '[data-app-id]',
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            const optionalParams = {
                locale: 'unsupported-locale'
            };

            try {
                await chatSDK.startChat(optionalParams);
                fail();
            } catch (e) {
                expect(e.message).toBe("ConversationInitializationFailure");
            }
        });

        it('ChatSDK.getCurrentLiveChatContext() with empty chatToken should return an empty chat session data', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


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

        it('ChatSDK.getConversationDetails() should call OCClient.getLWIDetails()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


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

        it('ChatSDK.getConversationDetails() should return "{}" and not throw exception if OCClient.getLWIDetails() fails ', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            jest.spyOn(chatSDK.OCClient, 'getLWIDetails').mockRejectedValue(new Error('Async error message'));

            let errorThrown = false;
            let conversationDetails;
            try {
                conversationDetails = await chatSDK.getConversationDetails();
            } catch (error) {
                errorThrown = true;
            }

            expect(conversationDetails).toEqual({});
            expect(chatSDK.OCClient.getLWIDetails).toHaveBeenCalledTimes(1);
            expect(errorThrown).toBe(false);
        });

        it('ChatSDK.getConversationDetails() with authenticatedUserToken should pass it to OCClient.getLWIDetails()', async () => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    return 'authenticatedUserToken'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            const optionalParams = {
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
            jest.spyOn(chatSDK.OCClient, 'getLWIDetails').mockResolvedValue({
                State: 'state',
                ConversationId: 'id',
                AgentAcceptedOn: 'agentAcceptedOn'
            });

            await chatSDK.startChat();
            chatSDK.authenticatedUserToken = optionalParams.authenticatedUserToken;

            await chatSDK.getConversationDetails();

            expect(chatSDK.OCClient.getLWIDetails).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.getLWIDetails.mock.calls[0][1]).toMatchObject(optionalParams);
        });

        it('ChatSDK.getConversationDetails() should pass reconnectId to OCClient.getLWIDetails() if any on Chat Reconnect', async () => {
            const chatSDKConfig = {
                chatReconnect: {
                    disable: false,
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.isChatReconnect = true;

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            chatSDK.reconnectId = 'reconnectId';

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'getLWIDetails').mockResolvedValue({
                State: 'state',
                ConversationId: 'id',
                AgentAcceptedOn: 'agentAcceptedOn'
            });

            await chatSDK.startChat();

            await chatSDK.getConversationDetails();

            expect(chatSDK.OCClient.getLWIDetails).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.getLWIDetails.mock.calls[0][1].reconnectId).toMatch(chatSDK.reconnectId);
        });



        it("ChatSDK.getConversationDetails() with liveChatContext should fetch conversation details from liveChatContext", async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            const chatToken = {
                ChatId: 'ChatId',
                Token: 'Token',
                RegionGtms: '{}'
            };

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve(chatToken));
            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'getLWIDetails').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();

            const liveChatContext = {
                requestId: 'requestId',
                chatToken: {
                    chatId: 'chatId',
                    token: 'token'
                }
            }

            await chatSDK.getConversationDetails({ liveChatContext });

            expect(chatSDK.OCClient.getLWIDetails).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.getLWIDetails.mock.calls[0][0]).toBe(liveChatContext.requestId);
            expect(chatSDK.OCClient.getLWIDetails.mock.calls[0][0]).not.toBe(chatSDK.requestId);
        });

        it('ChatSDK.getMessages() should call conversation.getMessages()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            chatSDK.AMSClient = {
                initialize: jest.fn()
            }

            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve({
                getMessages: () => { }
            }));

            await chatSDK.startChat();

            jest.spyOn(chatSDK.conversation, 'getMessages').mockResolvedValue(Promise.resolve());

            await chatSDK.getMessages();
            expect(chatSDK.conversation.getMessages).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.sendMessage() should call conversation.sendMessage()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.OCClient = {
                sessionInit: jest.fn(),
                sendTypingIndicator: jest.fn()
            }

            chatSDK.AMSClient = {
                initialize: jest.fn()
            }

            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve({
                sendMessage: jest.fn()
            }));

            await chatSDK.startChat();

            const message = {
                content: 'content'
            };

            await chatSDK.sendMessage(message);

            expect(chatSDK.conversation.sendMessage).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.sendTypingEvent() should call OCClient.sendTypingIndicator()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.OCClient = {
                sessionInit: jest.fn(),
                sendTypingIndicator: jest.fn()
            }

            chatSDK.AMSClient = {
                initialize: jest.fn()
            }

            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve({
                sendTyping: jest.fn()
            }));

            await chatSDK.startChat();
            await chatSDK.sendTypingEvent();

            expect(chatSDK.OCClient.sendTypingIndicator).toHaveBeenCalledTimes(1);
            expect(chatSDK.conversation.sendTyping).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.uploadFileAttachment() should call AMSClient.createObject, AMSClient.uploadDocument() & conversation.sendMessage()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            chatSDK.AMSClient = {
                initialize: jest.fn(),
                createObject: jest.fn(() => Promise.resolve({ id: 'id' })),
                uploadDocument: jest.fn()
            }

            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve({
                sendMessage: jest.fn()
            }));

            await chatSDK.startChat();

            const fileInfo = {};
            await chatSDK.uploadFileAttachment(fileInfo);

            expect(chatSDK.AMSClient.createObject).toHaveBeenCalledTimes(1);
            expect(chatSDK.AMSClient.uploadDocument).toHaveBeenCalledTimes(1);
            expect(chatSDK.conversation.sendMessage).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.downloadFileAttachment() should call conversation.downloadFile()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            chatSDK.AMSClient = {
                initialize: jest.fn(),
                getViewStatus: jest.fn(() => Promise.resolve({ view_location: 'view_location' })),
                getView: jest.fn()
            }

            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();

            const fileMetaData = {};
            await chatSDK.downloadFileAttachment(fileMetaData);

            expect(chatSDK.AMSClient.getViewStatus).toHaveBeenCalledTimes(1);
            expect(chatSDK.AMSClient.getView).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.emailLiveChatTranscript() should call OCClient.emailTranscript()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'emailTranscript').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();

            const emailBody = {
                emailAddress: 'sample@microsoft.com',
                attachmentMessage: 'sample',
                locale: 'sample'
            };

            await chatSDK.emailLiveChatTranscript(emailBody);

            expect(chatSDK.OCClient.emailTranscript).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[0][2].EmailAddress).toBe(emailBody.emailAddress);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[0][2].DefaultAttachmentMessage).toBe(emailBody.attachmentMessage);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[0][2].CustomerLocale).toBe(emailBody.locale);
        });

        it('ChatSDK.emailLiveChatTranscript() should use ChatSDK.localeId if locale is not passed', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'emailTranscript').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();

            const emailBody = {
                emailAddress: 'sample@microsoft.com',
                attachmentMessage: 'sample'
            };

            await chatSDK.emailLiveChatTranscript(emailBody);

            expect(chatSDK.OCClient.emailTranscript).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[0][2].EmailAddress).toBe(emailBody.emailAddress);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[0][2].DefaultAttachmentMessage).toBe(emailBody.attachmentMessage);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[0][2].CustomerLocale).toBe(getLocaleStringFromId(chatSDK.localeId));
        });

        it('ChatSDK.emailLiveChatTranscript() with authenticatedUserToken should pass it to OCClient.emailTranscript()', async () => {
            const chatSDKConfig = {
                getAuthToken: async () => {
                    return 'authenticatedUserToken'
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            const optionalParams = {
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
            chatSDK.authenticatedUserToken = optionalParams.authenticatedUserToken;

            const emailBody = {
                emailAddress: 'sample@microsoft.com',
                attachmentMessage: 'sample',
                CustomerLocale: 'sample'
            };

            const emailTranscriptOptionalParams = {
                authenticatedUserToken: optionalParams.authenticatedUserToken
            }

            await chatSDK.emailLiveChatTranscript(emailBody);

            expect(chatSDK.OCClient.emailTranscript).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[0][3]).toMatchObject(emailTranscriptOptionalParams);
        });

        it("chatSDK.emailLiveChatTranscript() with liveChatContext should email transcript from liveChatContext", async () => {
            const omnichannelConfig = {
                orgUrl: '[data-org-url]',
                orgId: '[data-org-id]',
                widgetId: '[data-app-id]'
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            const chatToken = {
                ChatId: 'ChatId',
                Token: 'Token',
                RegionGtms: '{}'
            };

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve(chatToken));
            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'emailTranscript').mockResolvedValue(Promise.resolve());

            const body = {
                emailAddress: "contoso@microsoft.com",
                attachmentMessage: "attachmentMessage",
                locale: "locale"
            };

            await chatSDK.startChat();
            await chatSDK.emailLiveChatTranscript(body);

            const liveChatContext = {
                requestId: 'requestId',
                chatToken: {
                    chatId: 'chatId',
                    token: 'token'
                }
            }

            await chatSDK.emailLiveChatTranscript(body, { liveChatContext });

            expect(chatSDK.OCClient.emailTranscript).toHaveBeenCalledTimes(2);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[0][0]).toBe(chatSDK.requestId);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[0][1]).toBe(chatToken.Token);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[0][2].ChatId).toBe(chatToken.ChatId);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[1][0]).toBe(liveChatContext.requestId);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[1][1]).toBe(liveChatContext.chatToken.token);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[1][2].ChatId).toBe(liveChatContext.chatToken.chatId);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[1][0]).not.toBe(chatSDK.requestId);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[1][1]).not.toBe(chatToken.Token);
            expect(chatSDK.OCClient.emailTranscript.mock.calls[1][2].ChatId).not.toBe(chatToken.ChatId);
        });

        it('ChatSDK.getLiveChatTranscript() should call OCClient.getChatTranscripts()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            while (chatSDK.AMSClient === null) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'getChatTranscripts').mockResolvedValue(Promise.resolve());

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

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            const optionalParams = {
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
            chatSDK.authenticatedUserToken = optionalParams.authenticatedUserToken;

            await chatSDK.startChat();

            const getChatTranscriptOptionalParams = {
                authenticatedUserToken: optionalParams.authenticatedUserToken
            }

            await chatSDK.getLiveChatTranscript();

            expect(chatSDK.OCClient.getChatTranscripts).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.getChatTranscripts.mock.calls[0][3]).toMatchObject(getChatTranscriptOptionalParams);
        });

        it("ChatSDK.getLiveChatTranscript() with liveChatContext should fetch transcript from liveChatContext", async () => {
            const omnichannelConfig = {
                orgUrl: '[data-org-url]',
                orgId: '[data-org-id]',
                widgetId: '[data-app-id]'
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            const chatToken = {
                ChatId: 'ChatId',
                Token: 'Token',
                RegionGtms: '{}'
            };

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve(chatToken));
            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'getChatTranscripts').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();
            await chatSDK.getLiveChatTranscript();

            const liveChatContext = {
                requestId: 'requestId',
                chatToken: {
                    chatId: 'chatId',
                    token: 'token'
                }
            }

            await chatSDK.getLiveChatTranscript({ liveChatContext });

            expect(chatSDK.OCClient.getChatTranscripts).toHaveBeenCalledTimes(2);
            expect(chatSDK.OCClient.getChatTranscripts.mock.calls[1][0]).toBe(liveChatContext.requestId);
            expect(chatSDK.OCClient.getChatTranscripts.mock.calls[1][1]).toBe(liveChatContext.chatToken.chatId);
            expect(chatSDK.OCClient.getChatTranscripts.mock.calls[1][2]).toBe(liveChatContext.chatToken.token);
            expect(chatSDK.OCClient.getChatTranscripts.mock.calls[1][0]).not.toBe(chatSDK.requestId);
            expect(chatSDK.OCClient.getChatTranscripts.mock.calls[1][1]).not.toBe(chatToken.ChatId);
            expect(chatSDK.OCClient.getChatTranscripts.mock.calls[1][2]).not.toBe(chatToken.Token);
        });

        it('ChatSDK.onNewMessage() should call conversation.registerOnNewMessage()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true }); let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            chatSDK.AMSClient = {
                initialize: jest.fn()
            }

            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve({
                registerOnNewMessage: jest.fn()
            }));

            await chatSDK.startChat();

            await chatSDK.onNewMessage(() => { });

            expect(chatSDK.conversation.registerOnNewMessage).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.onNewMessage() with rehydrate flag should call ChatSDK.getMessages()', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            chatSDK.OCClient = {
                sessionInit: jest.fn()
            }

            chatSDK.AMSClient = {
                initialize: jest.fn()
            }

            jest.spyOn(chatSDK.ACSClient, 'initialize').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.ACSClient, 'joinConversation').mockResolvedValue(Promise.resolve({
                registerOnNewMessage: jest.fn(),
                getMessages: jest.fn()
            }));

            const messages = [
                { id: 2 },
                { id: 1 },
                { id: 1 },
                { id: 0 }
            ]

            await chatSDK.startChat();

            jest.spyOn(chatSDK, 'getMessages').mockResolvedValue(messages);

            await chatSDK.onNewMessage(() => { }, { rehydrate: true });

            expect(chatSDK.getMessages).toHaveBeenCalledTimes(1);
            expect(chatSDK.conversation.registerOnNewMessage).toHaveBeenCalledTimes(1);
        });

        it('Ability to add multiple "onNewMessage" event handler', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            chatSDK.OCClient.sessionInit = jest.fn();
            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            await chatSDK.startChat();

            chatSDK.conversation = {
                registerOnNewMessage: jest.fn()
            };

            const count = 3;
            for (let i = 0; i < count; i++) {
                chatSDK.onNewMessage(() => { });
            }

            expect(chatSDK.conversation.registerOnNewMessage).toHaveBeenCalledTimes(count);
        });

        it('Ability to add multiple "onAgentEndSession" event handler', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true }); while (chatSDK.AMSClient === null) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            chatSDK.OCClient.sessionInit = jest.fn();
            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            await chatSDK.startChat();

            chatSDK.conversation = {
                registerOnThreadUpdate: jest.fn()
            };

            const count = 3;
            for (let i = 0; i < count; i++) {
                chatSDK.onAgentEndSession(() => { });
            }

            expect(chatSDK.conversation.registerOnThreadUpdate).toHaveBeenCalledTimes(count);
        });

        it('ChatSDK.endChat() should end conversation', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            chatSDK.OCClient.sessionInit = jest.fn();
            chatSDK.OCClient.sessionClose = jest.fn();
            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            await chatSDK.startChat();

            chatSDK.conversation = {
                disconnect: jest.fn()
            };

            const conversationDisconnectFn = jest.spyOn(chatSDK.conversation, 'disconnect');
            await chatSDK.endChat();

            expect(chatSDK.OCClient.sessionClose).toHaveBeenCalledTimes(1);
            expect(conversationDisconnectFn).toHaveBeenCalledTimes(1);
            expect(chatSDK.conversation).toBe(null);
            expect(chatSDK.chatToken).toMatchObject({});
            expect(chatSDK.IC3Client).toBe(undefined);
        });

        it('ChatSDK.endChat() should fail if OCClient.sessionClose() fails', async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            chatSDK.OCClient = {};
            chatSDK.OCClient.sessionInit = jest.fn();
            chatSDK.OCClient.sessionClose = jest.fn(() => Promise.reject());
            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            await chatSDK.startChat();

            try {
                await chatSDK.endChat();
                fail();
            } catch (error) {
                expect(error.message).toBe('ConversationClosureFailure');
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

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            const optionalParams = {
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

            chatSDK.authenticatedUserToken = optionalParams.authenticatedUserToken;
            chatSDK.conversation = {
                disconnect: jest.fn()
            };

            const sessionCloseOptionalParams = {
                authenticatedUserToken: optionalParams.authenticatedUserToken
            }

            await chatSDK.endChat();
            expect(chatSDK.OCClient.sessionClose).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.sessionClose.mock.calls[0][1]).toMatchObject(sessionCloseOptionalParams);
        });

        it('ChatSDK.isPersistentChat should be true on Persistent Chat', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                persistentChat: {
                    disable: false,
                    tokenUpdateTime: 1
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);

            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => Promise.resolve({
                DataMaskingInfo: {
                    setting: {
                        msdyn_maskforcustomer: 'false'
                    }
                },
                LiveWSAndLiveChatEngJoin: {
                    msdyn_conversationmode: ConversationMode.PersistentChat
                },
                ChatWidgetLanguage: {
                    msdyn_localeid: '1033',
                    msdyn_languagename: 'English - United States'
                }
            }));

            await chatSDK.getChatConfig();

            expect(chatSDK.isPersistentChat).toBe(true);
        });

        it('ChatSDK.getChatToken() should pass reconnectId to OCClient.getChatToken() if any on Persistent Chat', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                persistentChat: {
                    disable: false,
                    tokenUpdateTime: 1
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.isPersistentChat = true;

            await chatSDK.initialize({ useParallelLoad: true });
            chatSDK.reconnectId = 'reconnectId';

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            await chatSDK.getChatToken(false);

            expect(chatSDK.OCClient.getChatToken.mock.calls[0][1].reconnectId).toBe(chatSDK.reconnectId);
        });

        it('ChatSDK.endChat() should pass isPersistentChat & isReconnectChat to OCClient.sessionClose() call \'s optional paramaters on Persistent Chat', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                persistentChat: {
                    disable: false,
                    tokenUpdateTime: 1
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();
            chatSDK.isPersistentChat = true;
            chatSDK.updateChatToken = jest.fn();
            global.setInterval = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            while (chatSDK.AMSClient === null) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'getReconnectableChats').mockResolvedValue(Promise.resolve({
                reconnectid: 'reconnectid'
            }));
            jest.spyOn(chatSDK.OCClient, 'sessionClose').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();
            await chatSDK.endChat();

            expect(chatSDK.OCClient.sessionClose).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.sessionClose.mock.calls[0][1].isPersistentChat).toBe(true);
            expect(chatSDK.OCClient.sessionClose.mock.calls[0][1].isReconnectChat).toBe(true);
        });

        it('ChatSDK.isChatReconnect should be true on Chat Reconnect', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);

            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => Promise.resolve({
                DataMaskingInfo: {
                    setting: {
                        msdyn_maskforcustomer: 'false'
                    }
                },
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablechatreconnect: true
                },
                ChatWidgetLanguage: {
                    msdyn_localeid: '1033',
                    msdyn_languagename: 'English - United States'
                }
            }));

            await chatSDK.getChatConfig();

            expect(chatSDK.isChatReconnect).toBe(true);
        });

        it('ChatSDK.isChatReconnect should be false if msdyn_enablechatreconnect is false', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);

            chatSDK.OCClient = {};
            chatSDK.OCClient.getChatConfig = jest.fn(() => Promise.resolve({
                DataMaskingInfo: {
                    setting: {
                        msdyn_maskforcustomer: 'false'
                    }
                },
                LiveWSAndLiveChatEngJoin: {
                    msdyn_enablechatreconnect: "false"
                },
                ChatWidgetLanguage: {
                    msdyn_localeid: '1033',
                    msdyn_languagename: 'English - United States'
                }
            }));

            await chatSDK.getChatConfig();

            expect(chatSDK.isChatReconnect).toBe(false);
        });

        it('ChatSDK.getChatToken() should pass reconnectId to OCClient.getChatToken if any on Chat Reconnect', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.isChatReconnect = true;

            await chatSDK.initialize({ useParallelLoad: true });
            chatSDK.reconnectId = 'reconnectId';

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            await chatSDK.getChatToken(false);

            expect(chatSDK.OCClient.getChatToken.mock.calls[0][1].reconnectId).toBe(chatSDK.reconnectId);
        });

        it('ChatSDK.startChat() should pass reconnectId to OCClient.sessionInit if any on Chat Reconnect', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.isChatReconnect = true;

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }

            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            const reconnectId = 'reconnectId';

            jest.spyOn(chatSDK.OCClient, 'getChatToken').mockResolvedValue(Promise.resolve({
                ChatId: '',
                Token: '',
                RegionGtms: '{}'
            }));

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat({
                reconnectId
            });

            expect(chatSDK.reconnectId).toBe(reconnectId);
            expect(chatSDK.OCClient.sessionInit.mock.calls[0][1].reconnectId).toBe(reconnectId);
        });

        it('ChatSDK.endChat() should pass isReconnectChat to OCClient.sessionClose() call \'s optional paramaters on Chat Reconnect', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.getChatToken = jest.fn();
            chatSDK.isChatReconnect = true;

            await chatSDK.initialize({ useParallelLoad: true });
            let retryCount = 0;
            const maxRetries = 3;

            while (chatSDK.AMSClient === null && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                retryCount++;
            }


            chatSDK.ACSClient.initialize = jest.fn();
            chatSDK.ACSClient.joinConversation = jest.fn();
            chatSDK.AMSClient.initialize = jest.fn();

            const reconnectId = 'reconnectId';
            chatSDK.reconnectId = reconnectId;

            jest.spyOn(chatSDK.OCClient, 'sessionInit').mockResolvedValue(Promise.resolve());
            jest.spyOn(chatSDK.OCClient, 'sessionClose').mockResolvedValue(Promise.resolve());

            await chatSDK.startChat();
            await chatSDK.endChat();

            expect(chatSDK.OCClient.sessionClose).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.sessionClose.mock.calls[0][1].isReconnectChat).toBe(true);
            expect(chatSDK.OCClient.sessionClose.mock.calls[0][0]).toBe(reconnectId);
        });

        it('ChatSDK.getChatReconnectContext() with authenticatedUserToken should call OCClient.getReconnectableChats() & return reconnectId if any', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.isChatReconnect = true;
            chatSDK.authenticatedUserToken = 'token';

            await chatSDK.initialize({ useParallelLoad: true });
            const mockedResponse = {
                reconnectid: 'reconnectid'
            };

            jest.spyOn(chatSDK.OCClient, 'getReconnectableChats').mockResolvedValue(Promise.resolve(mockedResponse));
            jest.spyOn(chatSDK.OCClient, 'getReconnectAvailability').mockResolvedValue(Promise.resolve());

            const context = await chatSDK.getChatReconnectContext();

            expect(chatSDK.OCClient.getReconnectableChats).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.getReconnectAvailability).toHaveBeenCalledTimes(0);
            expect(context.reconnectId).toBe(mockedResponse.reconnectid);
        });


        it('ChatSDK.getChatReconnectContext() with authenticatedUserToken should not call OCClient.getReconnectableChats() & return redirectURL due to expired token', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };
            const params = {
                reconnectId: 'reconnectId'
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.isChatReconnect = true;
            chatSDK.authenticatedUserToken = 'token';

            await chatSDK.initialize({ useParallelLoad: true });
            const mockedResponse = {
                reconnectid: 'reconnectid'
            };

            const mockedResponseAvailability = {
                reconnectid: null,
                reconnectRedirectionURL: "www.microsoft.com",
                isReconnectAvailable: false
            };

            jest.spyOn(chatSDK.OCClient, 'getReconnectAvailability').mockResolvedValue(Promise.resolve(mockedResponseAvailability));
            jest.spyOn(chatSDK.OCClient, 'getReconnectableChats').mockResolvedValue(Promise.resolve(mockedResponse));

            const context = await chatSDK.getChatReconnectContext(params);

            expect(chatSDK.OCClient.getReconnectAvailability).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.getReconnectableChats).toHaveBeenCalledTimes(0);
            expect(context.reconnectId).toBe(mockedResponseAvailability.reconnectid);
            expect(context.redirectURL).toBe(mockedResponseAvailability.reconnectRedirectionURL);
        });

        it('ChatSDK.getChatReconnectContext() with authenticatedUserToken should call OCClient.getReconnectableChats(), return redirectURL empty and return valid session', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };
            const params = {
                reconnectId: 'reconnectId'
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.isChatReconnect = true;
            chatSDK.authenticatedUserToken = 'token';

            await chatSDK.initialize({ useParallelLoad: true });
            const mockedResponse = {
                reconnectid: 'reconnectid'
            };

            const mockedResponseAvailability = {
                reconnectid: "12345",

            };

            jest.spyOn(chatSDK.OCClient, 'getReconnectAvailability').mockResolvedValue(Promise.resolve(mockedResponseAvailability));
            jest.spyOn(chatSDK.OCClient, 'getReconnectableChats').mockResolvedValue(Promise.resolve(mockedResponse));

            const context = await chatSDK.getChatReconnectContext(params);

            expect(chatSDK.OCClient.getReconnectAvailability).toHaveBeenCalledTimes(1);
            expect(chatSDK.OCClient.getReconnectableChats).toHaveBeenCalledTimes(1);
            expect(context.reconnectId).toBe(mockedResponse.reconnectid);
        });


        it('ChatSDK.getChatReconnectContext() should pass reconnectId to OCClient.getReconnectAvailability() & return reconnectId if valid & return redirectUrl with "null"', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.isChatReconnect = true;

            await chatSDK.initialize({ useParallelLoad: true });
            jest.spyOn(chatSDK.OCClient, 'getReconnectAvailability').mockResolvedValue(Promise.resolve());

            const params = {
                reconnectId: 'reconnectId'
            };

            const context = await chatSDK.getChatReconnectContext(params);

            expect(chatSDK.OCClient.getReconnectAvailability).toHaveBeenCalledTimes(1);
            expect(context.reconnectId).toBe(params.reconnectId);
            expect(context.redirectURL).toBe(null);
        });

        it('ChatSDK.getChatReconnectContext() should pass reconnectId to OCClient.getReconnectAvailability() & not return reconnectId if invalid & return redirectUrl if any', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.isChatReconnect = true;

            await chatSDK.initialize({ useParallelLoad: true });
            const mockedResponse = {
                isReconnectAvailable: false,
                reconnectRedirectionURL: 'reconnectRedirectionURL'
            }

            jest.spyOn(chatSDK.OCClient, 'getReconnectAvailability').mockResolvedValue(Promise.resolve(mockedResponse));

            const params = {
                reconnectId: 'reconnectId'
            };

            const context = await chatSDK.getChatReconnectContext(params);

            expect(chatSDK.OCClient.getReconnectAvailability).toHaveBeenCalledTimes(1);
            expect(context.reconnectId).toBe(null);
            expect(context.redirectURL).toBe(mockedResponse.reconnectRedirectionURL);
        });

        it('ChatSDK.getChatReconnectContext() should fail if OCClient.getReconnectableChats() fails', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.isChatReconnect = true;
            chatSDK.authenticatedUserToken = 'token';

            await chatSDK.initialize({ useParallelLoad: true });
            jest.spyOn(chatSDK.OCClient, 'getReconnectableChats').mockResolvedValue(Promise.reject());
            jest.spyOn(console, 'error');

            try {
                await chatSDK.getChatReconnectContext();
            } catch {
                expect(console.error).toHaveBeenCalled();
            }

            expect(chatSDK.OCClient.getReconnectableChats).toHaveBeenCalledTimes(1);
        });


        it('ChatSDK.getChatReconnectContext() should fail if OCClient.getReconnectAvailability() fails', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();
            chatSDK.isChatReconnect = true;

            await chatSDK.initialize({ useParallelLoad: true });
            jest.spyOn(chatSDK.OCClient, 'getReconnectAvailability').mockResolvedValue(Promise.reject());
            jest.spyOn(console, 'error');

            const params = {
                reconnectId: 'reconnectId'
            };

            try {
                await chatSDK.getChatReconnectContext(params);
            } catch {
                expect(console.error).toHaveBeenCalled();
            }

            expect(chatSDK.OCClient.getReconnectAvailability).toHaveBeenCalledTimes(1);
        });

        it('ChatSDK.getPostChatSurveyContext() should reject if post chat is disabled', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const dummyConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_postconversationsurveyenable: "false",
                    msfp_sourcesurveyidentifier: "",
                    postConversationSurveyOwnerId: ""
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            chatSDK.liveChatConfig = dummyConfig;
            jest.spyOn(chatSDK, 'getConversationDetails').mockResolvedValue({
                state: "Active",
                conversationId: "convId"
            });
            jest.spyOn(console, 'error');

            try {
                await chatSDK.getPostChatSurveyContext();
                throw ("Should throw error.");
            } catch (ex) {
                expect(chatSDK.getConversationDetails).not.toHaveBeenCalled();
            }
        });

        it('ChatSDK.getPostChatSurveyContext() should reject if survey response is null', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const dummyConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_postconversationsurveyenable: "true",
                    msfp_sourcesurveyidentifier: "",
                    postConversationSurveyOwnerId: ""
                },
                ChatWidgetLanguage: {
                    msdyn_localeid: "1033"
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            chatSDK.liveChatConfig = dummyConfig;
            jest.spyOn(chatSDK, 'getConversationDetails').mockResolvedValue({
                state: "Active",
                conversationId: "convId",
                canRenderPostChat: "True"
            });
            jest.spyOn(chatSDK.OCClient, 'getSurveyInviteLink').mockResolvedValue(null);
            jest.spyOn(console, 'error');

            try {
                await chatSDK.getPostChatSurveyContext();
                throw ("Should throw error.");
            } catch (ex) {
                expect(chatSDK.getConversationDetails).toHaveBeenCalledTimes(1);
                expect(chatSDK.OCClient.getSurveyInviteLink).toHaveBeenCalledTimes(1);
            }
        });

        it('ChatSDK.getPostChatSurveyContext() should reject if survey response is invalid', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const dummyConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_postconversationsurveyenable: "true",
                    msfp_sourcesurveyidentifier: "",
                    postConversationSurveyOwnerId: ""
                },
                ChatWidgetLanguage: {
                    msdyn_localeid: "1033"
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            chatSDK.liveChatConfig = dummyConfig;
            jest.spyOn(chatSDK, 'getConversationDetails').mockResolvedValue({
                state: "Active",
                conversationId: "convId",
                canRenderPostChat: "True"
            });
            jest.spyOn(chatSDK.OCClient, 'getSurveyInviteLink').mockResolvedValue({
                inviteList: [],
                formsProLocaleCode: "en-us"
            });
            jest.spyOn(console, 'error');

            try {
                await chatSDK.getPostChatSurveyContext();
                throw ("Should throw error.");
            } catch (ex) {
                expect(chatSDK.getConversationDetails).toHaveBeenCalledTimes(1);
                expect(chatSDK.OCClient.getSurveyInviteLink).toHaveBeenCalledTimes(1);
            }
        });

        it('ChatSDK.getPostChatSurveyContext() should resolve if survey response is valid and CanRenderPostChat is True', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const dummyConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_postconversationsurveyenable: "true",
                    msfp_sourcesurveyidentifier: "",
                    postConversationSurveyOwnerId: ""
                },
                ChatWidgetLanguage: {
                    msdyn_localeid: "1033"
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            chatSDK.liveChatConfig = dummyConfig;
            jest.spyOn(chatSDK, 'getConversationDetails').mockResolvedValue({
                state: "Active",
                conversationId: "convId",
                canRenderPostChat: "True"
            });
            jest.spyOn(chatSDK.OCClient, 'getSurveyInviteLink').mockResolvedValue({
                inviteList: [
                    {
                        invitationLink: "dummy"
                    }
                ],
                formsProLocaleCode: "en-us"
            });
            jest.spyOn(console, 'error');

            try {
                const postChatContext = await chatSDK.getPostChatSurveyContext();
                expect(chatSDK.getConversationDetails).toHaveBeenCalledTimes(1);
                expect(chatSDK.OCClient.getSurveyInviteLink).toHaveBeenCalledTimes(1);
                expect(postChatContext.participantJoined).toBe(true);
            } catch (ex) {
                throw ("Should not throw error. " + ex);
            }
        });

        it('ChatSDK.getPostChatSurveyContext() should resolve if survey response is valid and CanRenderPostChat is null', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const dummyConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_postconversationsurveyenable: "true",
                    msfp_sourcesurveyidentifier: "",
                    postConversationSurveyOwnerId: ""
                },
                ChatWidgetLanguage: {
                    msdyn_localeid: "1033"
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            chatSDK.liveChatConfig = dummyConfig;
            jest.spyOn(chatSDK, 'getConversationDetails').mockResolvedValue({
                state: "Active",
                conversationId: "convId"
            });
            jest.spyOn(chatSDK.OCClient, 'getSurveyInviteLink').mockResolvedValue({
                inviteList: [
                    {
                        invitationLink: "dummy"
                    }
                ],
                formsProLocaleCode: "en-us"
            });
            jest.spyOn(console, 'error');

            try {
                const postChatContext = await chatSDK.getPostChatSurveyContext();
                expect(chatSDK.getConversationDetails).toHaveBeenCalledTimes(1);
                expect(chatSDK.OCClient.getSurveyInviteLink).toHaveBeenCalledTimes(1);
                expect(postChatContext.participantJoined).toBeFalsy();
            } catch (ex) {
                throw ("Should not throw error. " + ex);
            }
        });

        it('ChatSDK.getPostChatSurveyContext() should resolve if bot survey is being used', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const dummyConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_postconversationsurveyenable: "true",
                    msfp_sourcesurveyidentifier: "",
                    msfp_botsourcesurveyidentifier: "1",
                    postConversationSurveyOwnerId: "",
                    postConversationBotSurveyOwnerId: "2",
                    msdyn_surveyprovider: "MCS"
                },
                ChatWidgetLanguage: {
                    msdyn_localeid: "1033"
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            chatSDK.liveChatConfig = dummyConfig;
            jest.spyOn(chatSDK, 'getConversationDetails').mockResolvedValue({
                state: "Active",
                conversationId: "convId",
                canRenderPostChat: "True",
                participantType: "Bot"
            });
            jest.spyOn(chatSDK.OCClient, 'getSurveyInviteLink').mockResolvedValue({
                inviteList: [
                    {
                        invitationLink: "dummy"
                    }
                ],
                formsProLocaleCode: "en-us"
            });
            jest.spyOn(console, 'error');

            try {
                const postChatContext = await chatSDK.getPostChatSurveyContext();
                expect(chatSDK.getConversationDetails).toHaveBeenCalledTimes(1);
                expect(chatSDK.OCClient.getSurveyInviteLink).toHaveBeenCalledWith("2", {
                    "FormId": "1",
                    "ConversationId": "convId",
                    "OCLocaleCode": "en-us",
                    "SurveyProvider": "MCS",
                    "WidgetId": "[data-app-id]"
                },
                    expect.any(Object));
                expect(postChatContext.participantJoined).toBeTruthy();
                expect(postChatContext.participantType).toBe("Bot");
            } catch (ex) {
                throw ("Should not throw error. " + ex);
            }
        });

        it('ChatSDK.getAgentAvailability() should throw error if conversation already started', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                },
                getAuthToken: async () => {
                    return 'authenticatedUserToken'
                }
            };

            const dummyConfig = {
                ChatWidgetLanguage: {
                    msdyn_localeid: "1033"
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true }); chatSDK.authSettings = {};
            chatSDK.authenticatedUserToken = {};
            chatSDK.conversation = {};
            jest.spyOn(console, 'error');

            chatSDK.liveChatConfig = dummyConfig;

            try {
                await chatSDK.getAgentAvailability();
                throw ("Should throw error.");
            } catch (ex) {
                expect(ex?.message).toEqual("GetAgentAvailability can only be called before a chat has started.")
            }
        });

        it('ChatSDK.getAgentAvailability() should should return response in happy path', async () => {
            const chatSDKConfig = {
                telemetry: {
                    disable: true
                },
                chatReconnect: {
                    disable: false,
                }
            };

            const dummyConfig = {
                LiveWSAndLiveChatEngJoin: {
                    msdyn_postconversationsurveyenable: "true",
                    msfp_sourcesurveyidentifier: "",
                    msfp_botsourcesurveyidentifier: "1",
                    postConversationSurveyOwnerId: "",
                    postConversationBotSurveyOwnerId: "2"
                },
                ChatWidgetLanguage: {
                    msdyn_localeid: "1033"
                }
            };

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
            chatSDK.getChatConfig = jest.fn();

            await chatSDK.initialize({ useParallelLoad: true });
            chatSDK.liveChatConfig = dummyConfig;
            chatSDK.authSettings = {};
            chatSDK.authenticatedUserToken = {};
            chatSDK.conversation = null;

            jest.spyOn(chatSDK.OCClient, 'getAgentAvailability').mockResolvedValue({
                isAgentAvailable: true
            });

            try {
                const agentAvailability = await chatSDK.getAgentAvailability();
                expect(agentAvailability).toEqual({
                    isAgentAvailable: true
                });
            } catch (ex) {
                throw ("Should not throw error. " + ex);
            }
        });
    });
})