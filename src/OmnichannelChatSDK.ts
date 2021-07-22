/* eslint-disable @typescript-eslint/no-non-null-assertion */

import AriaTelemetry from "./telemetry/AriaTelemetry";
import CallingOptionsOptionSetNumber from "./core/CallingOptionsOptionSetNumber";
import ChatAdapterProtocols from "./core/ChatAdapterProtocols";
import ConversationMode from "./core/ConversationMode";
import { createIC3ClientLogger, createOCSDKLogger, IC3ClientLogger, OCSDKLogger } from "./utils/loggers";
import createTelemetry from "./utils/createTelemetry";
import createVoiceVideoCalling from "./api/createVoiceVideoCalling";
import { defaultMessageTags } from "./core/MessageTags";
import DeliveryMode from "@microsoft/omnichannel-ic3core/lib/model/DeliveryMode";
import FileSharingProtocolType from "@microsoft/omnichannel-ic3core/lib/model/FileSharingProtocolType";
import HostType from "@microsoft/omnichannel-ic3core/lib/interfaces/HostType";
import IAuthSettings from "./core/IAuthSettings";
import IChatConfig from "./core/IChatConfig";
import IChatSDKConfig from "./core/IChatSDKConfig";
import IChatSDKMessage from "./core/IChatSDKMessage";
import IChatToken from "./external/IC3Adapter/IChatToken";
import IChatTranscriptBody from "./core/IChatTranscriptBody";
import IConversation from "@microsoft/omnichannel-ic3core/lib/model/IConversation";
import IEmailTranscriptOptionalParams from "@microsoft/ocsdk/lib/Interfaces/IEmailTranscriptOptionalParams";
import IFileInfo from "@microsoft/omnichannel-ic3core/lib/interfaces/IFileInfo";
import IFileMetadata from "@microsoft/omnichannel-ic3core/lib/model/IFileMetadata";
import IGetChatTokenOptionalParams from "@microsoft/ocsdk/lib/Interfaces/IGetChatTokenOptionalParams";
import IGetChatTranscriptsOptionalParams from "@microsoft/ocsdk/lib/Interfaces/IGetChatTranscriptsOptionalParams";
import IIC3AdapterOptions from "./external/IC3Adapter/IIC3AdapterOptions";
import ILiveChatContext from "./core/ILiveChatContext";
import IInitializationInfo from "@microsoft/omnichannel-ic3core/lib/model/IInitializationInfo";
import IMessage from "@microsoft/omnichannel-ic3core/lib/model/IMessage";
import InitContext from "@microsoft/ocsdk/lib/Model/InitContext";
import IOmnichannelConfig from "./core/IOmnichannelConfig";
import IOmnichannelConfiguration from "@microsoft/ocsdk/lib/Interfaces/IOmnichannelConfiguration";
import IPerson from "@microsoft/omnichannel-ic3core/lib/model/IPerson";
import IRawMessage from "@microsoft/omnichannel-ic3core/lib/model/IRawMessage";
import IRawThread from "@microsoft/omnichannel-ic3core/lib/interfaces/IRawThread";
import IReconnectableChatsParams from "@microsoft/ocsdk/lib/Interfaces/IReconnectableChatsParams";
import IRegionGtms from "@microsoft/omnichannel-ic3core/lib/model/IRegionGtms";
import {isCustomerMessage} from "./utils/utilities";
import ISDKConfiguration from "@microsoft/ocsdk/lib/Interfaces/ISDKConfiguration";
import ISessionInitOptionalParams from "@microsoft/ocsdk/lib/Interfaces/ISessionInitOptionalParams";
import ISessionCloseOptionalParams from "@microsoft/ocsdk/lib/Interfaces/ISessionCloseOptionalParams";
import libraries from "./utils/libraries";
import IStartChatOptionalParams from "./core/IStartChatOptionalParams";
import LiveWorkItemDetails from "./core/LiveWorkItemDetails";
import LiveWorkItemState from "./core/LiveWorkItemState";
import { loadScript } from "./utils/WebUtils";
import MessageContentType from "@microsoft/omnichannel-ic3core/lib/model/MessageContentType";
import MessageType from "@microsoft/omnichannel-ic3core/lib/model/MessageType";
import OnNewMessageOptionalParams from "./core/OnNewMessageOptionalParams";
import PersonType from "@microsoft/omnichannel-ic3core/lib/model/PersonType";
import platform from "./utils/platform";
import ProtocolType from "@microsoft/omnichannel-ic3core/lib/interfaces/ProtocoleType";
import ScenarioMarker from "./telemetry/ScenarioMarker";
import {SDKProvider as OCSDKProvider, uuidv4 } from "@microsoft/ocsdk";
import {SDKProvider as IC3SDKProvider} from '@microsoft/omnichannel-ic3core';
import TelemetryEvent from "./telemetry/TelemetryEvent";
import validateOmnichannelConfig from "./validators/OmnichannelConfigValidator";
import validateSDKConfig, {defaultChatSDKConfig} from "./validators/SDKConfigValidators";


class OmnichannelChatSDK {
    private debug: boolean;
    public OCSDKProvider: unknown;
    public IC3SDKProvider: unknown;
    public OCClient: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    public IC3Client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    public omnichannelConfig: IOmnichannelConfig;
    public chatSDKConfig: IChatSDKConfig;
    public isInitialized: boolean;
    public requestId: string;
    private chatToken: IChatToken;
    private liveChatConfig: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private dataMaskingRules: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private authSettings: IAuthSettings | null = null;
    private authenticatedUserToken: string | null = null;
    private preChatSurvey: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private conversation: IConversation | null = null;
    private callingOption: CallingOptionsOptionSetNumber = CallingOptionsOptionSetNumber.NoCalling;
    private telemetry: typeof AriaTelemetry | null = null;
    private scenarioMarker: ScenarioMarker;
    private ic3ClientLogger: IC3ClientLogger | null = null;
    private ocSdkLogger: OCSDKLogger | null = null;
    private isPersistentChat = false;
    private isChatReconnect = false;
    private isAuthenticated = false;
    private reconnectId: null | string = null;
    private refreshTokenTimer: number | null = null;

    constructor(omnichannelConfig: IOmnichannelConfig, chatSDKConfig: IChatSDKConfig = defaultChatSDKConfig) {
        this.debug = false;
        this.omnichannelConfig = omnichannelConfig;
        this.chatSDKConfig = {
            ...defaultChatSDKConfig,
            ...chatSDKConfig // overrides
        };
        this.isInitialized = false;
        this.requestId = uuidv4();
        this.chatToken = {};
        this.liveChatConfig = {};
        this.dataMaskingRules = {};
        this.authSettings = null;
        this.preChatSurvey = null;
        this.telemetry = createTelemetry(this.debug);
        this.scenarioMarker = new ScenarioMarker(this.omnichannelConfig);
        this.ic3ClientLogger = createIC3ClientLogger(this.omnichannelConfig);
        this.ocSdkLogger = createOCSDKLogger(this.omnichannelConfig);

        this.scenarioMarker.useTelemetry(this.telemetry);
        this.ic3ClientLogger.useTelemetry(this.telemetry);
        this.ocSdkLogger.useTelemetry(this.telemetry);

        validateOmnichannelConfig(omnichannelConfig);
        validateSDKConfig(chatSDKConfig);

        this.chatSDKConfig.telemetry?.disable && this.telemetry?.disable();

        if (this.chatSDKConfig.telemetry?.ariaTelemetryKey) {
            this.telemetry.initialize(this.chatSDKConfig.telemetry.ariaTelemetryKey);
        }

        this.ic3ClientLogger?.setRequestId(this.requestId);
        this.ocSdkLogger?.setRequestId(this.requestId);
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
        this.telemetry?.setDebug(flag);
        this.scenarioMarker.setDebug(flag);
        this.ic3ClientLogger?.setDebug(flag);
        this.ocSdkLogger?.setDebug(flag);
    }

    public async initialize(): Promise<IChatConfig> {
        this.scenarioMarker.startScenario(TelemetryEvent.InitializeChatSDK);

        if (this.isInitialized) {
            this.scenarioMarker.completeScenario(TelemetryEvent.InitializeChatSDK);
            return this.liveChatConfig;
        }

        try {
            this.OCSDKProvider = OCSDKProvider;
            const OCClient = await OCSDKProvider.getSDK(this.omnichannelConfig as IOmnichannelConfiguration, {} as ISDKConfiguration, this.ocSdkLogger as OCSDKLogger);
            const IC3Client = await this.getIC3Client();

            // Assign & Update flag only if all dependencies have been initialized succesfully
            this.OCClient = OCClient;
            this.IC3Client = IC3Client;

            await this.getChatConfig();

            this.isInitialized = true;

            this.scenarioMarker.completeScenario(TelemetryEvent.InitializeChatSDK);
        } catch {
            this.scenarioMarker.failScenario(TelemetryEvent.InitializeChatSDK);
        }

        return this.liveChatConfig;
    }

    public async getPreviousActiveSession(): Promise<string | null> {
        try {
            const reconnectableChatsParams: IReconnectableChatsParams = {
                authenticatedUserToken: this.authenticatedUserToken as string
            }

            const reconnectableChatsResponse = await this.OCClient.getReconnectableChats(reconnectableChatsParams);

            if (reconnectableChatsResponse && reconnectableChatsResponse.reconnectid) {  
                return reconnectableChatsResponse.reconnectid as string
            }
        } catch {
            const exceptionDetails = {
                response: "GetPreviousActiveSessionFailed"
            }

            throw Error(exceptionDetails.response);
        }

        return null;
    }

    public async getReconnectRedirectionURL(reconnectId: string): Promise<string | null> {
        try {
            const  reconnectAvailabilityResponse = await this.OCClient.getReconnectAvailability(reconnectId);

            if (reconnectAvailabilityResponse && !reconnectAvailabilityResponse.isReconnectAvailable) {
                if (reconnectAvailabilityResponse.reconnectRedirectionURL) {
                    return reconnectAvailabilityResponse.reconnectRedirectionURL as string;
                } 
            } else {
                    //Reconnect URL is not expired, set the reconnect id
                    this.reconnectId = reconnectId;
            }
        } catch {
            const exceptionDetails = {
                response: "GetReconnectRedirectionURLFailed"
            }

            throw Error(exceptionDetails.response); 
        }

        return null;
    }

    public async startChat(optionalParams: IStartChatOptionalParams = {}): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.StartChat, {
            RequestId: this.requestId
        });

        if (this.isChatReconnect && !this.chatSDKConfig.chatReconnect?.disable && !this.isPersistentChat && optionalParams.previousChatId) {
             this.reconnectId = optionalParams.previousChatId;
        }

        if (this.isPersistentChat && !this.chatSDKConfig.persistentChat?.disable) {
            try {
                const reconnectableChatsParams: IReconnectableChatsParams = {
                    authenticatedUserToken: this.authenticatedUserToken as string
                }

                const reconnectableChatsResponse = await this.OCClient.getReconnectableChats(reconnectableChatsParams);

                if (reconnectableChatsResponse && reconnectableChatsResponse.reconnectid) {
                     this.reconnectId = reconnectableChatsResponse.reconnectid;
                }
            } catch {
                const exceptionDetails = {
                    response: "OCClientGetReconnectableChatsFailed"
                }

                throw Error(exceptionDetails.response);
            }
        }

        if (optionalParams.liveChatContext && !this.isPersistentChat && !this.isChatReconnect) {
            this.chatToken = optionalParams.liveChatContext.chatToken || {};
            this.requestId = optionalParams.liveChatContext.requestId || uuidv4();

            // Validate conversation
            const conversationDetails = await this.getConversationDetails();
            if (Object.keys(conversationDetails).length === 0) {
                const exceptionDetails = {
                    response: "InvalidConversation"
                };

                this.scenarioMarker.failScenario(TelemetryEvent.StartChat, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                console.error(`Conversation not found`);
                throw Error(exceptionDetails.response);
            }

            if (conversationDetails.state === LiveWorkItemState.WrapUp || conversationDetails.state === LiveWorkItemState.Closed) {
                const exceptionDetails = {
                    response: "ClosedConversation"
                };

                this.scenarioMarker.failScenario(TelemetryEvent.StartChat, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                console.error(`Unable to join conversation that's in '${conversationDetails.state}' state`);
                throw Error(exceptionDetails.response);
            }
        }

        if (this.chatToken && Object.keys(this.chatToken).length === 0) {
            await this.getChatToken(false);
        }

        this.ic3ClientLogger?.setChatId(this.chatToken.chatId || '');
        this.ocSdkLogger?.setChatId(this.chatToken.chatId || '');

        const sessionInitOptionalParams: ISessionInitOptionalParams = {
            initContext: {} as InitContext
        };

        if (this.isPersistentChat && !this.chatSDKConfig.persistentChat?.disable) {
            sessionInitOptionalParams.reconnectId = this.reconnectId as string;
        }

        if (this.isChatReconnect && !this.chatSDKConfig.chatReconnect?.disable && !this.isPersistentChat) {
            sessionInitOptionalParams.reconnectId = this.reconnectId as string;
        }

        if (optionalParams.customContext) {
            (sessionInitOptionalParams.initContext! as any).customContextData = optionalParams.customContext; // eslint-disable-line @typescript-eslint/no-explicit-any
        }

        if (optionalParams.browser) {
            sessionInitOptionalParams.initContext!.browser = optionalParams.browser;
        }

        if (optionalParams.os) {
            sessionInitOptionalParams.initContext!.os = optionalParams.os;
        }

        if (optionalParams.locale) {
            sessionInitOptionalParams.initContext!.locale = optionalParams.locale;
        }

        if (optionalParams.device) {
            sessionInitOptionalParams.initContext!.device = optionalParams.device;
        }

        if (optionalParams.preChatResponse) {
            sessionInitOptionalParams.initContext!.preChatResponse = optionalParams.preChatResponse;
        }

        // Override initContext completely
        if (optionalParams.initContext) {
            sessionInitOptionalParams.initContext = optionalParams.initContext;
        }

        if (this.authenticatedUserToken) {
            sessionInitOptionalParams.authenticatedUserToken = this.authenticatedUserToken;
        }

        try {
            await this.OCClient.sessionInit(this.requestId, sessionInitOptionalParams);
        } catch (error) {
            const exceptionDetails = {
                response: "OCClientSessionInitFailed"
            };

            this.scenarioMarker.failScenario(TelemetryEvent.StartChat, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string,
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            console.error(`OmnichannelChatSDK/startChat/sessionInit/error ${error}`);
            return error;
        }

        try {
            await this.IC3Client.initialize({
                token: this.chatToken.token,
                regionGtms: this.chatToken.regionGTMS,
                visitor: true
            });
        } catch (error) {
            const exceptionDetails = {
                response: "IC3ClientInitializeFailed"
            };

            this.scenarioMarker.failScenario(TelemetryEvent.StartChat, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string,
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            console.error(`OmnichannelChatSDK/startChat/initialize/error ${error}`);
            return error;
        }

        try {
            this.conversation = await this.IC3Client.joinConversation(this.chatToken.chatId);
            this.scenarioMarker.completeScenario(TelemetryEvent.StartChat, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });
        } catch (error) {
            const exceptionDetails = {
                response: "IC3ClientJoinConversationFailed"
            };

            this.scenarioMarker.failScenario(TelemetryEvent.StartChat, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string,
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            console.error(`OmnichannelChatSDK/startChat/joinConversation/error ${error}`);
            return error;
        }

        if (this.isPersistentChat && !this.chatSDKConfig.persistentChat?.disable) {           
            this.refreshTokenTimer = setInterval(async () => {
               await this.getChatToken(false);
               this.updateChatToken(this.chatToken.token as string, this.chatToken.regionGTMS);
            }, this.chatSDKConfig.persistentChat?.tokenUpdateTime); 
        }
    }

    public async endChat(): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.EndChat, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        const sessionCloseOptionalParams: ISessionCloseOptionalParams = {};

        if (this.isPersistentChat && !this.chatSDKConfig.persistentChat?.disable) {
            const isReconnectChat = this.reconnectId !== null? true: false;

            sessionCloseOptionalParams.isPersistentChat = this.isPersistentChat;
            sessionCloseOptionalParams.isReconnectChat = isReconnectChat;
        }

        if (this.isChatReconnect && !this.chatSDKConfig.chatReconnect?.disable && !this.isPersistentChat) {
            const isChatReconnect = this.reconnectId !== null? true: false;

            sessionCloseOptionalParams.isReconnectChat = isChatReconnect;
        }

        if (this.authenticatedUserToken) {
            sessionCloseOptionalParams.authenticatedUserToken = this.authenticatedUserToken;
        }

        try {
            await this.OCClient.sessionClose(this.requestId, sessionCloseOptionalParams);

            this.scenarioMarker.completeScenario(TelemetryEvent.EndChat, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });

            this.conversation!.disconnect();
            this.conversation = null;
            this.requestId = uuidv4();
            this.chatToken = {};

            this.ic3ClientLogger?.setRequestId(this.requestId);
            this.ic3ClientLogger?.setChatId('');

            this.ocSdkLogger?.setRequestId(this.requestId);
            this.ocSdkLogger?.setChatId('');
        } catch (error) {
            const exceptionDetails = {
                response: "OCClientSessionCloseFailed"
            };

            this.scenarioMarker.failScenario(TelemetryEvent.EndChat, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string,
                ExceptionDetails: JSON.stringify(exceptionDetails),
            });

            console.error(`OmnichannelChatSDK/endChat/error ${error}`);
            return error;
        }
        
        if (this.refreshTokenTimer !== null) {           
            clearInterval(this.refreshTokenTimer);
            this.refreshTokenTimer = null;
        }
    }

    public async getCurrentLiveChatContext(): Promise<ILiveChatContext | {}> {
        const chatToken = await this.getChatToken();
        const {requestId} = this;

        const chatSession: ILiveChatContext = {
            chatToken,
            requestId
        }

        if (Object.keys(chatSession.chatToken).length === 0) {
            return {};
        }

        return chatSession;
    }

    public async getConversationDetails(): Promise<LiveWorkItemDetails> {
        this.scenarioMarker.startScenario(TelemetryEvent.GetConversationDetails, {
            RequestId: this.requestId,
            ChatId: this.chatToken?.chatId as string || '',
        });

        try {
            const lwiDetails = await this.OCClient.getLWIDetails(this.requestId);
            const {State: state, ConversationId: conversationId, AgentAcceptedOn: agentAcceptedOn} = lwiDetails;
            const liveWorkItemDetails: LiveWorkItemDetails = {
                state,
                conversationId
            };

            if (agentAcceptedOn) {
                liveWorkItemDetails.agentAcceptedOn = agentAcceptedOn;
            }

            this.scenarioMarker.completeScenario(TelemetryEvent.GetConversationDetails, {
                RequestId: this.requestId,
                ChatId: this.chatToken?.chatId as string || '',
            });

            return liveWorkItemDetails;
        } catch (error) {
            this.scenarioMarker.failScenario(TelemetryEvent.GetConversationDetails, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string || '',
            });

            console.error(`OmnichannelChatSDK/getConversationDetails/error ${error}`);
        }

        return {} as LiveWorkItemDetails;
    }

    /**
     * Gets PreChat Survey.
     * @param parse Whether to parse PreChatSurvey to JSON or not.
     */
    public async getPreChatSurvey(parse = true): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        return parse ? JSON.parse(this.preChatSurvey) : this.preChatSurvey;
    }

    public async getLiveChatConfig(cached = true): Promise<IChatConfig> {
        if (cached) {
            return this.liveChatConfig;
        }

        return this.getChatConfig();
    }

    public async getChatToken(cached = true): Promise<IChatToken> {
        this.scenarioMarker.startScenario(TelemetryEvent.GetChatToken, {
            RequestId: this.requestId
        });

        if (!cached) {
            try {
                const getChatTokenOptionalParams: IGetChatTokenOptionalParams = {};
                if (this.authenticatedUserToken) {
                    getChatTokenOptionalParams.authenticatedUserToken = this.authenticatedUserToken;
                }

                if (this.isPersistentChat && !this.chatSDKConfig.persistentChat?.disable) {
                    getChatTokenOptionalParams.reconnectId = this.reconnectId as string;
                }

                if (this.isChatReconnect && !this.chatSDKConfig.chatReconnect?.disable && !this.isPersistentChat) {
                    getChatTokenOptionalParams.reconnectId = this.reconnectId as string;
                }

                const chatToken = await this.OCClient.getChatToken(this.requestId, getChatTokenOptionalParams);
                const {ChatId: chatId, Token: token, RegionGtms: regionGtms, ExpiresIn: expiresIn, VisitorId: visitorId, VoiceVideoCallToken: voiceVideoCallToken} = chatToken;
                this.chatToken = {
                    chatId,
                    regionGTMS: JSON.parse(regionGtms),
                    requestId: this.requestId,
                    token,
                    expiresIn,
                    visitorId,
                    voiceVideoCallToken
                };

                this.scenarioMarker.completeScenario(TelemetryEvent.GetChatToken, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            } catch (error) {
                const exceptionDetails = {
                    response: "OCClientGetChatTokenFailed"
                };

                this.scenarioMarker.failScenario(TelemetryEvent.GetChatToken, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                    ExceptionDetails: JSON.stringify(exceptionDetails),
                });

                console.error(`OmnichannelChatSDK/getChatToken/error ${error}`);
            }
        } else {
            this.scenarioMarker.completeScenario(TelemetryEvent.GetChatToken, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });
        }

        return this.chatToken;
    }

    public async getCallingToken(): Promise<string> {
        if (this.chatToken && Object.keys(this.chatToken).length === 0) {
            return '';
        }

        if (this.chatToken.voiceVideoCallToken) {
            console.log(`calling:acs`);
            return this.chatToken.voiceVideoCallToken.Token;
        } else {
            console.log(`calling:skype`);
            return this.chatToken.token as string;
        }
    }

    public async getMessages(): Promise<IMessage[] | undefined> {
        return this.conversation?.getMessages();
    }

    public async getDataMaskingRules(): Promise<any> {  // eslint-disable-line  @typescript-eslint/no-explicit-any
        return this.dataMaskingRules;
    }

    public async sendMessage(message: IChatSDKMessage): Promise<void> {
        const {disable, maskingCharacter} = this.chatSDKConfig.dataMasking!;

        let {content} = message;
        if (Object.keys(this.dataMaskingRules).length > 0 && !disable) {
            for (const maskingRule of Object.values(this.dataMaskingRules)) {
                const regex = new RegExp(maskingRule as string, 'g');
                let match;
                while (match = regex.exec(content)) {  // eslint-disable-line no-cond-assign
                    const replaceStr = match[0].replace(/./g, maskingCharacter);
                    content = content.replace(match[0], replaceStr);
                }
            }
        }
        message.content = content;

        const messageToSend: IRawMessage = {
            content: message.content,
            timestamp: new Date(),
            contentType: MessageContentType.Text,
            deliveryMode: DeliveryMode.Bridged,
            messageType: MessageType.UserMessage,
            properties: undefined,
            tags: [...defaultMessageTags],
            sender: {
              displayName : "Customer",
              id : "customer",
              type : PersonType.User
            }
        };

        if (message.tags) {
            messageToSend.tags = message.tags;
        }

        if (message.timestamp) {
            messageToSend.timestamp = message.timestamp;
        }

        return this.conversation!.sendMessage(messageToSend);
    }

    public async onNewMessage(onNewMessageCallback: CallableFunction, optionalParams: OnNewMessageOptionalParams | unknown = {}): Promise<void> {
        const postedMessages = new Set();

        if ((optionalParams as OnNewMessageOptionalParams).rehydrate) {
            this.debug && console.log('[OmnichannelChatSDK][onNewMessage] rehydrate');
            const messages = await this.getMessages() as IRawMessage[];
            for (const message of messages.reverse()) {
                const {clientmessageid} = message;

                if (postedMessages.has(clientmessageid)) {
                    continue;
                }

                postedMessages.add(clientmessageid);
                onNewMessageCallback(message);
            }
        }

        this.conversation?.registerOnNewMessage((message: IRawMessage) => {
            const {clientmessageid, messageType} = message;

            // Filter out customer messages
            if (isCustomerMessage(message)) {
                return;
            }

            // Skip duplicates
            if (postedMessages.has(clientmessageid)) {
                return;
            }

            if (messageType !== MessageType.Typing) {
                onNewMessageCallback(message);
            }
        });
    }

    public async sendTypingEvent(): Promise<void> {
        const typingPayload = `{isTyping: 0}`;

        this.scenarioMarker.startScenario(TelemetryEvent.SendTypingEvent, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        try {
            await this.conversation!.indicateTypingStatus(0);
            const members: IPerson[] = await this.conversation!.getMembers();
            const botMembers = members.filter((member: IPerson) => member.type === PersonType.Bot);
            await this.conversation!.sendMessageToBot(botMembers[0].id, {payload: typingPayload});

            this.scenarioMarker.completeScenario(TelemetryEvent.SendTypingEvent, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });

        } catch (error) {
            console.error("OmnichannelChatSDK/sendTypingEvent/error");

            this.scenarioMarker.failScenario(TelemetryEvent.SendTypingEvent, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });
            return error;
        }
    }

    public async onTypingEvent(onTypingEventCallback: CallableFunction): Promise<void> {
        this.conversation?.registerOnNewMessage((message: IRawMessage) => {
            const {messageType} = message;

            // Filter out customer messages
            if (isCustomerMessage(message)) {
                return;
            }

            if (messageType === MessageType.Typing) {
                onTypingEventCallback(message);
            }
        });
    }

    public async onAgentEndSession(onAgentEndSessionCallback: (message: IRawThread) => void): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.OnAgentEndSession, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        try {
            this.conversation?.registerOnThreadUpdate((message: IRawThread) => {
                const {members} = message;

                // Agent ending conversation would have 1 member left in the chat thread
                if (members.length === 1) {
                    onAgentEndSessionCallback(message);

                    if (this.refreshTokenTimer !== null) {           
                        clearInterval(this.refreshTokenTimer);
                        this.refreshTokenTimer = null;
                    }
                }
            });
            this.scenarioMarker.completeScenario(TelemetryEvent.OnAgentEndSession, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });

        } catch (error) {
            this.scenarioMarker.failScenario(TelemetryEvent.OnAgentEndSession, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });
        }
    }

    public async uploadFileAttachment(fileInfo: IFileInfo | File): Promise<IRawMessage> {
        this.scenarioMarker.startScenario(TelemetryEvent.UploadFileAttachment, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        let fileMetadata: IFileMetadata;

        if (platform.isReactNative() || platform.isNode()) {
            fileMetadata = await this.conversation!.sendFileData(fileInfo as IFileInfo, FileSharingProtocolType.AmsBasedFileSharing);
        } else {
            fileMetadata = await this.conversation!.uploadFile(fileInfo as File, FileSharingProtocolType.AmsBasedFileSharing);
        }

        const messageToSend: IRawMessage = {
            content: "",
            timestamp: new Date(),
            contentType: MessageContentType.Text,
            deliveryMode: DeliveryMode.Bridged,
            messageType: MessageType.UserMessage,
            tags: [...defaultMessageTags],
            sender: {
                displayName: "Customer",
                id: "customer",
                type: PersonType.User,
            },
            fileMetadata: fileMetadata
        };

        try {
            await this.conversation!.sendFileMessage(fileMetadata, messageToSend);

            this.scenarioMarker.completeScenario(TelemetryEvent.UploadFileAttachment, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });

            return messageToSend;
        } catch (error) {
            console.error(`OmnichannelChatSDK/uploadFileAttachment/error: ${error}`);

            this.scenarioMarker.failScenario(TelemetryEvent.UploadFileAttachment, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });

            return error;
        }
    }

    public async downloadFileAttachment(fileMetadata: IFileMetadata): Promise<Blob> {
        this.scenarioMarker.startScenario(TelemetryEvent.DownloadFileAttachment, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        })

        try {
            const downloadedFile = await this.conversation!.downloadFile(fileMetadata);
            this.scenarioMarker.completeScenario(TelemetryEvent.DownloadFileAttachment, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });
            return downloadedFile;
        } catch (error) {
            console.error(`OmnichannelChatSDK/downloadFileAttachment/error: ${error}`);
            this.scenarioMarker.failScenario(TelemetryEvent.DownloadFileAttachment, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });
            throw new Error('DownloadFileAttachmentFailed');
        }
    }

    public async emailLiveChatTranscript(body: IChatTranscriptBody): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        const emailTranscriptOptionalParams: IEmailTranscriptOptionalParams = {};

        this.scenarioMarker.startScenario(TelemetryEvent.EmailLiveChatTranscript, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        try {

            if (this.authenticatedUserToken) {
                emailTranscriptOptionalParams.authenticatedUserToken = this.authenticatedUserToken;
            }
            const emailRequestBody = {
                ChatId: this.chatToken.chatId,
                EmailAddress: body.emailAddress,
                DefaultAttachmentMessage: body.attachmentMessage,
                CustomerLocale: body.locale
            };

            const emailResponse = this.OCClient.emailTranscript(
                this.requestId,
                this.chatToken.token,
                emailRequestBody,
                emailTranscriptOptionalParams);

            this.scenarioMarker.completeScenario(TelemetryEvent.EmailLiveChatTranscript, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });

            return emailResponse;
        } catch (error) {
            console.error(`OmnichannelChatSDK/emailLiveChatTranscript/error: ${error}`);
            this.scenarioMarker.failScenario(TelemetryEvent.EmailLiveChatTranscript, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });
        }
    }

    public async getLiveChatTranscript(): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        const getChatTranscriptOptionalParams: IGetChatTranscriptsOptionalParams = {};

        this.scenarioMarker.startScenario(TelemetryEvent.GetLiveChatTranscript, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        try {
            if (this.authenticatedUserToken) {
                getChatTranscriptOptionalParams.authenticatedUserToken = this.authenticatedUserToken;
            }

            const transcriptResponse = this.OCClient.getChatTranscripts(
                this.requestId,
                this.chatToken.chatId,
                this.chatToken.token,
                getChatTranscriptOptionalParams);

            this.scenarioMarker.completeScenario(TelemetryEvent.GetLiveChatTranscript, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });

            return transcriptResponse;
        } catch (error) {
            this.scenarioMarker.failScenario(TelemetryEvent.GetLiveChatTranscript, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });
        }
    }

    public async createChatAdapter(protocol: string = ChatAdapterProtocols.IC3): Promise<unknown> {
        if (platform.isNode() || platform.isReactNative()) {
            return Promise.reject('ChatAdapter is only supported on browser');
        }

        if (protocol !== ChatAdapterProtocols.IC3) {
            return Promise.reject(`ChatAdapter for protocol ${protocol} currently not supported`);
        }

        return new Promise (async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
            const ic3AdapterCDNUrl = this.resolveChatAdapterUrl(protocol);
            this.telemetry?.setCDNPackages({
                IC3Adapter: ic3AdapterCDNUrl
            });

            this.scenarioMarker.startScenario(TelemetryEvent.CreateIC3Adapter);

            await loadScript(ic3AdapterCDNUrl, () => {
                /* istanbul ignore next */
                this.debug && console.debug('IC3Adapter loaded!');
                const adapterConfig: IIC3AdapterOptions = {
                    chatToken: this.chatToken,
                    userDisplayName: 'Customer',
                    userId: 'teamsvisitor',
                    sdkURL: this.resolveIC3ClientUrl(),
                    sdk: this.IC3Client
                };

                const adapter = new window.Microsoft.BotFramework.WebChat.IC3Adapter(adapterConfig);

                this.scenarioMarker.completeScenario(TelemetryEvent.CreateIC3Adapter);

                resolve(adapter);
            }, () => {
                this.scenarioMarker.failScenario(TelemetryEvent.CreateIC3Adapter);
                reject('Failed to load IC3Adapter');
            });
        });
    }

    public async getVoiceVideoCalling(params: any = {}): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (platform.isNode() || platform.isReactNative()) {
            return Promise.reject('VoiceVideoCalling is only supported on browser');
        }

        if (this.callingOption.toString() === CallingOptionsOptionSetNumber.NoCalling.toString()) {
            return Promise.reject('Voice and video call is not enabled');
        }

        const chatConfig = await this.getChatConfig();
        const {LiveWSAndLiveChatEngJoin: liveWSAndLiveChatEngJoin} = chatConfig;
        const {msdyn_widgetsnippet} = liveWSAndLiveChatEngJoin;

        // Find src attribute with its url in code snippet
        const widgetSnippetSourceRegex = new RegExp(`src="(https:\\/\\/[\\w-.]+)[\\w-.\\/]+"`);
        const result = msdyn_widgetsnippet.match(widgetSnippetSourceRegex);
        if (result && result.length) {
            return new Promise (async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
                const spoolSDKCDNUrl = `${result[1]}/livechatwidget/WebChatControl/lib/spool-sdk/sdk.bundle.js`;

                this.telemetry?.setCDNPackages({
                    SpoolSDK: spoolSDKCDNUrl
                });

                this.scenarioMarker.startScenario(TelemetryEvent.GetVoiceVideoCalling);

                await loadScript(spoolSDKCDNUrl, () => {
                    /* istanbul ignore next */
                    this.debug && console.debug(`${spoolSDKCDNUrl} loaded!`);
                }, () => {
                    const exceptionDetails = {
                        response: "SpoolSDKLoadFailed"
                    };

                    this.scenarioMarker.failScenario(TelemetryEvent.GetVoiceVideoCalling, {
                        ExceptionDetails: JSON.stringify(exceptionDetails)
                    });

                    reject('Failed to load SpoolSDK');
                });

                const LiveChatWidgetLibCDNUrl = `${result[1]}/livechatwidget/WebChatControl/lib/LiveChatWidgetLibs.min.js`;

                this.telemetry?.setCDNPackages({
                    VoiceVideoCalling: LiveChatWidgetLibCDNUrl
                });

                await loadScript(LiveChatWidgetLibCDNUrl, async () => {
                    this.debug && console.debug(`${LiveChatWidgetLibCDNUrl} loaded!`);
                    const VoiceVideoCalling = await createVoiceVideoCalling(params);

                    this.scenarioMarker.completeScenario(TelemetryEvent.GetVoiceVideoCalling);

                    VoiceVideoCalling.useScenarioMarker(this.scenarioMarker);

                    resolve(VoiceVideoCalling);
                }, async () => {
                    const exceptionDetails = {
                        response: "VoiceVideoCallingLoadFailed"
                    };

                    this.scenarioMarker.failScenario(TelemetryEvent.GetVoiceVideoCalling, {
                        ExceptionDetails: JSON.stringify(exceptionDetails)
                    });

                    reject('Failed to load VoiceVideoCalling');
                });
            });
        }
    }

    private async getIC3Client() {
        if (platform.isNode() || platform.isReactNative()) {
            this.debug && console.debug('IC3Core');
            this.scenarioMarker.startScenario(TelemetryEvent.GetIC3Client);

            // Use FramelessBridge from IC3Core
            this.IC3SDKProvider = IC3SDKProvider;
            const IC3Client = await IC3SDKProvider.getSDK({
                hostType: HostType.Page,
                protocolType: ProtocolType.IC3V1SDK
            });

            IC3Client.setDebug(this.debug);

            this.scenarioMarker.completeScenario(TelemetryEvent.GetIC3Client);

            return IC3Client;
        } else {
            /* istanbul ignore next */
            this.debug && console.debug('IC3Client');
            // Use IC3Client if browser is detected
            return new Promise (async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
                const ic3ClientCDNUrl = this.resolveIC3ClientUrl();

                this.telemetry?.setCDNPackages({
                    IC3Client: ic3ClientCDNUrl
                });

                this.scenarioMarker.startScenario(TelemetryEvent.GetIC3Client);

                window.addEventListener("ic3:sdk:load", async () => {
                    // Use FramedBridge from IC3Client
                    /* istanbul ignore next */
                    this.debug && console.debug('ic3:sdk:load');
                    const {SDK: ic3sdk} = window.Microsoft.CRM.Omnichannel.IC3Client;
                    const {SDKProvider: IC3SDKProvider} = ic3sdk;
                    this.IC3SDKProvider = IC3SDKProvider;
                    const IC3Client = await IC3SDKProvider.getSDK({
                        hostType: HostType.IFrame,
                        protocolType: ProtocolType.IC3V1SDK,
                        logger: this.ic3ClientLogger
                    });

                    this.scenarioMarker.completeScenario(TelemetryEvent.GetIC3Client);

                    resolve(IC3Client);
                });

                await loadScript(ic3ClientCDNUrl, () => {
                    /* istanbul ignore next */
                    this.debug && console.debug('IC3Client loaded!');
                }, () => {
                    const exceptionDetails = {
                        response: "IC3ClientLoadFailed"
                    };

                    this.scenarioMarker.failScenario(TelemetryEvent.GetIC3Client, {
                        ExceptionDetails: JSON.stringify(exceptionDetails)
                    });

                    reject('Failed to load IC3Client');
                });
            });
        }
    }

    private async getChatConfig(): Promise<IChatConfig> {
        try {
            const liveChatConfig = await this.OCClient.getChatConfig();
            const {
                DataMaskingInfo: dataMaskingConfig,
                LiveChatConfigAuthSettings: authSettings,
                LiveWSAndLiveChatEngJoin: liveWSAndLiveChatEngJoin
            } = liveChatConfig;

            const {setting} = dataMaskingConfig;
            if (setting.msdyn_maskforcustomer) {
                this.dataMaskingRules = dataMaskingConfig.dataMaskingRules;
            }

            if (authSettings) {
                this.authSettings = authSettings;
            }

            const {PreChatSurvey: preChatSurvey, msdyn_prechatenabled, msdyn_callingoptions, msdyn_conversationmode, msdyn_enablechatreconnect} = liveWSAndLiveChatEngJoin;
            const isPreChatEnabled = msdyn_prechatenabled === true || msdyn_prechatenabled == "true";

            if (this.authSettings) {
                this.isAuthenticated = true;
            } 

            if (msdyn_enablechatreconnect && !this.isPersistentChat) { 
                this.isChatReconnect = true;
            }

            if (msdyn_conversationmode?.toString() === ConversationMode.PersistentChat.toString()) {
                this.isPersistentChat = true;
            }

            if (isPreChatEnabled && preChatSurvey && preChatSurvey.trim().length > 0) {
                this.preChatSurvey = preChatSurvey;
            }

            if (this.authSettings){
                if (this.chatSDKConfig.getAuthToken){
                    this.debug && console.log("OmnichannelChatSDK/getChatConfig/auth settings with auth and getAuthToken!", this.authSettings, this.chatSDKConfig.getAuthToken);
                    const token = await this.chatSDKConfig.getAuthToken();
                    if (token) {
                        this.authenticatedUserToken = token;
                    }
                    else {
                        console.warn("OmnichannelChatSDK/getChatConfig/auth, chat requires auth, but getAuthToken() returned null");
                    }
                }
                else {
                    console.warn("OmnichannelChatSDK/getChatConfig/auth, chat requires auth, but getAuthToken() is missing");
                }
            }

            if (this.preChatSurvey) {
                /* istanbul ignore next */
                this.debug && console.log('Prechat Survey!');
            }

            this.callingOption = msdyn_callingoptions;
            this.liveChatConfig = liveChatConfig;
            return this.liveChatConfig;
        } catch (error) {
            console.error(`OmnichannelChatSDK/getChatConfig/error ${error}`);
            return error;
        }
    }

    private resolveIC3ClientUrl(): string {
        if (this.chatSDKConfig.ic3Config && 'ic3ClientCDNUrl' in this.chatSDKConfig.ic3Config) {
            return this.chatSDKConfig.ic3Config.ic3ClientCDNUrl as string;
        }

        if (this.chatSDKConfig.ic3Config && 'ic3ClientVersion' in this.chatSDKConfig.ic3Config) {
            return libraries.getIC3ClientCDNUrl(this.chatSDKConfig.ic3Config.ic3ClientVersion);
        }

        return libraries.getIC3ClientCDNUrl();
    }

    private resolveChatAdapterUrl(protocol: string): string {
        if (protocol !== ChatAdapterProtocols.IC3) {
            throw new Error(`ChatAdapter for protocol ${protocol} currently not supported`);
        }

        if (this.chatSDKConfig.chatAdapterConfig && 'webChatIC3AdapterCDNUrl' in this.chatSDKConfig.chatAdapterConfig) {
            return this.chatSDKConfig.chatAdapterConfig.webChatIC3AdapterCDNUrl as string;
        }

        if (this.chatSDKConfig.chatAdapterConfig && 'webChatIC3AdapterVersion' in this.chatSDKConfig.chatAdapterConfig) {
            return libraries.getIC3AdapterCDNUrl(this.chatSDKConfig.chatAdapterConfig.webChatIC3AdapterVersion);
        }

        return libraries.getIC3AdapterCDNUrl();
    }

    private async updateChatToken(newToken: string, newRegionGTMS: IRegionGtms): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.UpdateChatToken, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        })

        try {
            const sessionInfo: IInitializationInfo = {
                token: newToken,
                regionGtms: newRegionGTMS,
                visitor: true
            }

            await this.IC3Client.initialize(sessionInfo);
            
            this.scenarioMarker.completeScenario(TelemetryEvent.UpdateChatToken, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            })
        } catch (error) {
            const exceptionDetails = {
                response: "UpdateChatTokenFailed"
            }

            this.scenarioMarker.failScenario(TelemetryEvent.UpdateChatToken, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string,
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            console.error(`OmnichannelChatSDK/updateChatToken/error ${error}`);
        }
    }
}

export default OmnichannelChatSDK;