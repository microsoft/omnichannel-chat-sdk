const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;
import IFileInfo from "@microsoft/omnichannel-ic3core/lib/interfaces/IFileInfo";
import FileSharingProtocolType from "@microsoft/omnichannel-ic3core/lib/model/FileSharingProtocolType";
import IFileMetadata from "@microsoft/omnichannel-ic3core/lib/model/IFileMetadata";
import IMessage from "@microsoft/omnichannel-ic3core/lib/model/IMessage";
import PersonType from "@microsoft/omnichannel-ic3core/lib/model/PersonType";

describe('Omnichannel Chat SDK', () => {
    describe('Configurations', () => {
        it('ChatSDK should require omnichannelConfig as paramater', () => {
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

        it('ChatSDK.startchat() with existing liveChatContext should not call OCClient.getChatToken()', async() => {
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

        it('ChatSDK.getCurrentLiveChatContext() with empty chatToken should return an empty chat sesssion data', async () => {
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
