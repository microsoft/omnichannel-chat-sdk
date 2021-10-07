/* eslint-disable @typescript-eslint/no-non-null-assertion */

import ACSClient, { ACSConversation } from "./core/messaging/ACSClient";
import ACSParticipantDisplayName from "./core/messaging/ACSParticipantDisplayName";
import AMSFileManager from "./external/ACSAdapter/AMSFileManager";
import AriaTelemetry from "./telemetry/AriaTelemetry";
import AuthSettings from "./core/AuthSettings";
import CallingOptionsOptionSetNumber from "./core/CallingOptionsOptionSetNumber";
import ChatAdapterProtocols from "./core/messaging/ChatAdapterProtocols";
import ChatConfig from "./core/ChatConfig";
import ChatReconnectContext from "./core/ChatReconnectContext";
import ChatReconnectOptionalParams from "./core/ChatReconnectOptionalParams";
import ChatSDKConfig from "./core/ChatSDKConfig";
import ChatSDKMessage from "./core/messaging/ChatSDKMessage";
import ChatTranscriptBody from "./core/ChatTranscriptBody";
import { ChatMessageReceivedEvent, ParticipantsRemovedEvent } from '@azure/communication-signaling';
import ConversationMode from "./core/ConversationMode";
import createAMSClient from "@microsoft/omnichannel-amsclient";
import { ACSAdapterLogger, ACSClientLogger, createACSAdapterLogger, createACSClientLogger, createIC3ClientLogger, createOCSDKLogger, IC3ClientLogger, OCSDKLogger } from "./utils/loggers";
import createOmnichannelMessage from "./utils/createOmnichannelMessage";
import createTelemetry from "./utils/createTelemetry";
import createVoiceVideoCalling from "./api/createVoiceVideoCalling";
import { defaultMessageTags } from "./core/messaging/MessageTags";
import DeliveryMode from "@microsoft/omnichannel-ic3core/lib/model/DeliveryMode";
import FileSharingProtocolType from "@microsoft/omnichannel-ic3core/lib/model/FileSharingProtocolType";
import FileMetadata from "@microsoft/omnichannel-amsclient/lib/FileMetadata";
import FramedClient from "@microsoft/omnichannel-amsclient/lib/FramedClient";
import FramedlessClient from "@microsoft/omnichannel-amsclient/lib/FramedlessClient";
import HostType from "@microsoft/omnichannel-ic3core/lib/interfaces/HostType";
import IConversation from "@microsoft/omnichannel-ic3core/lib/model/IConversation";
import IChatToken from "./external/IC3Adapter/IChatToken";
import IEmailTranscriptOptionalParams from "@microsoft/ocsdk/lib/Interfaces/IEmailTranscriptOptionalParams";
import IFileInfo from "@microsoft/omnichannel-ic3core/lib/interfaces/IFileInfo";
import IFileMetadata from "@microsoft/omnichannel-ic3core/lib/model/IFileMetadata";
import IGetChatTokenOptionalParams from "@microsoft/ocsdk/lib/Interfaces/IGetChatTokenOptionalParams";
import IGetChatTranscriptsOptionalParams from "@microsoft/ocsdk/lib/Interfaces/IGetChatTranscriptsOptionalParams";
import IIC3AdapterOptions from "./external/IC3Adapter/IIC3AdapterOptions";
import IInitializationInfo from "@microsoft/omnichannel-ic3core/lib/model/IInitializationInfo";
import IMessage from "@microsoft/omnichannel-ic3core/lib/model/IMessage";
import InitContext from "@microsoft/ocsdk/lib/Model/InitContext";
import ISDKConfiguration from "@microsoft/ocsdk/lib/Interfaces/ISDKConfiguration";
import ISessionCloseOptionalParams from "@microsoft/ocsdk/lib/Interfaces/ISessionCloseOptionalParams";
import ISessionInitOptionalParams from "@microsoft/ocsdk/lib/Interfaces/ISessionInitOptionalParams";
import OmnichannelConfig from "./core/OmnichannelConfig";
import IOmnichannelConfiguration from "@microsoft/ocsdk/lib/Interfaces/IOmnichannelConfiguration";
import IPerson from "@microsoft/omnichannel-ic3core/lib/model/IPerson";
import IRawMessage from "@microsoft/omnichannel-ic3core/lib/model/IRawMessage";
import IRawThread from "@microsoft/omnichannel-ic3core/lib/interfaces/IRawThread";
import IReconnectableChatsParams from "@microsoft/ocsdk/lib/Interfaces/IReconnectableChatsParams";
import IRegionGtms from "@microsoft/omnichannel-ic3core/lib/model/IRegionGtms";
import {isCustomerMessage} from "./utils/utilities";
import libraries from "./utils/libraries";
import LiveChatContext from "./core/LiveChatContext";
import LiveWorkItemDetails from "./core/LiveWorkItemDetails";
import LiveWorkItemState from "./core/LiveWorkItemState";
import LiveChatVersion from "./core/LiveChatVersion";
import { loadScript } from "./utils/WebUtils";
import MessageContentType from "@microsoft/omnichannel-ic3core/lib/model/MessageContentType";
import MessageType from "@microsoft/omnichannel-ic3core/lib/model/MessageType";
import OnNewMessageOptionalParams from "./core/messaging/OnNewMessageOptionalParams";
import OmnichannelChatToken from "@microsoft/omnichannel-amsclient/lib/OmnichannelChatToken";
import OmnichannelMessage from "./core/messaging/OmnichannelMessage";
import PersonType from "@microsoft/omnichannel-ic3core/lib/model/PersonType";
import platform, { isBrowser } from "./utils/platform";
import ProtocolType from "@microsoft/omnichannel-ic3core/lib/interfaces/ProtocoleType";
import ScenarioMarker from "./telemetry/ScenarioMarker";
import {SDKProvider as OCSDKProvider, uuidv4 } from "@microsoft/ocsdk";
import {SDKProvider as IC3SDKProvider} from '@microsoft/omnichannel-ic3core';
import StartChatOptionalParams from "./core/StartChatOptionalParams";
import TelemetryEvent from "./telemetry/TelemetryEvent";
import validateOmnichannelConfig from "./validators/OmnichannelConfigValidator";
import validateSDKConfig, {defaultChatSDKConfig} from "./validators/SDKConfigValidators";

class OmnichannelChatSDK {
    private debug: boolean;
    public OCSDKProvider: unknown;
    public IC3SDKProvider: unknown;
    public OCClient: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    public IC3Client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    public ACSClient: ACSClient | null = null;
    public AMSClient: FramedClient | FramedlessClient | null = null;
    public omnichannelConfig: OmnichannelConfig;
    public chatSDKConfig: ChatSDKConfig;
    public isInitialized: boolean;
    public requestId: string;
    private chatToken: IChatToken;
    private liveChatConfig: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private liveChatVersion: number;
    private dataMaskingRules: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private authSettings: AuthSettings | null = null;
    private authenticatedUserToken: string | null = null;
    private preChatSurvey: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private conversation: IConversation | ACSConversation | null = null;
    private callingOption: CallingOptionsOptionSetNumber = CallingOptionsOptionSetNumber.NoCalling;
    private telemetry: typeof AriaTelemetry | null = null;
    private scenarioMarker: ScenarioMarker;
    private ic3ClientLogger: IC3ClientLogger | null = null;
    private ocSdkLogger: OCSDKLogger | null = null;
    private acsClientLogger: ACSClientLogger | null = null;
    private acsAdapterLogger: ACSAdapterLogger | null = null;
    private isPersistentChat = false;
    private isChatReconnect = false;
    private reconnectId: null | string = null;
    private refreshTokenTimer: number | null = null;

    constructor(omnichannelConfig: OmnichannelConfig, chatSDKConfig: ChatSDKConfig = defaultChatSDKConfig) {
        this.debug = false;
        this.omnichannelConfig = omnichannelConfig;
        this.chatSDKConfig = {
            ...defaultChatSDKConfig,
            ...chatSDKConfig // overrides
        };
        this.isInitialized = false;
        this.liveChatVersion = LiveChatVersion.V1;
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
        this.acsClientLogger = createACSClientLogger(this.omnichannelConfig);
        this.acsAdapterLogger = createACSAdapterLogger(this.omnichannelConfig);

        this.scenarioMarker.useTelemetry(this.telemetry);
        this.ic3ClientLogger.useTelemetry(this.telemetry);
        this.ocSdkLogger.useTelemetry(this.telemetry);
        this.acsClientLogger.useTelemetry(this.telemetry);
        this.acsAdapterLogger.useTelemetry(this.telemetry);

        validateOmnichannelConfig(omnichannelConfig);
        validateSDKConfig(chatSDKConfig);

        this.chatSDKConfig.telemetry?.disable && this.telemetry?.disable();

        if (this.chatSDKConfig.telemetry?.ariaTelemetryKey) {
            this.telemetry.initialize(this.chatSDKConfig.telemetry.ariaTelemetryKey);
        }

        this.ic3ClientLogger?.setRequestId(this.requestId);
        this.ocSdkLogger?.setRequestId(this.requestId);
        this.acsClientLogger?.setRequestId(this.requestId);
        this.acsAdapterLogger?.setRequestId(this.requestId);
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
        this.AMSClient?.setDebug(flag);
        this.telemetry?.setDebug(flag);
        this.scenarioMarker.setDebug(flag);
        this.ic3ClientLogger?.setDebug(flag);
        this.ocSdkLogger?.setDebug(flag);
        this.acsClientLogger?.setDebug(flag);
        this.acsAdapterLogger?.setDebug(flag);
    }

    public async initialize(): Promise<ChatConfig> {
        this.scenarioMarker.startScenario(TelemetryEvent.InitializeChatSDK);

        if (this.isInitialized) {
            this.scenarioMarker.completeScenario(TelemetryEvent.InitializeChatSDK);
            return this.liveChatConfig;
        }

        try {
            this.OCSDKProvider = OCSDKProvider;
            this.OCClient = await OCSDKProvider.getSDK(this.omnichannelConfig as IOmnichannelConfiguration, {} as ISDKConfiguration, this.ocSdkLogger as OCSDKLogger);

            await this.getChatConfig();

            if (this.liveChatVersion === LiveChatVersion.V2) {
                this.ACSClient = new ACSClient(this.acsClientLogger);
                this.AMSClient = await createAMSClient({
                    framedMode: isBrowser(),
                    debug: false,
                    logger: undefined
                });
            } else {
                this.IC3Client = await this.getIC3Client();
            }

            this.isInitialized = true;

            this.scenarioMarker.completeScenario(TelemetryEvent.InitializeChatSDK);
        } catch {
            this.scenarioMarker.failScenario(TelemetryEvent.InitializeChatSDK);
        }

        return this.liveChatConfig;
    }

    public async getChatReconnectContext(optionalParams: ChatReconnectOptionalParams = {}):  Promise<ChatReconnectContext> {
        this.scenarioMarker.startScenario(TelemetryEvent.GetChatReconnectContext, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        })

        const context: ChatReconnectContext = {
            reconnectId: null,
            redirectURL: null
        }

        if (this.authenticatedUserToken) {
            try {
                const reconnectableChatsParams: IReconnectableChatsParams = {
                    authenticatedUserToken: this.authenticatedUserToken as string
                }

                const reconnectableChatsResponse = await this.OCClient.getReconnectableChats(reconnectableChatsParams);

                if (reconnectableChatsResponse && reconnectableChatsResponse.reconnectid) {
                    context.reconnectId = reconnectableChatsResponse.reconnectid as string
                }

                this.scenarioMarker.completeScenario(TelemetryEvent.GetChatReconnectContext, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                })
            } catch (error) {
                const exceptionDetails = {
                    response: "OCClientGetReconnectableChatsFailed"
                }

                this.scenarioMarker.failScenario(TelemetryEvent.GetChatReconnectContext, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                console.error(`OmnichannelChatSDK/GetChatReconnectContext/error ${error}`);
            }
        } else {
            if (optionalParams.reconnectId) {
                try {
                    const reconnectAvailabilityResponse = await this.OCClient.getReconnectAvailability(optionalParams.reconnectId);

                    if (reconnectAvailabilityResponse && !reconnectAvailabilityResponse.isReconnectAvailable) {
                        if (reconnectAvailabilityResponse.reconnectRedirectionURL) {
                            context.redirectURL = reconnectAvailabilityResponse.reconnectRedirectionURL as string;
                        }
                    } else {
                        context.reconnectId = optionalParams.reconnectId as string;
                    }

                    this.scenarioMarker.completeScenario(TelemetryEvent.GetChatReconnectContext, {
                        RequestId: this.requestId,
                        ChatId: this.chatToken.chatId as string
                    })
                } catch (error) {
                    const exceptionDetails = {
                        response: "OCClientGetReconnectAvailabilityFailed"
                    }

                    this.scenarioMarker.failScenario(TelemetryEvent.GetChatReconnectContext, {
                        RequestId: this.requestId,
                        ChatId: this.chatToken.chatId as string,
                        ExceptionDetails: JSON.stringify(exceptionDetails)
                    });

                    console.error(`OmnichannelChatSDK/GetChatReconnectContext/error ${error}`);
                }
            }
        }

        return context
    }

    public async startChat(optionalParams: StartChatOptionalParams = {}): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.StartChat, {
            RequestId: this.requestId
        });

        if (this.isChatReconnect && !this.chatSDKConfig.chatReconnect?.disable && !this.isPersistentChat && optionalParams.reconnectId) {
            this.reconnectId = optionalParams.reconnectId as string;
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
        this.acsClientLogger?.setChatId(this.chatToken.chatId || '');
        this.acsAdapterLogger?.setChatId(this.chatToken.chatId || '');

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

        if (this.liveChatVersion === LiveChatVersion.V2) {
            const chatAdapterConfig = {
                token: this.chatToken.token,
                id: this.chatToken.visitorId || 'teamsvisitor',
                threadId: this.chatToken.chatId,
                environmentUrl: this.chatToken.acsEndpoint as string,
                pollingInterval: 1000
            };

            try {
                await this.ACSClient?.initialize({
                    token: chatAdapterConfig.token as string,
                    environmentUrl: chatAdapterConfig.environmentUrl
                });
            } catch (error) {
                const exceptionDetails = {
                    response: "ACSClientInitializeFailed"
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
                this.conversation = await this.ACSClient?.joinConversation({
                    id: chatAdapterConfig.id,
                    threadId: chatAdapterConfig.threadId as string,
                    pollingInterval: chatAdapterConfig.pollingInterval
                }) as ACSConversation;

                this.scenarioMarker.completeScenario(TelemetryEvent.StartChat, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            } catch (error) {
                const exceptionDetails = {
                    response: "ACSClientJoinConversationFailed"
                };

                this.scenarioMarker.failScenario(TelemetryEvent.StartChat, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                console.error(`OmnichannelChatSDK/startChat/joinConversation/error ${error}`);
                throw Error(exceptionDetails.response);
            }

            try {
                await this.AMSClient?.initialize({
                    chatToken: this.chatToken as OmnichannelChatToken
                });
            } catch (error) {
                const exceptionDetails = {
                    response: "AMSClientInitializeFailed"
                };

                this.scenarioMarker.failScenario(TelemetryEvent.StartChat, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                throw Error(exceptionDetails.response);
            }
        } else {
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

            this.conversation?.disconnect();
            this.conversation = null;
            this.requestId = uuidv4();
            this.chatToken = {};
            this.reconnectId = null;

            this.ic3ClientLogger?.setRequestId(this.requestId);
            this.ic3ClientLogger?.setChatId('');

            this.ocSdkLogger?.setRequestId(this.requestId);
            this.ocSdkLogger?.setChatId('');

            this.acsClientLogger?.setRequestId(this.requestId);
            this.acsClientLogger?.setChatId('');

            this.acsAdapterLogger?.setRequestId(this.requestId);
            this.acsAdapterLogger?.setChatId('');
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

    public async getCurrentLiveChatContext(): Promise<LiveChatContext | {}> {
        const chatToken = await this.getChatToken();
        const {requestId} = this;

        this.scenarioMarker.startScenario(TelemetryEvent.GetCurrentLiveChatContext, {
            RequestId: requestId,
            ChatId: chatToken.chatId as string
        })

        const chatSession: LiveChatContext = {
            chatToken,
            requestId
        }

        if (Object.keys(chatSession.chatToken).length === 0) {
            return {};
        }

        this.scenarioMarker.completeScenario(TelemetryEvent.GetCurrentLiveChatContext, {
            RequestId: requestId,
            ChatId: chatToken.chatId as string
        });

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
        this.scenarioMarker.startScenario(TelemetryEvent.GetPreChatSurvey);
        try {
            const result = parse? JSON.parse(this.preChatSurvey): this.preChatSurvey;
            this.scenarioMarker.completeScenario(TelemetryEvent.GetPreChatSurvey);
            return result;
        } catch {
            this.scenarioMarker.failScenario(TelemetryEvent.GetPreChatSurvey);
        }
    }

    public async getLiveChatConfig(cached = true): Promise<ChatConfig> {
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
                const {ChatId: chatId, Token: token, RegionGtms: regionGtms, ExpiresIn: expiresIn, VisitorId: visitorId, VoiceVideoCallToken: voiceVideoCallToken, ACSEndpoint: acsEndpoint, AttachmentConfiguration: attachmentConfiguration} = chatToken;
                this.chatToken = {
                    chatId,
                    regionGTMS: JSON.parse(regionGtms),
                    requestId: this.requestId,
                    token,
                    expiresIn,
                    visitorId,
                    voiceVideoCallToken,
                    acsEndpoint,
                };

                if (attachmentConfiguration && attachmentConfiguration.AttachmentServiceEndpoint) {
                    this.chatToken.amsEndpoint = attachmentConfiguration.AttachmentServiceEndpoint;
                }

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
            /* istanbul ignore next */
            this.debug && console.log(`calling:acs`);
            return this.chatToken.voiceVideoCallToken.Token;
        } else {
            /* istanbul ignore next */
            this.debug && console.log(`calling:skype`);
            return this.chatToken.token as string;
        }
    }

    public async getMessages(): Promise<IMessage[] | OmnichannelMessage[] | undefined> {
        this.scenarioMarker.startScenario(TelemetryEvent.GetMessages, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        try {
            const messages = await (this.conversation as (IConversation | ACSConversation))?.getMessages();

            this.scenarioMarker.completeScenario(TelemetryEvent.GetMessages, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });

            return messages;
        } catch {
            this.scenarioMarker.failScenario(TelemetryEvent.GetMessages, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });
        }
    }

    public async getDataMaskingRules(): Promise<any> {  // eslint-disable-line  @typescript-eslint/no-explicit-any
        return this.dataMaskingRules;
    }

    public async sendMessage(message: ChatSDKMessage): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.SendMessages, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

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

        if (this.liveChatVersion === LiveChatVersion.V2) {
            const sendMessageRequest = {
                content: message.content,
            }

            try {
                await (this.conversation as ACSConversation)?.sendMessage(sendMessageRequest);

                this.scenarioMarker.completeScenario(TelemetryEvent.SendMessages, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            } catch (error) {
                this.scenarioMarker.failScenario(TelemetryEvent.SendMessages, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });

                throw new Error('ChatSDKSendMessageFailed');
            }
        } else {
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

            try {
                await (this.conversation as IConversation).sendMessage(messageToSend);

                this.scenarioMarker.completeScenario(TelemetryEvent.SendMessages, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            } catch {
                this.scenarioMarker.failScenario(TelemetryEvent.SendMessages, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });

                throw new Error('ChatSDKSendMessageFailed');
            }
        }
    }

    public async onNewMessage(onNewMessageCallback: CallableFunction, optionalParams: OnNewMessageOptionalParams | unknown = {}): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.OnNewMessage, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        if (this.liveChatVersion === LiveChatVersion.V2) {
            const postedMessages = new Set();

            if ((optionalParams as OnNewMessageOptionalParams).rehydrate) {
                this.debug && console.log('[OmnichannelChatSDK][onNewMessage] rehydrate');
                const messages = await this.getMessages() as OmnichannelMessage[];
                for (const message of messages.reverse()) {
                    const {id} = message;
                    if (postedMessages.has(id)) {
                      continue;
                    }

                    postedMessages.add(id);
                    onNewMessageCallback(message);
                }
            }

            try {
                (this.conversation as ACSConversation)?.registerOnNewMessage((event: ChatMessageReceivedEvent) => {
                    const {id} = event;

                    const omnichannelMessage = createOmnichannelMessage(event, {
                        liveChatVersion: this.liveChatVersion,
                        debug: this.debug
                    });

                    if (!postedMessages.has(id)) {
                        onNewMessageCallback(omnichannelMessage);
                        postedMessages.add(id);
                    }
                });

                this.scenarioMarker.completeScenario(TelemetryEvent.OnNewMessage, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            } catch {
                this.scenarioMarker.failScenario(TelemetryEvent.OnNewMessage, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            }
        } else {
            const postedMessages = new Set();

            if ((optionalParams as OnNewMessageOptionalParams).rehydrate) {
                this.debug && console.log('[OmnichannelChatSDK][onNewMessage] rehydrate');
                const messages = await this.getMessages() as IRawMessage[];
                if (messages) {
                    for (const message of messages.reverse()) {
                        const {clientmessageid} = message;

                        if (postedMessages.has(clientmessageid)) {
                            continue;
                        }

                        postedMessages.add(clientmessageid);

                        const omnichannelMessage = createOmnichannelMessage(message as IRawMessage, {
                            liveChatVersion: this.liveChatVersion,
                            debug: this.debug
                        });

                        onNewMessageCallback(omnichannelMessage);
                    }
                }
            }

            try {
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
                        const omnichannelMessage = createOmnichannelMessage(message as IRawMessage, {
                            liveChatVersion: this.liveChatVersion,
                            debug: this.debug
                        });

                        onNewMessageCallback(omnichannelMessage);
                    }
                });

                this.scenarioMarker.completeScenario(TelemetryEvent.OnNewMessage, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            } catch {
                this.scenarioMarker.failScenario(TelemetryEvent.OnNewMessage, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            }
        }
    }

    public async sendTypingEvent(): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.SendTypingEvent, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        if (this.liveChatVersion === LiveChatVersion.V2) {
            try {
                await this.OCClient.sendTypingIndicator(this.requestId, LiveChatVersion.V2, {
                    customerDisplayName: ACSParticipantDisplayName.Customer
                });

                await (this.conversation as ACSConversation).sendTyping();

                this.scenarioMarker.completeScenario(TelemetryEvent.SendTypingEvent, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            } catch (error) {
                this.scenarioMarker.failScenario(TelemetryEvent.SendTypingEvent, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });

                throw new Error('OCClientSendTypingFailed');
            }
        } else {
            const typingPayload = `{isTyping: 0}`;

            try {
                await (this.conversation as IConversation)!.indicateTypingStatus(0);
                const members: IPerson[] = await (this.conversation as IConversation)!.getMembers();
                const botMembers = members.filter((member: IPerson) => member.type === PersonType.Bot);
                await (this.conversation as IConversation)!.sendMessageToBot(botMembers[0].id, {payload: typingPayload});

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
    }

    public async onTypingEvent(onTypingEventCallback: CallableFunction): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.OnTypingEvent, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        if (this.liveChatVersion === LiveChatVersion.V2) {
            try {
                (this.conversation as ACSConversation).onTypingEvent(onTypingEventCallback);

                this.scenarioMarker.completeScenario(TelemetryEvent.OnTypingEvent, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            } catch {
                this.scenarioMarker.failScenario(TelemetryEvent.OnTypingEvent, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            }
        } else {
            try {
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

                this.scenarioMarker.completeScenario(TelemetryEvent.OnTypingEvent, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            } catch {
                this.scenarioMarker.failScenario(TelemetryEvent.OnTypingEvent, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            }
        }
    }

    public async onAgentEndSession(onAgentEndSessionCallback: (message: IRawThread | ParticipantsRemovedEvent) => void): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.OnAgentEndSession, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        if (this.liveChatVersion === LiveChatVersion.V2) {
            try {
                (this.conversation as ACSConversation).registerOnThreadUpdate((event: ParticipantsRemovedEvent) => {
                    onAgentEndSessionCallback(event);
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
        } else {
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
    }

    public async uploadFileAttachment(fileInfo: IFileInfo | File): Promise<IRawMessage | OmnichannelMessage> {
        this.scenarioMarker.startScenario(TelemetryEvent.UploadFileAttachment, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        if (this.liveChatVersion === LiveChatVersion.V2) {
            const createObjectResponse: any = await this.AMSClient?.createObject(this.chatToken?.chatId as string, fileInfo as any);  // eslint-disable-line @typescript-eslint/no-explicit-any
            const documentId = createObjectResponse.id;
            const uploadDocumentResponse: any = await this.AMSClient?.uploadDocument(documentId, fileInfo as any);  // eslint-disable-line @typescript-eslint/no-explicit-any

            const fileIdsProperty = {
                amsReferences: JSON.stringify([documentId])
            };

            const fileMetaProperty = {
                amsMetadata: JSON.stringify([{
                    contentType: fileInfo.type,
                    fileName: fileInfo.name
                }])
            }

            const sendMessageRequest = {
                content: '',
                metadata:  {
                    ...fileIdsProperty,
                    ...fileMetaProperty
                }
            };

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
                fileMetadata: uploadDocumentResponse
            };

            try {
                await (this.conversation as ACSConversation)?.sendMessage(sendMessageRequest);

                this.scenarioMarker.completeScenario(TelemetryEvent.UploadFileAttachment, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });

                return messageToSend;
            } catch (error) {
                console.error("OmnichannelChatSDK/uploadFileAttachment/sendMessage/error");

                this.scenarioMarker.failScenario(TelemetryEvent.UploadFileAttachment, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            }

            return {} as OmnichannelMessage;
        } else {
            let fileMetadata: IFileMetadata;

            if (platform.isReactNative() || platform.isNode()) {
                fileMetadata = await (this.conversation as IConversation)!.sendFileData(fileInfo as IFileInfo, FileSharingProtocolType.AmsBasedFileSharing);
            } else {
                fileMetadata = await (this.conversation as IConversation)!.uploadFile(fileInfo as File, FileSharingProtocolType.AmsBasedFileSharing);
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
    }

    public async downloadFileAttachment(fileMetadata: FileMetadata | IFileMetadata): Promise<Blob> {
        this.scenarioMarker.startScenario(TelemetryEvent.DownloadFileAttachment, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        if (this.liveChatVersion === LiveChatVersion.V2) {
            try {
                const response: any = await this.AMSClient?.getViewStatus(fileMetadata);  // eslint-disable-line @typescript-eslint/no-explicit-any
                const {view_location} = response;
                const viewResponse: any = await this.AMSClient?.getView(fileMetadata, view_location);  // eslint-disable-line @typescript-eslint/no-explicit-any
                this.scenarioMarker.completeScenario(TelemetryEvent.DownloadFileAttachment, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
                return viewResponse;
            } catch {
                this.scenarioMarker.failScenario(TelemetryEvent.DownloadFileAttachment, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
                throw new Error('DownloadFileAttachmentFailed');
            }
        } else {
            try {
                const downloadedFile = await (this.conversation as IConversation)!.downloadFile(fileMetadata as IFileMetadata);
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
    }

    public async emailLiveChatTranscript(body: ChatTranscriptBody): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
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

    public async createChatAdapter(protocol: string | null = null): Promise<unknown> {
        if (platform.isNode() || platform.isReactNative()) {
            return Promise.reject('ChatAdapter is only supported on browser');
        }

        const supportedChatAdapterProtocols = [ChatAdapterProtocols.ACS, ChatAdapterProtocols.IC3];
        if (protocol && !supportedChatAdapterProtocols.includes(protocol as string)) {
            return Promise.reject(`ChatAdapter for protocol ${protocol} currently not supported`);
        }

        if (protocol === ChatAdapterProtocols.ACS || this.liveChatVersion === LiveChatVersion.V2) {
            return new Promise (async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
                const featuresOption = {
                    enableAdaptiveCards: false,
                    enableThreadMemberUpdateNotification: true,
                    enableLeaveThreadOnWindowClosed: false
                };

                const acsAdapterCDNUrl = this.resolveChatAdapterUrl(protocol || ChatAdapterProtocols.ACS);
                this.telemetry?.setCDNPackages({
                    ACSAdapter: acsAdapterCDNUrl
                });

                await loadScript(acsAdapterCDNUrl, () => {
                    /* istanbul ignore next */
                    this.debug && console.debug('ACSAdapter loaded!');
                    try {
                        const { ChatAdapter } = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                        const fileManager = new AMSFileManager(this.AMSClient as FramedClient, this.acsAdapterLogger);
                        const adapter = ChatAdapter.createACSAdapter(
                            this.chatToken.token as string,
                            this.chatToken.visitorId || 'teamsvisitor',
                            this.chatToken.chatId as string,
                            this.chatToken.acsEndpoint as string,
                            fileManager,
                            1000,
                            ACSParticipantDisplayName.Customer,
                            undefined,
                            featuresOption,
                        );

                        resolve(adapter);
                    } catch {
                        throw new Error('Failed to load ACSAdapter');
                    }
                }, () => {
                    reject('Failed to load ACSADapter');
                });
            });
        } else if (protocol === ChatAdapterProtocols.IC3 || this.liveChatVersion === LiveChatVersion.V1) {
            return new Promise (async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
                const ic3AdapterCDNUrl = this.resolveChatAdapterUrl(protocol || ChatAdapterProtocols.IC3);
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
                    adapter.logger = this.ic3ClientLogger;

                    // Keep iframe communication alive to reuse the same IC3Client instance
                    window.Microsoft.BotFramework.WebChat.IC3SDKProvider.disposeSdk = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

                    this.scenarioMarker.completeScenario(TelemetryEvent.CreateIC3Adapter);

                    resolve(adapter);
                }, () => {
                    this.scenarioMarker.failScenario(TelemetryEvent.CreateIC3Adapter);
                    reject('Failed to load IC3Adapter');
                });
            });
        }

        return Promise.reject(`ChatAdapter for protocol ${protocol} currently not supported`);
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
                this.scenarioMarker.startScenario(TelemetryEvent.GetVoiceVideoCalling);

                const LiveChatWidgetLibCDNUrl = `${result[1]}/livechatwidget/WebChatControl/lib/CallingBundle.js`;

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

    private async getChatConfig(): Promise<ChatConfig> {
        try {
            const liveChatConfig = await this.OCClient.getChatConfig();
            const {
                DataMaskingInfo: dataMaskingConfig,
                LiveChatConfigAuthSettings: authSettings,
                LiveWSAndLiveChatEngJoin: liveWSAndLiveChatEngJoin,
                LiveChatVersion: liveChatVersion
            } = liveChatConfig;

            this.liveChatVersion = liveChatVersion || LiveChatVersion.V1;

            /* istanbul ignore next */
            this.debug && console.log(`[OmnichannelChatSDK][getChatConfig][liveChatVersion] ${this.liveChatVersion}`);

            const {setting} = dataMaskingConfig;
            if (setting.msdyn_maskforcustomer) {
                this.dataMaskingRules = dataMaskingConfig.dataMaskingRules;
            }

            if (authSettings) {
                this.authSettings = authSettings;
            }

            const {PreChatSurvey: preChatSurvey, msdyn_prechatenabled, msdyn_callingoptions, msdyn_conversationmode, msdyn_enablechatreconnect} = liveWSAndLiveChatEngJoin;
            const isPreChatEnabled = msdyn_prechatenabled === true || msdyn_prechatenabled == "true";
            const isChatReconnectEnabled = msdyn_enablechatreconnect === true || msdyn_enablechatreconnect == "true";

            if (msdyn_conversationmode?.toString() === ConversationMode.PersistentChat.toString()) {
                this.isPersistentChat = true;
            }

            if (isChatReconnectEnabled && !this.isPersistentChat) {
                this.isChatReconnect = true;
            }

            if (isPreChatEnabled && preChatSurvey && preChatSurvey.trim().length > 0) {
                this.preChatSurvey = preChatSurvey;
            }

            if (this.authSettings) {
                this.scenarioMarker.startScenario(TelemetryEvent.GetAuthToken);
                if (this.chatSDKConfig.getAuthToken) {
                    try {
                        const token = await this.chatSDKConfig.getAuthToken();

                        if (token) {
                            this.authenticatedUserToken = token;
                            this.scenarioMarker.completeScenario(TelemetryEvent.GetAuthToken);
                        } else {
                            const exceptionDetails = {
                                response: "UndefinedAuthToken"
                            };

                            this.scenarioMarker.failScenario(TelemetryEvent.GetAuthToken, {
                                ExceptionDetails: JSON.stringify(exceptionDetails)
                            });
                        }
                    } catch {
                        const exceptionDetails = {
                            response: "GetAuthTokenFailed"
                        };

                        this.scenarioMarker.failScenario(TelemetryEvent.GetAuthToken, {
                            ExceptionDetails: JSON.stringify(exceptionDetails)
                        });
                    }
                } else {
                    const exceptionDetails = {
                        response: "GetAuthTokenNotFound"
                    };

                    this.scenarioMarker.failScenario(TelemetryEvent.GetAuthToken, {
                        ExceptionDetails: JSON.stringify(exceptionDetails)
                    });
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
        const supportedChatAdapterProtocols = [ChatAdapterProtocols.ACS, ChatAdapterProtocols.IC3];
        if (protocol && !supportedChatAdapterProtocols.includes(protocol as string)) {
            throw new Error(`ChatAdapter for protocol ${protocol} currently not supported`);
        }

        if (protocol === ChatAdapterProtocols.ACS || this.liveChatVersion === LiveChatVersion.V2) {
            if (this.chatSDKConfig.chatAdapterConfig && 'webChatACSAdapterCDNUrl' in this.chatSDKConfig.chatAdapterConfig) {
                return this.chatSDKConfig.chatAdapterConfig.webChatACSAdapterCDNUrl as string;
            }

            if (this.chatSDKConfig.chatAdapterConfig && 'webChatACSAdapterVersion' in this.chatSDKConfig.chatAdapterConfig) {
                return libraries.getACSAdapterCDNUrl(this.chatSDKConfig.chatAdapterConfig.webChatACSAdapterVersion);
            }

            return libraries.getACSAdapterCDNUrl();
        } else if (protocol === ChatAdapterProtocols.IC3 || this.liveChatVersion === LiveChatVersion.V1) {
            if (this.chatSDKConfig.chatAdapterConfig && 'webChatIC3AdapterCDNUrl' in this.chatSDKConfig.chatAdapterConfig) {
                return this.chatSDKConfig.chatAdapterConfig.webChatIC3AdapterCDNUrl as string;
            }

            if (this.chatSDKConfig.chatAdapterConfig && 'webChatIC3AdapterVersion' in this.chatSDKConfig.chatAdapterConfig) {
                return libraries.getIC3AdapterCDNUrl(this.chatSDKConfig.chatAdapterConfig.webChatIC3AdapterVersion);
            }

            return libraries.getIC3AdapterCDNUrl();
        }

        return '';
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