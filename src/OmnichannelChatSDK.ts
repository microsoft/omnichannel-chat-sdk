/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ACSAdapterLogger, ACSClientLogger, AMSClientLogger, CallingSDKLogger, IC3ClientLogger, OCSDKLogger, createACSAdapterLogger, createACSClientLogger, createAMSClientLogger, createCallingSDKLogger, createIC3ClientLogger, createOCSDKLogger } from "./utils/loggers";
import ACSClient, { ACSConversation } from "./core/messaging/ACSClient";
import { AmsClient, ChatWidgetLanguage, DataMaskingInfo, LiveWSAndLiveChatEngJoin, VoiceVideoCallingOptionalParams } from "./types/config";
import { ChatAdapter, GetAgentAvailabilityResponse, GetCurrentLiveChatContextResponse, GetLiveChatTranscriptResponse, GetMessagesResponse, GetPreChatSurveyResponse, GetVoiceVideoCallingResponse, MaskingRule, MaskingRules, UploadFileAttachmentResponse } from "./types/response";
import { ChatClient, ChatMessage } from "@azure/communication-chat";
import { ChatMessageEditedEvent, ChatMessageReceivedEvent, ParticipantsRemovedEvent } from '@azure/communication-signaling';
import { MessagePrinterFactory, PrinterType } from "./utils/printers/MessagePrinterFactory";
import { SDKProvider as OCSDKProvider, uuidv4 } from "@microsoft/ocsdk";
import { createACSAdapter, createDirectLine, createIC3Adapter } from "./utils/chatAdapterCreators";
import { createCoreServicesOrgUrl, getCoreServicesGeoName, isCoreServicesOrgUrl, unqOrgUrlPattern } from "./utils/CoreServicesUtils";
import { defaultLocaleId, getLocaleStringFromId } from "./utils/locale";
import exceptionThrowers, { throwAMSLoadFailure } from "./utils/exceptionThrowers";
import { getRuntimeId, isClientIdNotFoundErrorMessage, isCustomerMessage } from "./utils/utilities";
import { loadScript, removeElementById, sleep } from "./utils/WebUtils";
import platform, { isBrowser } from "./utils/platform";
import validateSDKConfig, { defaultChatSDKConfig } from "./validators/SDKConfigValidators";

import ACSParticipantDisplayName from "./core/messaging/ACSParticipantDisplayName";
import ACSRegisterOnNewMessageOptionalParams from "./core/messaging/ACSRegisterOnNewMessageOptionalParams";
import { AMSClientLoadStates } from "./utils/AMSClientLoadStates";
import AMSFileManager from "./external/ACSAdapter/AMSFileManager";
import AriaTelemetry from "./telemetry/AriaTelemetry";
import AuthSettings from "./core/AuthSettings";
import CallingOptionsOptionSetNumber from "./core/CallingOptionsOptionSetNumber";
import ChatAdapterOptionalParams from "./core/messaging/ChatAdapterOptionalParams";
import ChatAdapterProtocols from "./core/messaging/ChatAdapterProtocols";
import ChatConfig from "./core/ChatConfig";
import ChatReconnectContext from "./core/ChatReconnectContext";
import ChatReconnectOptionalParams from "./core/ChatReconnectOptionalParams";
import ChatSDKConfig from "./core/ChatSDKConfig";
import { ChatSDKErrorName } from "./core/ChatSDKError";
import ChatSDKExceptionDetails from "./core/ChatSDKExceptionDetails";
import ChatSDKMessage from "./core/messaging/ChatSDKMessage";
import ChatTranscriptBody from "./core/ChatTranscriptBody";
import ConversationMode from "./core/ConversationMode";
import DeliveryMode from "@microsoft/omnichannel-ic3core/lib/model/DeliveryMode";
import EmailLiveChatTranscriptOptionaParams from "./core/EmailLiveChatTranscriptOptionalParams";
import EndChatOptionalParams from "./core/EndChatOptionalParams";
import FetchChatTokenResponse from "@microsoft/ocsdk/lib/Model/FetchChatTokenResponse";
import FileMetadata from "@microsoft/omnichannel-amsclient/lib/FileMetadata";
import FileSharingProtocolType from "@microsoft/omnichannel-ic3core/lib/model/FileSharingProtocolType";
import FramedClient from "@microsoft/omnichannel-amsclient/lib/FramedClient";
import FramedlessClient from "@microsoft/omnichannel-amsclient/lib/FramedlessClient";
import GetAgentAvailabilityOptionalParams from "./core/GetAgentAvailabilityOptionalParams";
import GetChatTokenOptionalParams from "./core/GetChatTokenOptionalParams";
import GetConversationDetailsOptionalParams from "./core/GetConversationDetailsOptionalParams";
import GetLiveChatConfigOptionalParams from "./core/GetLiveChatConfigOptionalParams";
import GetLiveChatTranscriptOptionalParams from "./core/GetLiveChatTranscriptOptionalParams";
import HostType from "@microsoft/omnichannel-ic3core/lib/interfaces/HostType";
import { SDKProvider as IC3SDKProvider } from '@microsoft/omnichannel-ic3core';
import IChatToken from "./external/IC3Adapter/IChatToken";
import IConversation from "@microsoft/omnichannel-ic3core/lib/model/IConversation";
import IEmailTranscriptOptionalParams from "@microsoft/ocsdk/lib/Interfaces/IEmailTranscriptOptionalParams";
import IFileInfo from "@microsoft/omnichannel-ic3core/lib/interfaces/IFileInfo";
import IFileMetadata from "@microsoft/omnichannel-ic3core/lib/model/IFileMetadata";
import IGetChatTokenOptionalParams from "@microsoft/ocsdk/lib/Interfaces/IGetChatTokenOptionalParams";
import IGetChatTranscriptsOptionalParams from "@microsoft/ocsdk/lib/Interfaces/IGetChatTranscriptsOptionalParams";
import IGetLWIDetailsOptionalParams from "@microsoft/ocsdk/lib/Interfaces/IGetLWIDetailsOptionalParams";
import IGetQueueAvailabilityOptionalParams from "@microsoft/ocsdk/lib/Interfaces/IGetQueueAvailabilityOptionalParams";
import IInitializationInfo from "@microsoft/omnichannel-ic3core/lib/model/IInitializationInfo";
import IMessage from "@microsoft/omnichannel-ic3core/lib/model/IMessage";
import IOmnichannelConfiguration from "@microsoft/ocsdk/lib/Interfaces/IOmnichannelConfiguration";
import IPerson from "@microsoft/omnichannel-ic3core/lib/model/IPerson";
import IRawMessage from "@microsoft/omnichannel-ic3core/lib/model/IRawMessage";
import IRawThread from "@microsoft/omnichannel-ic3core/lib/interfaces/IRawThread";
import IReconnectableChatsParams from "@microsoft/ocsdk/lib/Interfaces/IReconnectableChatsParams";
import IRegionGtms from "@microsoft/omnichannel-ic3core/lib/model/IRegionGtms";
import ISDKConfiguration from "@microsoft/ocsdk/lib/Interfaces/ISDKConfiguration";
import ISessionCloseOptionalParams from "@microsoft/ocsdk/lib/Interfaces/ISessionCloseOptionalParams";
import ISessionInitOptionalParams from "@microsoft/ocsdk/lib/Interfaces/ISessionInitOptionalParams";
import InitContext from "@microsoft/ocsdk/lib/Model/InitContext";
import InitializeOptionalParams from "./core/InitializeOptionalParams";
import LiveChatContext from "./core/LiveChatContext";
import LiveChatVersion from "./core/LiveChatVersion";
import LiveWorkItemDetails from "./core/LiveWorkItemDetails";
import LiveWorkItemState from "./core/LiveWorkItemState";
import MessageContentType from "@microsoft/omnichannel-ic3core/lib/model/MessageContentType";
import { MessageSource } from "./telemetry/MessageSource";
import MessageType from "@microsoft/omnichannel-ic3core/lib/model/MessageType";
import OmnichannelChatToken from "@microsoft/omnichannel-amsclient/lib/OmnichannelChatToken";
import OmnichannelConfig from "./core/OmnichannelConfig";
import OmnichannelErrorCodes from "./core/OmnichannelErrorCodes";
import OmnichannelMessage from "./core/messaging/OmnichannelMessage";
import OnNewMessageOptionalParams from "./core/messaging/OnNewMessageOptionalParams";
import PersonType from "@microsoft/omnichannel-ic3core/lib/model/PersonType";
import PluggableLogger from "@microsoft/omnichannel-amsclient/lib/PluggableLogger";
import PostChatContext from "./core/PostChatContext";
import ProtocolType from "@microsoft/omnichannel-ic3core/lib/interfaces/ProtocoleType";
import ScenarioMarker from "./telemetry/ScenarioMarker";
import SetAuthTokenProviderOptionalParams from "./core/SetAuthTokenProviderOptionalParams";
import StartChatOptionalParams from "./core/StartChatOptionalParams";
import TelemetryEvent from "./telemetry/TelemetryEvent";
import { callingBundleVersion } from "./config/settings";
import createAMSClient from "@microsoft/omnichannel-amsclient";
import createOcSDKConfiguration from "./utils/createOcSDKConfiguration";
import createOmnichannelMessage from "./utils/createOmnichannelMessage";
import createTelemetry from "./utils/createTelemetry";
import createVoiceVideoCalling from "./api/createVoiceVideoCalling";
import { defaultMessageTags } from "./core/messaging/MessageTags";
import exceptionSuppressors from "./utils/exceptionSuppressors";
import { getLocationInfo } from "./utils/location";
import { isCoreServicesOrgUrlDNSError } from "./utils/internalUtils";
import loggerUtils from "./utils/loggerUtils";
import { parseLowerCaseString } from "./utils/parsers";
import retrieveCollectorUri from "./telemetry/retrieveCollectorUri";
import setOcUserAgent from "./utils/setOcUserAgent";
import startPolling from "./commands/startPolling";
import stopPolling from "./commands/stopPolling";
import urlResolvers from "./utils/urlResolvers";
import validateOmnichannelConfig from "./validators/OmnichannelConfigValidator";

class OmnichannelChatSDK {
    private debug: boolean;
    public runtimeId: string;
    public OCSDKProvider: unknown;
    public IC3SDKProvider: unknown;
    public OCClient: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    public IC3Client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    public ACSClient: ACSClient | null = null;
    public AMSClient: FramedClient | FramedlessClient | null = null;
    public omnichannelConfig: OmnichannelConfig;
    public chatSDKConfig: ChatSDKConfig;
    public isInitialized: boolean;
    public localeId: string;
    public requestId: string;
    public sessionId: string | null = null;
    private unqServicesOrgUrl: string | null = null;
    private coreServicesOrgUrl: string | null = null;
    private dynamicsLocationCode: string | null = null;
    private chatToken: IChatToken;
    private liveChatConfig: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    private liveChatVersion: number;
    private dataMaskingRules: MaskingRules = { rules: [] };
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
    private callingSdkLogger: CallingSDKLogger | null = null;
    private amsClientLogger: AMSClientLogger | null = null;
    private isPersistentChat = false;
    private isChatReconnect = false;
    private reconnectId: null | string = null;
    private refreshTokenTimer: NodeJS.Timeout | string | number | null = null;
    private AMSClientLoadCurrentState: AMSClientLoadStates = AMSClientLoadStates.NOT_LOADED;
    private isMaskingDisabled = false;
    private maskingCharacter = "#";
    private isAMSClientAllowed = false;

    constructor(omnichannelConfig: OmnichannelConfig, chatSDKConfig: ChatSDKConfig = defaultChatSDKConfig) {
        this.debug = false;
        this.runtimeId = getRuntimeId(chatSDKConfig?.telemetry?.runtimeId ?? null);
        this.omnichannelConfig = omnichannelConfig;
        this.chatSDKConfig = {
            ...defaultChatSDKConfig,
            ...chatSDKConfig // overrides
        };
        this.isInitialized = false;
        this.liveChatVersion = LiveChatVersion.V2;
        this.localeId = defaultLocaleId;
        this.requestId = uuidv4();
        this.chatToken = {};
        this.liveChatConfig = {};
        this.authSettings = null;
        this.preChatSurvey = null;
        this.telemetry = createTelemetry(this.debug);
        this.scenarioMarker = new ScenarioMarker(this.omnichannelConfig);
        this.ic3ClientLogger = createIC3ClientLogger(this.omnichannelConfig);
        this.ocSdkLogger = createOCSDKLogger(this.omnichannelConfig);
        this.acsClientLogger = createACSClientLogger(this.omnichannelConfig);
        this.acsAdapterLogger = createACSAdapterLogger(this.omnichannelConfig);
        this.callingSdkLogger = createCallingSDKLogger(this.omnichannelConfig);
        this.amsClientLogger = createAMSClientLogger(this.omnichannelConfig);

        this.scenarioMarker.useTelemetry(this.telemetry);
        loggerUtils.useTelemetry(this.telemetry, this.ocSdkLogger, this.acsClientLogger, this.acsAdapterLogger, this.callingSdkLogger, this.amsClientLogger, this.ic3ClientLogger);

        this.scenarioMarker.setRuntimeId(this.runtimeId);
        loggerUtils.setRuntimeId(this.runtimeId, this.ocSdkLogger, this.acsClientLogger, this.acsAdapterLogger, this.callingSdkLogger, this.amsClientLogger, this.ic3ClientLogger);

        validateOmnichannelConfig(omnichannelConfig);
        validateSDKConfig(chatSDKConfig);

        this.chatSDKConfig.telemetry?.disable && this.telemetry?.disable();

        const collectorUri = retrieveCollectorUri(this.omnichannelConfig.orgUrl);

        if (this.chatSDKConfig.telemetry?.ariaCollectorUri) {
            this.telemetry.setCollectorUri(this.chatSDKConfig.telemetry?.ariaCollectorUri);
        } else {
            this.telemetry.setCollectorUri(collectorUri);
        }

        if (this.chatSDKConfig.telemetry?.ariaTelemetryKey) {
            this.telemetry.initialize(this.chatSDKConfig.telemetry.ariaTelemetryKey);
        }

        if (this.chatSDKConfig.dataMasking) {
            this.isMaskingDisabled = this.chatSDKConfig.dataMasking.disable;
            this.maskingCharacter = this.chatSDKConfig.dataMasking.maskingCharacter;
        }

        loggerUtils.setRequestId(this.requestId, this.ocSdkLogger, this.acsClientLogger, this.acsAdapterLogger, this.callingSdkLogger, this.amsClientLogger, this.ic3ClientLogger);
    }

    /* istanbul ignore next */
    public setDebug(flag: boolean): void {
        this.debug = flag;
        this.telemetry?.setDebug(flag);
        this.scenarioMarker.setDebug(flag);

        if (this.AMSClient) {
            this.AMSClient.setDebug(flag);
        }

        loggerUtils.setDebug(flag, this.ocSdkLogger, this.acsClientLogger, this.acsAdapterLogger, this.callingSdkLogger, this.amsClientLogger, this.ic3ClientLogger);
    }

    private async retryLoadAMSClient(): Promise<AmsClient> {
        // Constants for retry logic
        const RETRY_DELAY_MS = 1000;
        const MAX_RETRY_COUNT = 30;
        let retryCount = 0;

        while (retryCount < MAX_RETRY_COUNT) {
            if (this.AMSClient) {
                return this.AMSClient;
            }
            await sleep(RETRY_DELAY_MS);
            retryCount++;
        }
        return null;
    }

    private async getAMSClient(): Promise<AmsClient> {

        //return null to do not break promise creation
        if (this.isAMSClientAllowed === false) {
            return null;
        }

        if (this.AMSClientLoadCurrentState === AMSClientLoadStates.NOT_LOADED && this.liveChatVersion === LiveChatVersion.V1) {
            return null;
        }
        switch (this.AMSClientLoadCurrentState) {
        case AMSClientLoadStates.LOADED:
            this.debug && console.log("Attachment handler is already loaded");
            return this.AMSClient;
        case AMSClientLoadStates.LOADING:
            this.debug && console.log("Attachment handler is loading, waiting for it to be ready");
            return await this.retryLoadAMSClient();
        case AMSClientLoadStates.ERROR:
        case AMSClientLoadStates.NOT_LOADED:
            this.debug && console.log("Attachment handler is not loaded, loading now");
            await this.loadAmsClient();
            return this.AMSClient;
        default:
            return null;
        }
    }

    private async loadInitComponents(): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.InitializeComponents);

        const supportedLiveChatVersions = [LiveChatVersion.V1, LiveChatVersion.V2];
        if (!supportedLiveChatVersions.includes(this.liveChatVersion)) {
            exceptionThrowers.throwUnsupportedLiveChatVersionFailure(new Error(ChatSDKErrorName.UnsupportedLiveChatVersion), this.scenarioMarker, TelemetryEvent.InitializeComponents);
        }
        // we need this version validation, until we remove all v1 code, pending task.
        if (this.liveChatVersion === LiveChatVersion.V2) {
            this.ACSClient = new ACSClient(this.acsClientLogger);
        } else {
            this.IC3Client = await this.getIC3Client();
        }
        this.scenarioMarker.completeScenario(TelemetryEvent.InitializeComponents);
    }

    private evaluateAMSAvailability(): boolean {

        // it will load AMS only if enabled for Customer or Agent support for attachments, based on configuration
        if (this.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_enablefileattachmentsforcustomers === "true" ||
            this.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_enablefileattachmentsforagents === "true") {
            if (this.liveChatVersion === LiveChatVersion.V2) {
                //override of this value, since it will be needed to control access to attachment operations
                this.isAMSClientAllowed = true;
                return this.isAMSClientAllowed;
            }
        }
        return this.isAMSClientAllowed;
    }

    private async loadAmsClient(): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.InitializeMessagingClient);
        try {
            if (this.isAMSClientAllowed) {
                if (this.AMSClientLoadCurrentState === AMSClientLoadStates.NOT_LOADED) {
                    this.AMSClientLoadCurrentState = AMSClientLoadStates.LOADING;
                    this.debug && console.time("ams_creation");
                    this.AMSClient = await createAMSClient({
                        framedMode: isBrowser(),
                        multiClient: true,
                        debug: this.debug,
                        logger: this.amsClientLogger as PluggableLogger
                    });
                    this.debug && console.timeEnd("ams_creation");
                    this.AMSClientLoadCurrentState = AMSClientLoadStates.LOADED;
                }
            }

            this.scenarioMarker.completeScenario(TelemetryEvent.InitializeMessagingClient);
        } catch (e) {
            this.AMSClientLoadCurrentState = AMSClientLoadStates.ERROR;
            exceptionThrowers.throwMessagingClientCreationFailure(e, this.scenarioMarker, TelemetryEvent.InitializeMessagingClient);
        }
    }

    private async parallelInitialization(optionalParams: InitializeOptionalParams = {}) {
        try {
            this.scenarioMarker.startScenario(TelemetryEvent.InitializeChatSDKParallel);

            if (this.isInitialized) {
                this.scenarioMarker.completeScenario(TelemetryEvent.InitializeChatSDKParallel);
                return this.liveChatConfig;
            }

            this.useCoreServicesOrgUrlIfNotSet();
            await Promise.all([this.loadInitComponents(), this.loadChatConfig(optionalParams)]);
            // this will load ams in the background, without holding the load
            this.loadAmsClient();
            this.isInitialized = true;
            this.scenarioMarker.completeScenario(TelemetryEvent.InitializeChatSDKParallel);
        } catch (error) {
            // Handle the error appropriately
            this.scenarioMarker.failScenario(TelemetryEvent.InitializeChatSDKParallel);
            throw error;
        }

        return this.liveChatConfig;
    }

    // We will keep this logic for backward compatibility for customers with unknown implementation, so they can test before fully adoption
    private async sequentialInitialization(optionalParams: InitializeOptionalParams = {}) {

        this.scenarioMarker.startScenario(TelemetryEvent.InitializeChatSDK);

        if (this.isInitialized) {
            this.scenarioMarker.completeScenario(TelemetryEvent.InitializeChatSDK);
            return this.liveChatConfig;
        }

        this.useCoreServicesOrgUrlIfNotSet();

        const useCoreServices = isCoreServicesOrgUrl(this.omnichannelConfig.orgUrl);
        try {
            this.OCSDKProvider = OCSDKProvider;
            this.OCClient = await OCSDKProvider.getSDK(this.omnichannelConfig as IOmnichannelConfiguration, createOcSDKConfiguration(useCoreServices) as ISDKConfiguration, this.ocSdkLogger as OCSDKLogger);
            setOcUserAgent(this.OCClient, this.chatSDKConfig?.ocUserAgent);
        } catch (e) {
            exceptionThrowers.throwOmnichannelClientInitializationFailure(e, this.scenarioMarker, TelemetryEvent.InitializeChatSDK);
        }

        try {
            const { getLiveChatConfigOptionalParams } = optionalParams;
            await this.getChatConfig(getLiveChatConfigOptionalParams || {});
        } catch (e) {
            exceptionThrowers.throwChatConfigRetrievalFailure(e, this.scenarioMarker, TelemetryEvent.InitializeChatSDK);
        }

        const supportedLiveChatVersions = [LiveChatVersion.V1, LiveChatVersion.V2];
        if (!supportedLiveChatVersions.includes(this.liveChatVersion)) {
            exceptionThrowers.throwUnsupportedLiveChatVersionFailure(new Error(ChatSDKErrorName.UnsupportedLiveChatVersion), this.scenarioMarker, TelemetryEvent.InitializeChatSDK);
        }

        try {

            if (this.liveChatVersion === LiveChatVersion.V2) {
                this.ACSClient = new ACSClient(this.acsClientLogger);

                if (this.isAMSClientAllowed && this.AMSClientLoadCurrentState === AMSClientLoadStates.NOT_LOADED) {
                    this.AMSClientLoadCurrentState = AMSClientLoadStates.LOADING;
                    this.debug && console.time("ams_seq_creation");
                    this.AMSClient = await createAMSClient({
                        framedMode: isBrowser(),
                        multiClient: true,
                        debug: this.debug,
                        logger: this.amsClientLogger as PluggableLogger
                    });
                    this.debug && console.timeEnd("ams_seq_creation");
                    this.AMSClientLoadCurrentState = AMSClientLoadStates.LOADED;
                }

            } else if (this.liveChatVersion === LiveChatVersion.V1) {
                this.IC3Client = await this.getIC3Client();
            }
            this.isInitialized = true;
            this.scenarioMarker.completeScenario(TelemetryEvent.InitializeChatSDK);
        } catch (e) {
            this.AMSClientLoadCurrentState = AMSClientLoadStates.ERROR;
            exceptionThrowers.throwMessagingClientCreationFailure(e, this.scenarioMarker, TelemetryEvent.InitializeChatSDK);
        }

        return this.liveChatConfig;
    }

    /**
     *
     * @param optionalParams
     * @param parallel if true , it will run in parallel (fastest version) with components loaded in the background
     * @returns livechatConfig
     */
    public async initialize(optionalParams: InitializeOptionalParams = {}): Promise<ChatConfig> {

        const { useParallelLoad } = optionalParams;

        if (useParallelLoad === true) {
            return await this.parallelInitialization(optionalParams)
        }
        return await this.sequentialInitialization(optionalParams);
    }

    private async loadChatConfig(optionalParams: InitializeOptionalParams = {}): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.InitializeLoadChatConfig);
        const useCoreServices = isCoreServicesOrgUrl(this.omnichannelConfig.orgUrl);

        try {
            this.OCSDKProvider = OCSDKProvider;
            this.OCClient = OCSDKProvider.getSDK(this.omnichannelConfig as IOmnichannelConfiguration, createOcSDKConfiguration(useCoreServices) as ISDKConfiguration, this.ocSdkLogger as OCSDKLogger);
            setOcUserAgent(this.OCClient, this.chatSDKConfig?.ocUserAgent);
        } catch (e) {
            exceptionThrowers.throwOmnichannelClientInitializationFailure(e, this.scenarioMarker, TelemetryEvent.InitializeLoadChatConfig);
        }

        try {
            const { getLiveChatConfigOptionalParams } = optionalParams;
            await this.getChatConfig(getLiveChatConfigOptionalParams || {});
            // once we have the config, we can check if we need to load AMS
        } catch (e) {
            exceptionThrowers.throwChatConfigRetrievalFailure(e, this.scenarioMarker, TelemetryEvent.InitializeLoadChatConfig);
        }

        this.scenarioMarker.completeScenario(TelemetryEvent.InitializeLoadChatConfig);
    }

    private async getChatReconnectContextWithAuthToken(): Promise<ChatReconnectContext> {

        this.scenarioMarker.startScenario(TelemetryEvent.GetChatReconnectContextWithAuthToken, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        })

        const context: ChatReconnectContext = {
            reconnectId: null,
            redirectURL: null
        }

        try {
            const reconnectableChatsParams: IReconnectableChatsParams = {
                authenticatedUserToken: this.authenticatedUserToken as string,
                requestId: this.requestId as string
            }

            const reconnectableChatsResponse = await this.OCClient.getReconnectableChats(reconnectableChatsParams);

            if (reconnectableChatsResponse && reconnectableChatsResponse.reconnectid) {
                context.reconnectId = reconnectableChatsResponse.reconnectid as string
            }

            this.scenarioMarker.completeScenario(TelemetryEvent.GetChatReconnectContextWithAuthToken, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            })

        } catch (error) {
            const exceptionDetails = {
                response: "OCClientGetReconnectableChatsFailed"
            }
            const telemetryData = {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string,
                ExceptionDetails: JSON.stringify(exceptionDetails)
            }
            if (isClientIdNotFoundErrorMessage(error)) {
                exceptionThrowers.throwAuthContactIdNotFoundFailure(error, this.scenarioMarker, TelemetryEvent.GetChatReconnectContextWithAuthToken, telemetryData);
            }

            this.scenarioMarker.failScenario(TelemetryEvent.GetChatReconnectContextWithAuthToken, telemetryData);
            console.error(`OmnichannelChatSDK/GetChatReconnectContextWithAuthToken/error ${error}`);
        }

        return context;
    }

    private async getChatReconnectContextWithReconnectId(optionalParams: ChatReconnectOptionalParams = {}): Promise<ChatReconnectContext> {
        this.scenarioMarker.startScenario(TelemetryEvent.GetChatReconnectContextWithReconnectId, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        })

        const context: ChatReconnectContext = {
            reconnectId: null,
            redirectURL: null
        }
        //Only when exist a recconectId as part of the URL params
        if (optionalParams.reconnectId) {
            try {
                const reconnectAvailabilityResponse = await this.OCClient.getReconnectAvailability(optionalParams.reconnectId);
                // isReconnectAvailable , indicates if the chat is still valid, or the token has expired
                if (reconnectAvailabilityResponse && !reconnectAvailabilityResponse.isReconnectAvailable) {
                    if (reconnectAvailabilityResponse.reconnectRedirectionURL) {
                        context.redirectURL = reconnectAvailabilityResponse.reconnectRedirectionURL as string;
                    }
                } else {
                    context.reconnectId = optionalParams.reconnectId as string;
                }

                this.scenarioMarker.completeScenario(TelemetryEvent.GetChatReconnectContextWithReconnectId, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                })
            } catch (error) {
                const exceptionDetails = {
                    response: "OCClientGetReconnectAvailabilityFailed"
                }

                this.scenarioMarker.failScenario(TelemetryEvent.GetChatReconnectContextWithReconnectId, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                console.error(`OmnichannelChatSDK/GetChatReconnectContextWithReconnectId/error ${error}`);
            }
        }
        //here the context contains recconnectionId if valid, or redirectionURL if not valid
        return context;
    }

    public async getChatReconnectContext(optionalParams: ChatReconnectOptionalParams = {}): Promise<ChatReconnectContext> {

        this.scenarioMarker.startScenario(TelemetryEvent.GetChatReconnectContext, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        })

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.GetChatReconnectContext);
        }

        let context: ChatReconnectContext = {
            reconnectId: null,
            redirectURL: null
        }

        // if necessary to make this call, to validate if the token is valid.
        context = await this.getChatReconnectContextWithReconnectId(optionalParams);

        // if redirectURL is present, it means the token is not longer valid.
        if (context.redirectURL && context.redirectURL.length > 0) {
            return context;
        }

        // at this point the token is valid and we can check for active session for auth sessions
        if (this.authenticatedUserToken) {
            context = await this.getChatReconnectContextWithAuthToken();
        }

        this.scenarioMarker.completeScenario(TelemetryEvent.GetChatReconnectContext, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        })

        return context;
    }

    public async startChat(optionalParams: StartChatOptionalParams = {}): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.StartChat, {
            RequestId: this.requestId
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.StartChat);
        }

        const shouldReinitIC3Client = !platform.isNode() && !platform.isReactNative() && !this.IC3Client && this.liveChatVersion === LiveChatVersion.V1;
        if (shouldReinitIC3Client) {
            this.IC3Client = await this.getIC3Client();
        }

        if (this.isChatReconnect && !this.chatSDKConfig.chatReconnect?.disable && !this.isPersistentChat && optionalParams.reconnectId) {
            this.reconnectId = optionalParams.reconnectId as string;
        }

        if (this.isPersistentChat && !this.chatSDKConfig.persistentChat?.disable) {
            try {
                const reconnectableChatsParams: IReconnectableChatsParams = {
                    authenticatedUserToken: this.authenticatedUserToken as string,
                    requestId: this.requestId as string
                }

                const reconnectableChatsResponse = await this.OCClient.getReconnectableChats(reconnectableChatsParams);

                if (reconnectableChatsResponse && reconnectableChatsResponse.reconnectid) {
                    this.reconnectId = reconnectableChatsResponse.reconnectid;
                }
            } catch (e) {
                const telemetryData = {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                };

                exceptionThrowers.throwPersistentChatConversationRetrievalFailure(e, this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
            }
        }

        if (optionalParams.liveChatContext && Object.keys(optionalParams.liveChatContext).length > 0 && !this.reconnectId) {
            this.chatToken = optionalParams.liveChatContext.chatToken || {};
            this.requestId = optionalParams.liveChatContext.requestId || uuidv4();
            this.sessionId = optionalParams.liveChatContext.sessionId || null;

            // Validate conversation
            const conversationDetails = await this.getConversationDetails();
            if (Object.keys(conversationDetails).length === 0) {
                const telemetryData = {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                };

                exceptionThrowers.throwInvalidConversation(this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
            }

            if (conversationDetails.state === LiveWorkItemState.WrapUp || conversationDetails.state === LiveWorkItemState.Closed) {
                console.error(`Unable to join conversation that's in '${conversationDetails.state}' state`);
                const telemetryData = {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                };

                exceptionThrowers.throwClosedConversation(this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
            }
        }

        if (this.authSettings) {
            if (!this.authenticatedUserToken) {
                await this.setAuthTokenProvider(this.chatSDKConfig.getAuthToken, { throwError: true });
            }

            if (optionalParams.liveChatContext && Object.keys(optionalParams.liveChatContext).length > 0) {
                this.chatToken = optionalParams.liveChatContext.chatToken || {};
                this.requestId = optionalParams.liveChatContext.requestId || uuidv4();

                try {
                    await this.OCClient.validateAuthChatRecord(this.requestId, {
                        authenticatedUserToken: this.authenticatedUserToken,
                        chatId: this.chatToken.chatId
                    });
                } catch (e) {
                    const telemetryData = {
                        RequestId: this.requestId,
                        ChatId: this.chatToken.chatId as string,
                    };

                    exceptionThrowers.throwAuthenticatedChatConversationRetrievalFailure(e, this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
                }
            }
        }

        if (this.chatSDKConfig.useCreateConversation?.disable && this.chatToken && Object.keys(this.chatToken).length === 0) {
            await this.getChatToken(false);
        }
        if (this.chatToken?.chatId) {
            loggerUtils.setChatId(this.chatToken.chatId || '', this.ocSdkLogger, this.acsClientLogger, this.acsAdapterLogger, this.callingSdkLogger, this.amsClientLogger, this.ic3ClientLogger);
        }

        let sessionInitOptionalParams: ISessionInitOptionalParams = {
            initContext: {} as InitContext
        };

        sessionInitOptionalParams = this.populateInitChatOptionalParam(sessionInitOptionalParams, optionalParams, TelemetryEvent.StartChat);
        sessionInitOptionalParams.initContext!.isProactiveChat = !!optionalParams.isProactiveChat;

        if (optionalParams.platform) {
            sessionInitOptionalParams.initContext!.platform = optionalParams.platform;
        }

        if (optionalParams.handle) {
            sessionInitOptionalParams.initContext!.handle = optionalParams.handle;
        }

        if (this.isPersistentChat && !this.chatSDKConfig.persistentChat?.disable) {
            sessionInitOptionalParams.reconnectId = this.reconnectId as string;
        } else if (this.isChatReconnect && !this.chatSDKConfig.chatReconnect?.disable && !this.isPersistentChat) {
            sessionInitOptionalParams.reconnectId = this.reconnectId as string;
        }

        if (parseLowerCaseString(this.liveChatConfig?.LiveWSAndLiveChatEngJoin?.msdyn_requestvisitorlocation) === "true") {
            const location = await getLocationInfo(this.scenarioMarker, this.chatToken.chatId as string, this.requestId);
            sessionInitOptionalParams.initContext!.latitude = location.latitude;
            sessionInitOptionalParams.initContext!.longitude = location.longitude;
        }

        const sessionInitPromise = async () => {
            // Skip session init when there's a valid live chat context
            if (!optionalParams.liveChatContext) {
                try {
                    await this.OCClient.sessionInit(this.requestId, sessionInitOptionalParams);
                } catch (error) {
                    const telemetryData = {
                        RequestId: this.requestId,
                        ChatId: this.chatToken.chatId as string,
                    };

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if ((error as any)?.isAxiosError && (error as any).response?.headers?.errorcode?.toString() === OmnichannelErrorCodes.WidgetUseOutsideOperatingHour.toString()) {
                        exceptionThrowers.throwWidgetUseOutsideOperatingHour(error, this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
                    }

                    exceptionThrowers.throwConversationInitializationFailure(error, this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
                }
            }
        };

        const createConversationPromise = async () => {
            // Skip session init when there's a valid live chat context
            if (!optionalParams.liveChatContext) {
                try {
                    const chatToken = await this.OCClient.createConversation(this.requestId, sessionInitOptionalParams);
                    if (chatToken) {
                        this.setChatToken(chatToken);
                        loggerUtils.setChatId(this.chatToken.chatId || '', this.ocSdkLogger, this.acsClientLogger, this.acsAdapterLogger, this.callingSdkLogger, this.amsClientLogger, this.ic3ClientLogger);
                    }
                } catch (error) {
                    const telemetryData = {
                        RequestId: this.requestId,
                        ChatId: this.chatToken.chatId as string,
                    };

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if ((error as any)?.isAxiosError && (error as any).response?.headers?.errorcode?.toString() === OmnichannelErrorCodes.WidgetUseOutsideOperatingHour.toString()) {
                        exceptionThrowers.throwWidgetUseOutsideOperatingHour(error, this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
                    }

                    exceptionThrowers.throwConversationInitializationFailure(error, this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
                }
            }
        };

        const messagingClientPromise = async () => {
            if (this.liveChatVersion === LiveChatVersion.V2) {
                const chatAdapterConfig = {
                    token: this.chatToken.token,
                    id: this.chatToken.visitorId || 'teamsvisitor',
                    threadId: this.chatToken.chatId,
                    environmentUrl: this.chatToken.acsEndpoint as string,
                    pollingInterval: 30000
                };

                // Temporarily disable token refresh mechanism
                // const tokenRefresher = async (): Promise<string> => {
                //     await this.getChatToken(false, { refreshToken: true });
                //     await getAmsClient()?.initialize({ chatToken: this.chatToken as OmnichannelChatToken });
                //     return this.chatToken.token as string;
                // };

                try {
                    await this.ACSClient?.initialize({
                        token: chatAdapterConfig.token as string,
                        environmentUrl: chatAdapterConfig.environmentUrl,
                    });
                } catch (error) {
                    const telemetryData = {
                        RequestId: this.requestId,
                        ChatId: this.chatToken.chatId as string,
                    };

                    exceptionThrowers.throwMessagingClientInitializationFailure(error, this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
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
                    const telemetryData = {
                        RequestId: this.requestId,
                        ChatId: this.chatToken.chatId as string,
                    };

                    exceptionThrowers.throwMessagingClientConversationJoinFailure(error, this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
                }
            } else {
                try {
                    await this.IC3Client.initialize({
                        token: this.chatToken.token,
                        regionGtms: this.chatToken.regionGTMS,
                        visitor: true
                    });
                } catch (error) {
                    const telemetryData = {
                        RequestId: this.requestId,
                        ChatId: this.chatToken.chatId as string,
                    };

                    exceptionThrowers.throwMessagingClientInitializationFailure(error, this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
                }

                try {
                    this.conversation = await this.IC3Client.joinConversation(this.chatToken.chatId);
                    this.scenarioMarker.completeScenario(TelemetryEvent.StartChat, {
                        RequestId: this.requestId,
                        ChatId: this.chatToken.chatId as string
                    });
                } catch (error) {
                    const telemetryData = {
                        RequestId: this.requestId,
                        ChatId: this.chatToken.chatId as string,
                    };

                    exceptionThrowers.throwMessagingClientConversationJoinFailure(error, this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
                }
            }
        };

        const attachmentClientPromise = async (): Promise<void> => {
            try {
                if (this.liveChatVersion === LiveChatVersion.V2) {
                    if (!this.isAMSClientAllowed) return;
                    // will wait till the AMSClient is loaded, and then initialize it
                    this.debug && console.time("ams_promise_initialization");
                    const amsClient = await this.getAMSClient();
                    await amsClient?.initialize({ chatToken: this.chatToken as OmnichannelChatToken });
                    this.debug && console.timeEnd("ams_promise_initialization");
                }
            } catch (error) {
                const telemetryData = {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                };
                exceptionThrowers.throwMessagingClientInitializationFailure(error, this.scenarioMarker, TelemetryEvent.StartChat, telemetryData);
            }
        };

        if (!this.chatSDKConfig.useCreateConversation?.disable) {
            await createConversationPromise();
            await Promise.all([messagingClientPromise(),attachmentClientPromise()]);
        } else {
            await Promise.all([sessionInitPromise(), messagingClientPromise(), attachmentClientPromise()]);
        }

        if (this.isPersistentChat && !this.chatSDKConfig.persistentChat?.disable) {
            this.refreshTokenTimer = setInterval(async () => {
                await this.getChatToken(false);
                this.updateChatToken(this.chatToken.token as string, this.chatToken.regionGTMS);
            }, this.chatSDKConfig.persistentChat?.tokenUpdateTime);
        }
    }

    private async closeChat(endChatOptionalParams: EndChatOptionalParams): Promise<void> {

        const cleanupMetadata = {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string,
            isSessionEnded: !endChatOptionalParams?.isSessionEnded
        };

        // in case a session was ended by agent or disconnected, there is no need to close the session
        this.scenarioMarker.startScenario(TelemetryEvent.CloseChatSession, cleanupMetadata);

        if (!endChatOptionalParams?.isSessionEnded) {
            try {

                const sessionCloseOptionalParams: ISessionCloseOptionalParams = {};

                if (this.isPersistentChat && !this.chatSDKConfig.persistentChat?.disable) {
                    const isReconnectChat = this.reconnectId !== null ? true : false;

                    sessionCloseOptionalParams.isPersistentChat = this.isPersistentChat;
                    sessionCloseOptionalParams.isReconnectChat = isReconnectChat;
                }

                if (this.isChatReconnect && !this.chatSDKConfig.chatReconnect?.disable && !this.isPersistentChat) {
                    const isChatReconnect = this.reconnectId !== null ? true : false;
                    this.requestId = isChatReconnect ? (this.reconnectId as string) : this.requestId; // Chat Reconnect session to close
                    sessionCloseOptionalParams.isReconnectChat = isChatReconnect;
                }

                if (this.authenticatedUserToken) {
                    sessionCloseOptionalParams.authenticatedUserToken = this.authenticatedUserToken;
                }

                await this.OCClient.sessionClose(this.requestId, sessionCloseOptionalParams);

            } catch (error) {
                exceptionThrowers.throwConversationClosureFailure(error, this.scenarioMarker, TelemetryEvent.CloseChatSession, {
                    ...cleanupMetadata,
                    isSessionEnded: String(!endChatOptionalParams?.isSessionEnded)
                });
            }
            this.scenarioMarker.completeScenario(TelemetryEvent.CloseChatSession, cleanupMetadata);
        }
    }

    public async endChat(endChatOptionalParams: EndChatOptionalParams = {}): Promise<void> {

        const cleanupMetadata = {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        };

        this.scenarioMarker.startScenario(TelemetryEvent.EndChat, cleanupMetadata);

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.EndChat);
        }

        try {
            // calling close chat, internally will handle the session close
            await this.closeChat(endChatOptionalParams);

            this.conversation?.disconnect();
            this.conversation = null;
            this.requestId = uuidv4();
            this.chatToken = {};
            this.reconnectId = null;

            if (this.IC3Client) {
                this.IC3Client.dispose();
                !platform.isNode() && !platform.isReactNative() && removeElementById(this.IC3Client.id);
                this.IC3Client = null;
            }

            if (this.OCClient.sessionId) {
                this.OCClient.sessionId = null;
                this.sessionId = null;
            }

            loggerUtils.setRequestId(this.requestId, this.ocSdkLogger, this.acsClientLogger, this.acsAdapterLogger, this.callingSdkLogger, this.amsClientLogger, this.ic3ClientLogger);
            loggerUtils.setChatId('', this.ocSdkLogger, this.acsClientLogger, this.acsAdapterLogger, this.callingSdkLogger, this.amsClientLogger, this.ic3ClientLogger);

            if (this.refreshTokenTimer !== null) {
                clearInterval(this.refreshTokenTimer);
                this.refreshTokenTimer = null;
            }

            this.scenarioMarker.completeScenario(TelemetryEvent.EndChat, cleanupMetadata);

        } catch (error) {
            const telemetryData = {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            };
            exceptionThrowers.throwConversationClosureFailure(error, this.scenarioMarker, TelemetryEvent.EndChat, telemetryData);
        }
    }

    public async getCurrentLiveChatContext(): Promise<GetCurrentLiveChatContextResponse> {
        const chatToken = await this.getChatToken();
        const { requestId } = this;

        this.scenarioMarker.startScenario(TelemetryEvent.GetCurrentLiveChatContext, {
            RequestId: requestId,
            ChatId: chatToken.chatId as string
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.GetCurrentLiveChatContext);
        }

        const chatSession: LiveChatContext = {
            chatToken,
            requestId
        }

        if (Object.keys(chatSession.chatToken).length === 0) {
            return {};
        }

        if (this.reconnectId) {
            chatSession.reconnectId = this.reconnectId;
        }

        if (this.sessionId) {
            chatSession.sessionId = this.sessionId;
        }

        this.scenarioMarker.completeScenario(TelemetryEvent.GetCurrentLiveChatContext, {
            RequestId: requestId,
            ChatId: chatToken.chatId as string
        });

        return chatSession;
    }

    public async getConversationDetails(optionalParams: GetConversationDetailsOptionalParams = {}): Promise<LiveWorkItemDetails> {
        let requestId = this.requestId;
        let chatToken = this.chatToken;
        let chatId = chatToken.chatId as string;
        let reconnectId = this.reconnectId;
        let sessionId = this.sessionId;

        if (optionalParams.liveChatContext) {
            requestId = optionalParams.liveChatContext.requestId;
            chatToken = optionalParams.liveChatContext.chatToken;
            chatId = chatToken.chatId as string;
        }

        if (optionalParams.liveChatContext?.reconnectId) {
            reconnectId = optionalParams.liveChatContext.reconnectId;
        }

        if (optionalParams.liveChatContext?.sessionId) {
            sessionId = optionalParams.liveChatContext.sessionId;
            this.OCClient.sessionId = sessionId;
        }

        this.scenarioMarker.startScenario(TelemetryEvent.GetConversationDetails, {
            RequestId: requestId,
            ChatId: chatId || '',
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.GetConversationDetails);
        }

        const getLWIDetailsOptionalParams: IGetLWIDetailsOptionalParams = {};

        if (this.isPersistentChat && !this.chatSDKConfig.persistentChat?.disable && reconnectId) {
            getLWIDetailsOptionalParams.reconnectId = reconnectId as string;
        }

        if (this.isChatReconnect && !this.chatSDKConfig.chatReconnect?.disable && !this.isPersistentChat && reconnectId) {
            getLWIDetailsOptionalParams.reconnectId = reconnectId as string;
        }

        if (this.authenticatedUserToken) {
            getLWIDetailsOptionalParams.authenticatedUserToken = this.authenticatedUserToken;
        }

        try {
            const lwiDetails = await this.OCClient.getLWIDetails(requestId, getLWIDetailsOptionalParams);
            const { State: state, ConversationId: conversationId, AgentAcceptedOn: agentAcceptedOn, CanRenderPostChat: canRenderPostChat, ParticipantType: participantType } = lwiDetails;

            const liveWorkItemDetails: LiveWorkItemDetails = {
                state,
                conversationId
            };

            if (agentAcceptedOn) {
                liveWorkItemDetails.agentAcceptedOn = agentAcceptedOn;
            }

            if (canRenderPostChat) {
                liveWorkItemDetails.canRenderPostChat = canRenderPostChat;
            }

            if (participantType) {
                liveWorkItemDetails.participantType = participantType;
            }

            if (this.sessionId) {
                this.OCClient.sessionId = this.sessionId;
            }

            this.scenarioMarker.completeScenario(TelemetryEvent.GetConversationDetails, {
                RequestId: requestId,
                ChatId: chatId || '',
            });

            return liveWorkItemDetails;
        } catch (error) {
            const telemetryData = {
                RequestId: requestId,
                ChatId: chatId || ''
            };

            if (isClientIdNotFoundErrorMessage(error)) {
                exceptionThrowers.throwAuthContactIdNotFoundFailure(error, this.scenarioMarker, TelemetryEvent.GetConversationDetails, telemetryData);
            }

            exceptionSuppressors.suppressConversationDetailsRetrievalFailure(error, this.scenarioMarker, TelemetryEvent.GetConversationDetails, telemetryData);
        }

        return {} as LiveWorkItemDetails;
    }

    /**
     * Gets PreChat Survey.
     * @param parse Whether to parse PreChatSurvey to JSON or not.
     */
    public async getPreChatSurvey(parse = true): Promise<GetPreChatSurveyResponse> {
        this.scenarioMarker.startScenario(TelemetryEvent.GetPreChatSurvey);
        try {
            const result = parse ? JSON.parse(this.preChatSurvey) : this.preChatSurvey;
            this.scenarioMarker.completeScenario(TelemetryEvent.GetPreChatSurvey);
            return result;
        } catch {
            this.scenarioMarker.failScenario(TelemetryEvent.GetPreChatSurvey);
        }
    }

    public async getLiveChatConfig(optionalParams?: GetLiveChatConfigOptionalParams): Promise<ChatConfig> {
        if (!optionalParams || optionalParams.useRuntimeCache === true) {
            return this.liveChatConfig;
        }

        return this.getChatConfig({ sendCacheHeaders: optionalParams?.sendCacheHeaders || false });
    }

    public async getChatToken(cached = true, optionalParams?: GetChatTokenOptionalParams): Promise<IChatToken> {
        this.scenarioMarker.startScenario(TelemetryEvent.GetChatToken, {
            RequestId: this.requestId
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.GetChatToken);
        }

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

                if (optionalParams?.refreshToken === true) {
                    getChatTokenOptionalParams.refreshToken = optionalParams?.refreshToken;
                }

                const chatToken = await this.OCClient.getChatToken(this.requestId, getChatTokenOptionalParams);
                this.setChatToken(chatToken)
                this.scenarioMarker.completeScenario(TelemetryEvent.GetChatToken, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            } catch (error) {
                const telemetryData = {
                    RequestId: this.requestId,
                    ChatId: this.chatToken?.chatId as string,
                };

                if (isClientIdNotFoundErrorMessage(error)) {
                    exceptionThrowers.throwAuthContactIdNotFoundFailure(error, this.scenarioMarker, TelemetryEvent.GetChatToken, telemetryData);
                } else {
                    exceptionThrowers.throwChatTokenRetrievalFailure(error, this.scenarioMarker, TelemetryEvent.GetChatToken, telemetryData);
                }
            }
        } else {
            this.scenarioMarker.completeScenario(TelemetryEvent.GetChatToken, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });
        }

        return this.chatToken;
    }

    public setChatToken(chatToken: FetchChatTokenResponse): void {
        const { ChatId: chatId, Token: token, RegionGtms: regionGtms, ExpiresIn: expiresIn, VisitorId: visitorId, VoiceVideoCallToken: voiceVideoCallToken, ACSEndpoint: acsEndpoint, AttachmentConfiguration: attachmentConfiguration } = chatToken;
        this.chatToken = {
            chatId,
            regionGTMS: JSON.parse(regionGtms as string),
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

        if (this.OCClient.sessionId) {
            this.sessionId = this.OCClient.sessionId;
        }
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

    private async recordMessages(messages: OmnichannelMessage[] | ChatMessage[] | IMessage[]): Promise<void> {

        const baseProperties = {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string,
        };

        if (!messages || messages?.length === 0) {
            this.scenarioMarker?.singleRecord(TelemetryEvent.MessageReceived, {
                ...baseProperties,
                CustomProperties: "No messages received",
                Source: MessageSource.GetRestCall
            });
            return;
        }

        try {
            const messageList = messages.map(m => MessagePrinterFactory.printifyMessage(m, PrinterType.Omnichannel));
            this.scenarioMarker?.singleRecord(TelemetryEvent.MessageReceived, {
                ...baseProperties,
                CustomProperties: JSON.stringify(messageList),
                Source: MessageSource.GetRestCall
            });
        } catch (error) {
            // this is reachable when the chat is ended before all messages are recorded in telemetry
            console.warn(`Error while recording messages: ${error}`);
        }

    }

    public async getMessages(): Promise<GetMessagesResponse> {
        this.scenarioMarker.startScenario(TelemetryEvent.GetMessages, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.GetMessages);
        }

        try {
            const messages = await (this.conversation as (IConversation | ACSConversation))?.getMessages();
            this.recordMessages(messages);

            this.scenarioMarker.completeScenario(TelemetryEvent.GetMessages, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });

            return messages as GetMessagesResponse;
        } catch {
            this.scenarioMarker.failScenario(TelemetryEvent.GetMessages, {
                RequestId: this.requestId,
                ChatId: this.chatToken.chatId as string
            });
        }
    }

    public async getDataMaskingRules(): Promise<MaskingRules> {
        return this.dataMaskingRules;
    }

    private transformMessage(message: ChatSDKMessage): ChatSDKMessage {
        if (this.isMaskingDisabled) {
            return message;
        }
        let { content } = message;
        let match;

        for (const maskingRule of this.dataMaskingRules.rules) {
            const regex = new RegExp(maskingRule.regex, 'g');
            while ((match = regex.exec(content)) !== null) {
                const replaceStr = match[0].replace(/./g, this.maskingCharacter);
                content = content.replace(match[0], replaceStr);
            }
            match = null;
        }
        message.content = content;
        return message;
    }

    public async sendMessage(message: ChatSDKMessage): Promise<OmnichannelMessage | void> {
        this.scenarioMarker.startScenario(TelemetryEvent.SendMessages, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.SendMessages);
        }

        this.transformMessage(message);

        if (this.liveChatVersion === LiveChatVersion.V2) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sendMessageRequest: any = {
                content: message.content,
            }

            sendMessageRequest.metadata = {
                widgetId: this.omnichannelConfig.widgetId,
                clientMessageId: Date.now().toString()
            }

            if (message.metadata) {
                sendMessageRequest.metadata = { ...sendMessageRequest.metadata, ...message.metadata };
            }

            try {
                const chatMessage = await (this.conversation as ACSConversation)?.sendMessage(sendMessageRequest);

                this.scenarioMarker.completeScenario(TelemetryEvent.SendMessages, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });

                return chatMessage;
            } catch (error) {
                const exceptionDetails: ChatSDKExceptionDetails = {
                    response: ChatSDKErrorName.ChatSDKSendMessageFailed,
                    errorObject: `${error}`
                };
                this.scenarioMarker.failScenario(TelemetryEvent.SendMessages, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                throw new Error(ChatSDKErrorName.ChatSDKSendMessageFailed);
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
                    displayName: "Customer",
                    id: "customer",
                    type: PersonType.User
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
            } catch (error) {
                const exceptionDetails: ChatSDKExceptionDetails = {
                    response: ChatSDKErrorName.ChatSDKSendMessageFailed,
                    errorObject: `${error}`
                };
                this.scenarioMarker.failScenario(TelemetryEvent.SendMessages, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string,
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                throw new Error(ChatSDKErrorName.ChatSDKSendMessageFailed);
            }
        }
    }

    public async onNewMessage(onNewMessageCallback: CallableFunction, optionalParams: OnNewMessageOptionalParams = {}): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.OnNewMessage, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.OnNewMessage);
        }

        if (this.liveChatVersion === LiveChatVersion.V2) {
            const postedMessages = new Set();

            if (optionalParams?.rehydrate) {
                this.debug && console.log('[OmnichannelChatSDK][onNewMessage] rehydrate');
                const messages = await this.getMessages() as OmnichannelMessage[];
                for (const message of messages.reverse()) {
                    const { id } = message;
                    if (postedMessages.has(id)) {
                        continue;
                    }

                    postedMessages.add(id);
                    onNewMessageCallback(message);
                }
            }

            try {
                const registerOnNewMessageOptionalParams: ACSRegisterOnNewMessageOptionalParams = {
                    disablePolling: false
                };

                if (optionalParams?.pollingInterval) {
                    registerOnNewMessageOptionalParams.pollingInterval = optionalParams?.pollingInterval;
                }

                if (optionalParams?.disablePolling === true) {
                    registerOnNewMessageOptionalParams.disablePolling = optionalParams?.disablePolling;
                }

                (this.conversation as ACSConversation)?.registerOnNewMessage((event: ChatMessageReceivedEvent | ChatMessageEditedEvent) => {
                    const { id } = event;
                    const omnichannelMessage = createOmnichannelMessage(event, {
                        liveChatVersion: this.liveChatVersion,
                        debug: this.debug
                    });

                    if (!postedMessages.has(id)) {
                        onNewMessageCallback(omnichannelMessage);
                        postedMessages.add(id);
                    }
                }, registerOnNewMessageOptionalParams);

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

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.SendTypingEvent);
        }

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

                throw new Error('SendTypingFailure');
            }
        } else {
            const typingPayload = `{isTyping: 0}`;

            try {
                await (this.conversation as IConversation)!.indicateTypingStatus(0);
                const members: IPerson[] = await (this.conversation as IConversation)!.getMembers();
                const botMembers = members.filter((member: IPerson) => member.type === PersonType.Bot);
                await (this.conversation as IConversation)!.sendMessageToBot(botMembers[0].id, { payload: typingPayload });

                this.scenarioMarker.completeScenario(TelemetryEvent.SendTypingEvent, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });
            } catch (error) {
                this.scenarioMarker.failScenario(TelemetryEvent.SendTypingEvent, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                });

                throw new Error('SendTypingFailure');
            }
        }
    }

    public async onTypingEvent(onTypingEventCallback: CallableFunction): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.OnTypingEvent, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.OnTypingEvent);
        }

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
                    const { messageType } = message;

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

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.OnAgentEndSession);
        }

        if (this.liveChatVersion === LiveChatVersion.V2) {
            try {
                (this.conversation as ACSConversation).registerOnThreadUpdate(async (event: ParticipantsRemovedEvent) => {
                    const liveWorkItemDetails = await this.getConversationDetails();
                    if (Object.keys(liveWorkItemDetails).length === 0 || liveWorkItemDetails.state == LiveWorkItemState.WrapUp || liveWorkItemDetails.state == LiveWorkItemState.Closed) {
                        onAgentEndSessionCallback(event);
                        this.stopPolling();
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
        } else {
            try {
                this.conversation?.registerOnThreadUpdate((message: IRawThread) => {
                    const { members } = message;

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

    public async uploadFileAttachment(fileInfo: IFileInfo | File): Promise<UploadFileAttachmentResponse> {

        this.scenarioMarker.startScenario(TelemetryEvent.UploadFileAttachment, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.UploadFileAttachment);
        }

        if (this.liveChatVersion === LiveChatVersion.V2) {

            if (this.isAMSClientAllowed === false) {
                exceptionThrowers.throwFeatureDisabled(this.scenarioMarker, TelemetryEvent.UploadFileAttachment, "Enable support for attachment upload and receive in the widget configuration.");
            }
            const amsClient = await this.getAMSClient();

            if (amsClient === null || amsClient === undefined) {
                throwAMSLoadFailure(this.scenarioMarker, TelemetryEvent.UploadFileAttachment, "Attachment handler client is null, no action can be performed");
            }

            const createObjectResponse: any = await amsClient?.createObject(this.chatToken?.chatId as string, fileInfo as any);  // eslint-disable-line @typescript-eslint/no-explicit-any
            const documentId = createObjectResponse.id;
            const uploadDocumentResponse: any = await amsClient?.uploadDocument(documentId, fileInfo as any);  // eslint-disable-line @typescript-eslint/no-explicit-any

            const fileIdsProperty = {
                amsReferences: JSON.stringify([documentId]),
                amsreferences: JSON.stringify([documentId])
            };

            const fileMetaProperty = {
                amsMetadata: JSON.stringify([{
                    contentType: fileInfo.type,
                    fileName: fileInfo.name
                }])
            }

            const sendMessageRequest = {
                content: '',
                metadata: {
                    widgetId: this.omnichannelConfig.widgetId,
                    clientMessageId: Date.now().toString(),
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
            }

            return {} as OmnichannelMessage;
        }
    }

    public async downloadFileAttachment(fileMetadata: FileMetadata | IFileMetadata): Promise<Blob> {

        this.scenarioMarker.startScenario(TelemetryEvent.DownloadFileAttachment, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.DownloadFileAttachment);
        }

        if (this.liveChatVersion === LiveChatVersion.V2) {
            try {
                if (this.isAMSClientAllowed === false) {
                    this.scenarioMarker.failScenario(TelemetryEvent.DownloadFileAttachment, {
                        RequestId: this.requestId,
                        ChatId: this.chatToken.chatId as string,
                        ExceptionDetails: "AMSClient is disabled"
                    });
                    exceptionThrowers.throwFeatureDisabled(this.scenarioMarker, TelemetryEvent.DownloadFileAttachment, "Enable support for attachment upload and receive in the widget configuration.");
                }
                const amsClient = await this.getAMSClient();

                if (amsClient === null || amsClient === undefined) {
                    throwAMSLoadFailure(this.scenarioMarker, TelemetryEvent.DownloadFileAttachment, "Attachment handler is null, no action can be performed");
                }

                const response: any = await amsClient?.getViewStatus(fileMetadata);  // eslint-disable-line @typescript-eslint/no-explicit-any
                const { view_location } = response;
                const viewResponse: any = await amsClient?.getView(fileMetadata, view_location);  // eslint-disable-line @typescript-eslint/no-explicit-any
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

    public async emailLiveChatTranscript(body: ChatTranscriptBody, optionalParams: EmailLiveChatTranscriptOptionaParams = {}): Promise<void> {
        const emailTranscriptOptionalParams: IEmailTranscriptOptionalParams = {};

        let requestId = this.requestId;
        let chatToken = this.chatToken;
        let chatId = chatToken.chatId as string;
        let sessionId = this.sessionId;

        if (optionalParams.liveChatContext) {
            requestId = optionalParams.liveChatContext.requestId;
            chatToken = optionalParams.liveChatContext.chatToken;
            chatId = chatToken.chatId as string;
        }

        if (optionalParams.liveChatContext?.sessionId) {
            sessionId = optionalParams.liveChatContext.sessionId;
            this.OCClient.sessionId = sessionId;
        }

        this.scenarioMarker.startScenario(TelemetryEvent.EmailLiveChatTranscript, {
            RequestId: requestId,
            ChatId: chatId
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.EmailLiveChatTranscript);
        }

        try {
            if (this.authenticatedUserToken) {
                emailTranscriptOptionalParams.authenticatedUserToken = this.authenticatedUserToken;
            }

            const emailRequestBody = {
                ChatId: chatId,
                EmailAddress: body.emailAddress,
                DefaultAttachmentMessage: body.attachmentMessage,
                CustomerLocale: body.locale || getLocaleStringFromId(this.localeId)
            };

            await this.OCClient.emailTranscript(
                requestId,
                chatToken.token,
                emailRequestBody,
                emailTranscriptOptionalParams);

            if (this.sessionId) {
                this.OCClient.sessionId = this.sessionId;
            }

            this.scenarioMarker.completeScenario(TelemetryEvent.EmailLiveChatTranscript, {
                RequestId: requestId,
                ChatId: chatId
            });

        } catch (error) {
            console.error(`OmnichannelChatSDK/emailLiveChatTranscript/error: ${error}`);
            this.scenarioMarker.failScenario(TelemetryEvent.EmailLiveChatTranscript, {
                RequestId: requestId,
                ChatId: chatId
            });
        }
    }

    public async getLiveChatTranscript(optionalParams: GetLiveChatTranscriptOptionalParams = {}): Promise<GetLiveChatTranscriptResponse> {
        const getChatTranscriptOptionalParams: IGetChatTranscriptsOptionalParams = {};

        let requestId = this.requestId;
        let chatToken = this.chatToken;
        let chatId = chatToken.chatId as string;
        let sessionId = this.sessionId;

        if (optionalParams.liveChatContext) {
            if (this.isPersistentChat && !this.chatSDKConfig.persistentChat?.disable) {
                requestId = this.requestId || optionalParams.liveChatContext.requestId;
                chatToken = this.chatToken && Object.keys(this.chatToken).length > 0 ? this.chatToken : optionalParams.liveChatContext.chatToken;
            } else {
                requestId = optionalParams.liveChatContext.requestId;
                chatToken = optionalParams.liveChatContext.chatToken;
            }
            chatId = chatToken.chatId as string;
        }

        if (optionalParams.liveChatContext?.sessionId) {
            sessionId = optionalParams.liveChatContext.sessionId;
            this.OCClient.sessionId = sessionId;
        }

        this.scenarioMarker.startScenario(TelemetryEvent.GetLiveChatTranscript, {
            RequestId: requestId,
            ChatId: chatId
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.GetLiveChatTranscript);
        }

        try {
            if (this.authenticatedUserToken) {
                getChatTranscriptOptionalParams.authenticatedUserToken = this.authenticatedUserToken;
            }

            // by definition, OCSDK returns a string (JSON)
            const transcriptResponse = await this.OCClient.getChatTranscripts(
                requestId,
                chatToken.chatId,
                chatToken.token,
                getChatTranscriptOptionalParams);

            if (this.sessionId) {
                this.OCClient.sessionId = this.sessionId;
            }

            this.scenarioMarker.completeScenario(TelemetryEvent.GetLiveChatTranscript, {
                RequestId: requestId,
                ChatId: chatId
            });

            return transcriptResponse;

        } catch (error) {
            const telemetryData = {
                RequestId: requestId,
                ChatId: chatId
            };

            exceptionThrowers.throwLiveChatTranscriptRetrievalFailure(error, this.scenarioMarker, TelemetryEvent.GetLiveChatTranscript, telemetryData);
        }
    }

    public async createChatAdapter(optionalParams: ChatAdapterOptionalParams = {}): Promise<ChatAdapter> {

        if (platform.isNode() || platform.isReactNative()) {
            return Promise.reject('ChatAdapter is only supported on browser');
        }

        const { protocol } = optionalParams;
        const supportedChatAdapterProtocols = [ChatAdapterProtocols.ACS, ChatAdapterProtocols.IC3, ChatAdapterProtocols.DirectLine];
        if (protocol && !supportedChatAdapterProtocols.includes(protocol as string)) {
            return Promise.reject(`ChatAdapter for protocol ${protocol} currently not supported`);
        }

        if (protocol === ChatAdapterProtocols.DirectLine) {

            return createDirectLine(optionalParams, this.chatSDKConfig, this.liveChatVersion, ChatAdapterProtocols.DirectLine, this.telemetry as typeof AriaTelemetry, this.scenarioMarker);
        } else if (protocol === ChatAdapterProtocols.ACS || this.liveChatVersion === LiveChatVersion.V2) {
            const options = {
                fileScan: optionalParams.ACSAdapter?.fileScan
            };

            const fileManager = new AMSFileManager(this.AMSClient as FramedClient, this.acsAdapterLogger, options);
            return createACSAdapter(optionalParams, this.chatSDKConfig, this.liveChatVersion, ChatAdapterProtocols.ACS, this.telemetry as typeof AriaTelemetry, this.scenarioMarker, this.omnichannelConfig, this.chatToken, fileManager, this.ACSClient?.getChatClient() as ChatClient, this.acsAdapterLogger as ACSAdapterLogger);

        } else if (protocol === ChatAdapterProtocols.IC3 || this.liveChatVersion === LiveChatVersion.V1) {
            return createIC3Adapter(optionalParams, this.chatSDKConfig, this.liveChatVersion, ChatAdapterProtocols.IC3, this.telemetry as typeof AriaTelemetry, this.scenarioMarker, this.chatToken, this.IC3Client, this.ic3ClientLogger as IC3ClientLogger);
        }

        return Promise.reject(`ChatAdapter for protocol ${protocol} currently not supported`);
    }

    public isVoiceVideoCallingEnabled(): boolean {
        return this.callingOption.toString() !== CallingOptionsOptionSetNumber.NoCalling.toString();
    }

    public async getVoiceVideoCalling(voiceVideoCallingOptionalParams: VoiceVideoCallingOptionalParams = {}): Promise<GetVoiceVideoCallingResponse> {
        this.scenarioMarker.startScenario(TelemetryEvent.GetVoiceVideoCalling);

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.GetVoiceVideoCalling);
        }

        if (platform.isNode() || platform.isReactNative()) {
            const message = "VoiceVideoCalling is only supported on browser";
            exceptionThrowers.throwUnsupportedPlatform(this.scenarioMarker, TelemetryEvent.GetVoiceVideoCalling, message);
        }

        if (!this.isVoiceVideoCallingEnabled()) {
            const message = "Voice and video call is not enabled";
            exceptionThrowers.throwFeatureDisabled(this.scenarioMarker, TelemetryEvent.GetVoiceVideoCalling, message);
        }

        const chatConfig = await this.getLiveChatConfig();
        const { LiveWSAndLiveChatEngJoin: liveWSAndLiveChatEngJoin } = chatConfig;
        const { msdyn_widgetsnippet } = liveWSAndLiveChatEngJoin;

        // Find src attribute with its url in code snippet
        const widgetSnippetSourceRegex = new RegExp(`src="(https:\\/\\/[\\w-.]+)[\\w-.\\/]+"`);
        const result = msdyn_widgetsnippet.match(widgetSnippetSourceRegex);
        if (result && result.length) {
            return new Promise(async (resolve) => { // eslint-disable-line no-async-promise-executor
                // When there is new calling version, release new omni-channel chat sdk version with updated calling version
                const LiveChatWidgetLibCDNUrl = `${result[1]}/livechatwidget/v2scripts/callingsdk/${callingBundleVersion}/CallingBundle.js`;

                this.telemetry?.setCDNPackages({
                    VoiceVideoCalling: LiveChatWidgetLibCDNUrl
                });

                const defaultParams = {
                    logger: this.callingSdkLogger
                };

                await loadScript(LiveChatWidgetLibCDNUrl, async () => {
                    this.debug && console.debug(`${LiveChatWidgetLibCDNUrl} loaded!`);
                    const VoiceVideoCalling = await createVoiceVideoCalling({ ...voiceVideoCallingOptionalParams, ...defaultParams });

                    this.scenarioMarker.completeScenario(TelemetryEvent.GetVoiceVideoCalling);

                    VoiceVideoCalling.useScenarioMarker(this.scenarioMarker);

                    resolve(VoiceVideoCalling);
                }, async () => {
                    const exceptionDetails = {
                        response: "VoiceVideoCallingLoadFailed",
                        message: "Failed to load VoiceVideoCalling"
                    };

                    this.scenarioMarker.failScenario(TelemetryEvent.GetVoiceVideoCalling, {
                        ExceptionDetails: JSON.stringify(exceptionDetails)
                    });

                    throw new Error(exceptionDetails.response);
                });
            });
        }
    }

    public async getPostChatSurveyContext(): Promise<PostChatContext> { // eslint-disable-line @typescript-eslint/no-explicit-any
        this.scenarioMarker.startScenario(TelemetryEvent.GetPostChatSurveyContext, {
            RequestId: this.requestId,
            ChatId: this.chatToken?.chatId as string,
        });

        if (!this.isInitialized) {
            exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.GetPostChatSurveyContext);
        }

        let conversationId;

        try {
            const chatConfig: ChatConfig = this.liveChatConfig;
            const { LiveWSAndLiveChatEngJoin: liveWSAndLiveChatEngJoin } = chatConfig;
            const { msdyn_postconversationsurveyenable, msfp_sourcesurveyidentifier, msfp_botsourcesurveyidentifier, postConversationSurveyOwnerId, postConversationBotSurveyOwnerId, msdyn_surveyprovider } = liveWSAndLiveChatEngJoin;

            if (parseLowerCaseString(msdyn_postconversationsurveyenable) === "true") {
                const liveWorkItemDetails = await this.getConversationDetails();
                if (Object.keys(liveWorkItemDetails).length === 0) {
                    this.scenarioMarker.failScenario(TelemetryEvent.GetPostChatSurveyContext, {
                        RequestId: this.requestId,
                        ChatId: this.chatToken?.chatId as string,
                        ExceptionDetails: "GetPostChatSurveyContext : LiveWorkItemDetails is null."
                    });
                    return Promise.reject("GetPostChatSurveyContext : LiveWorkItemDetails is null.");
                }

                const participantJoined = parseLowerCaseString(liveWorkItemDetails?.canRenderPostChat as string) === "true";
                const participantType = liveWorkItemDetails?.participantType;

                conversationId = liveWorkItemDetails?.conversationId;

                const agentSurveyInviteLinkRequest = {
                    "SurveyProvider": msdyn_surveyprovider,
                    "WidgetId": this.omnichannelConfig.widgetId,
                    "FormId": msfp_sourcesurveyidentifier,
                    "ConversationId": conversationId,
                    "OCLocaleCode": getLocaleStringFromId(this.localeId)
                };

                const botSurveyInviteLinkRequest = {
                    "SurveyProvider": msdyn_surveyprovider,
                    "WidgetId": this.omnichannelConfig.widgetId,
                    "FormId": msfp_botsourcesurveyidentifier,
                    "ConversationId": conversationId,
                    "OCLocaleCode": getLocaleStringFromId(this.localeId)
                };

                const optionalParams: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
                    "requestId": this.requestId
                };

                if (this.authenticatedUserToken) {
                    optionalParams.authenticatedUserToken = this.authenticatedUserToken;
                }

                const agentSurveyInviteLinkResponse = await this.OCClient.getSurveyInviteLink(postConversationSurveyOwnerId, agentSurveyInviteLinkRequest, optionalParams);
                const botSurveyInviteLinkResponse = postConversationBotSurveyOwnerId && msfp_botsourcesurveyidentifier &&
                    await this.OCClient.getSurveyInviteLink(postConversationBotSurveyOwnerId, botSurveyInviteLinkRequest, optionalParams);

                let agentSurveyInviteLink, agentFormsProLocale, botSurveyInviteLink, botFormsProLocale;
                if (agentSurveyInviteLinkResponse != null) {
                    if (agentSurveyInviteLinkResponse.inviteList != null && agentSurveyInviteLinkResponse.inviteList.length == 1) {
                        agentSurveyInviteLink = agentSurveyInviteLinkResponse.inviteList[0].invitationLink;
                    } else {
                        this.scenarioMarker.failScenario(TelemetryEvent.GetPostChatSurveyContext, {
                            ConversationId: conversationId,
                            RequestId: this.requestId,
                            ChatId: this.chatToken?.chatId as string,
                            ExceptionDetails: "Survey Invite link failed to send response."
                        });
                        return Promise.reject("Survey Invite link failed to send response.");
                    }

                    if (agentSurveyInviteLinkResponse.formsProLocaleCode != null) {
                        agentFormsProLocale = agentSurveyInviteLinkResponse.formsProLocaleCode;
                    }

                    if (botSurveyInviteLinkResponse != null) {
                        if (botSurveyInviteLinkResponse.inviteList != null && botSurveyInviteLinkResponse.inviteList.length == 1) {
                            botSurveyInviteLink = botSurveyInviteLinkResponse.inviteList[0].invitationLink;
                        }

                        if (botSurveyInviteLinkResponse.formsProLocaleCode != null) {
                            botFormsProLocale = botSurveyInviteLinkResponse.formsProLocaleCode;
                        }
                    }

                    const postChatContext: PostChatContext = {
                        participantJoined,
                        participantType,
                        surveyInviteLink: agentSurveyInviteLink,
                        botSurveyInviteLink,
                        formsProLocale: agentFormsProLocale,
                        botFormsProLocale
                    }
                    this.scenarioMarker.completeScenario(TelemetryEvent.GetPostChatSurveyContext, {
                        RequestId: this.requestId,
                        ChatId: this.chatToken?.chatId as string
                    });

                    return Promise.resolve(postChatContext);
                } else {
                    this.scenarioMarker.failScenario(TelemetryEvent.GetPostChatSurveyContext, {
                        ConversationId: conversationId,
                        RequestId: this.requestId,
                        ChatId: this.chatToken?.chatId as string,
                        ExceptionDetails: "surveyInviteLinkResponse is null."
                    });
                    return Promise.reject("surveyInviteLinkResponse is null.");
                }
            } else {
                this.scenarioMarker.failScenario(TelemetryEvent.GetPostChatSurveyContext, {
                    RequestId: this.requestId,
                    ChatId: this.chatToken?.chatId as string,
                    ExceptionDetails: "Post Chat Survey is disabled. Please check the Omnichannel Administration Portal."
                });
                return Promise.reject("Post Chat is disabled from admin side.");
            }
        } catch (ex) {
            this.scenarioMarker.failScenario(TelemetryEvent.GetPostChatSurveyContext, {
                ConversationId: conversationId ?? "",
                RequestId: this.requestId,
                ChatId: this.chatToken?.chatId as string,
                ExceptionDetails: JSON.stringify(ex)
            });

            return Promise.reject("Retrieving post chat context failed " + JSON.stringify(ex));
        }
    }

    public async getAgentAvailability(optionalParams: GetAgentAvailabilityOptionalParams = {}): Promise<GetAgentAvailabilityResponse> {
        const reportError = (response: string, message: string, chatId = "") => {
            const exceptionDetails: ChatSDKExceptionDetails = {
                response,
                message
            };

            this.scenarioMarker.failScenario(TelemetryEvent.GetAgentAvailability, {
                RequestId: this.requestId,
                ExceptionDetails: JSON.stringify(exceptionDetails),
                ChatId: chatId
            });

            throw new Error(exceptionDetails.message);
        }

        this.scenarioMarker.startScenario(TelemetryEvent.GetAgentAvailability, {
            RequestId: this.requestId
        });

        if (!this.isInitialized) {
            reportError("UninitializedChatSDK", "Chat SDK is not initialized.");
        }

        if (this.conversation) {
            reportError("InvalidOperation", "GetAgentAvailability can only be called before a chat has started.", this.chatToken.chatId as string);
        }

        let getAgentAvailabilityOptionalParams: IGetQueueAvailabilityOptionalParams = {
            initContext: {} as InitContext
        };

        getAgentAvailabilityOptionalParams = this.populateInitChatOptionalParam(getAgentAvailabilityOptionalParams, optionalParams, TelemetryEvent.GetAgentAvailability);

        try {
            const response = await this.OCClient.getAgentAvailability(this.requestId, getAgentAvailabilityOptionalParams);
            this.scenarioMarker.completeScenario(TelemetryEvent.GetAgentAvailability, {
                RequestId: this.requestId
            });
            return response;
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reportError("GetAgentAvailabilityFailed", (e as any).message as string);
        }
    }

    public async startPolling(): Promise<void> {
        return startPolling(this.isInitialized, this.scenarioMarker, this.liveChatVersion, this.requestId, this.chatToken.chatId as string, this.conversation as ACSConversation);
    }

    public async stopPolling(): Promise<void> {
        return stopPolling(this.isInitialized, this.scenarioMarker, this.liveChatVersion, this.requestId, this.chatToken.chatId as string, this.conversation as ACSConversation);
    }

    private populateInitChatOptionalParam = (requestOptionalParams: ISessionInitOptionalParams | IGetQueueAvailabilityOptionalParams, optionalParams: StartChatOptionalParams | GetAgentAvailabilityOptionalParams, telemetryEvent: TelemetryEvent) => {
        requestOptionalParams.initContext!.locale = getLocaleStringFromId(this.localeId);

        if (optionalParams?.customContext) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const context: any = optionalParams?.customContext;
            if (typeof context === "object") {
                for (const key in context) {
                    if (context[key].value === null || context[key].value === undefined || context[key].value === "") {
                        delete context[key];
                    }
                }
            }
            (requestOptionalParams.initContext! as any).customContextData = optionalParams?.customContext; // eslint-disable-line @typescript-eslint/no-explicit-any
        }

        if (optionalParams.browser) {
            requestOptionalParams.initContext!.browser = optionalParams.browser;
        }

        if (optionalParams.os) {
            requestOptionalParams.initContext!.os = optionalParams.os;
        }

        if (optionalParams.locale) {
            requestOptionalParams.initContext!.locale = optionalParams.locale;
        }

        if (optionalParams.device) {
            requestOptionalParams.initContext!.device = optionalParams.device;
        }

        if (optionalParams.preChatResponse) {
            requestOptionalParams.initContext!.preChatResponse = optionalParams.preChatResponse;
        }

        if (optionalParams.portalContactId) {
            requestOptionalParams.initContext!.portalcontactid = optionalParams.portalContactId;
        }

        if (optionalParams.sendDefaultInitContext) {
            if (platform.isNode() || platform.isReactNative()) {
                const message = "sendDefaultInitContext is only supported on browser";
                const telemetryData = {
                    RequestId: this.requestId,
                    ChatId: this.chatToken.chatId as string
                };

                exceptionThrowers.throwUnsupportedPlatform(this.scenarioMarker, telemetryEvent, message, telemetryData);
            }

            requestOptionalParams.getContext = true;
        }

        // Override initContext completely
        if (optionalParams.initContext) {
            requestOptionalParams.initContext = optionalParams.initContext;
        }

        if (this.authenticatedUserToken) {
            requestOptionalParams.authenticatedUserToken = this.authenticatedUserToken;
        }

        if (this.chatToken.chatId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (requestOptionalParams as any).initContext.chatId = this.chatToken.chatId;
        }

        return requestOptionalParams;
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
            return new Promise(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
                const ic3ClientCDNUrl = this.resolveIC3ClientUrl();

                this.telemetry?.setCDNPackages({
                    IC3Client: ic3ClientCDNUrl
                });

                this.scenarioMarker.startScenario(TelemetryEvent.GetIC3Client);

                if (this.IC3SDKProvider) {
                    const IC3Client = await (this.IC3SDKProvider as any).getSDK({ // eslint-disable-line @typescript-eslint/no-explicit-any
                        hostType: HostType.IFrame,
                        protocolType: ProtocolType.IC3V1SDK,
                        logger: this.ic3ClientLogger as any // eslint-disable-line @typescript-eslint/no-explicit-any
                    });

                    return resolve(IC3Client);
                }

                window.addEventListener("ic3:sdk:load", async () => {
                    // Use FramedBridge from IC3Client
                    /* istanbul ignore next */
                    this.debug && console.debug('ic3:sdk:load');
                    const { SDK: ic3sdk } = window.Microsoft.CRM.Omnichannel.IC3Client;
                    const { SDKProvider: IC3SDKProvider } = ic3sdk;
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

    private async setPrechatConfigurations(liveWSAndLiveChatEngJoin: LiveWSAndLiveChatEngJoin): Promise<void> {

        const isPreChatEnabled = parseLowerCaseString(liveWSAndLiveChatEngJoin.msdyn_prechatenabled) === "true";

        if (isPreChatEnabled && liveWSAndLiveChatEngJoin.PreChatSurvey && liveWSAndLiveChatEngJoin.PreChatSurvey.trim().length > 0) {
            this.preChatSurvey = liveWSAndLiveChatEngJoin.PreChatSurvey;
            /* istanbul ignore next */
            this.debug && console.log('Prechat Survey!');
        }
    }

    private async setDataMaskingConfiguration(dataMaskingConfig: DataMaskingInfo): Promise<void> {

        if (dataMaskingConfig.setting.msdyn_maskforcustomer) {
            if (dataMaskingConfig.dataMaskingRules) {
                for (const [key, value] of Object.entries(dataMaskingConfig.dataMaskingRules)) {
                    this.dataMaskingRules.rules.push({
                        id: key,
                        regex: value
                    } as MaskingRule);
                }
            }
        }
    }

    private async setAuthSettingConfig(authSettings: AuthSettings): Promise<void> {

        if (authSettings) {
            this.authSettings = authSettings;
        }

        if (this.authSettings && this.chatSDKConfig.getAuthToken) {
            await this.setAuthTokenProvider(this.chatSDKConfig.getAuthToken, { throwError: false }); // throwError set to 'false` for backward compatibility
        }
    }

    private async setPersistentChatConfiguration(liveWSAndLiveChatEngJoin: LiveWSAndLiveChatEngJoin): Promise<void> {
        const isChatReconnectEnabled = parseLowerCaseString(liveWSAndLiveChatEngJoin.msdyn_enablechatreconnect) === "true";
        if (liveWSAndLiveChatEngJoin.msdyn_conversationmode?.toString() === ConversationMode.PersistentChat.toString()) {
            this.isPersistentChat = true;
        }

        if (isChatReconnectEnabled && !this.isPersistentChat) {
            this.isChatReconnect = true;
        }
    }

    private async setLocaleIdConfiguration(chatWidgetLanguage: ChatWidgetLanguage): Promise<void> {

        this.localeId = chatWidgetLanguage.msdyn_localeid || defaultLocaleId;
    }

    private async setCallingOptionConfiguration(liveWSAndLiveChatEngJoin: LiveWSAndLiveChatEngJoin): Promise<void> {
        const { msdyn_callingoptions } = liveWSAndLiveChatEngJoin;
        this.callingOption = msdyn_callingoptions?.trim().length > 0 ? Number(msdyn_callingoptions) : CallingOptionsOptionSetNumber.NoCalling;
    }

    private async setLiveChatVersionConfiguration(liveChatVersion: number): Promise<void> {
        this.liveChatVersion = liveChatVersion || LiveChatVersion.V2;
    }

    private async getChatConfig(optionalParams: GetLiveChatConfigOptionalParams = {}): Promise<ChatConfig> {
        const { sendCacheHeaders } = optionalParams;
        const bypassCache = sendCacheHeaders === true;

        let liveChatConfig;

        try {

            liveChatConfig = await this.OCClient.getChatConfig(this.requestId, bypassCache);
            this.liveChatConfig = liveChatConfig;
            this.evaluateAMSAvailability();
            this.buildConfigurations(liveChatConfig);
            /* istanbul ignore next */
            this.debug && console.log(`[OmnichannelChatSDK][getChatConfig][liveChatVersion] ${this.liveChatVersion}`);
            return this.liveChatConfig;

        } catch (error) {
            // Fallback on orgUrl which got converted to Core Services orgUrl
            if (isCoreServicesOrgUrlDNSError(error, this.coreServicesOrgUrl, this.dynamicsLocationCode)) { // eslint-disable-line @typescript-eslint/no-explicit-any
                this.omnichannelConfig.orgUrl = this.unqServicesOrgUrl as string;
                this.OCClient = await OCSDKProvider.getSDK(this.omnichannelConfig as IOmnichannelConfiguration, createOcSDKConfiguration(false) as ISDKConfiguration, this.ocSdkLogger as OCSDKLogger);
                liveChatConfig = await this.OCClient.getChatConfig(this.requestId, bypassCache); // Bubble up error by default to throw ChatConfigRetrievalFailure
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((error as any).response?.headers?.errorcode && parseInt((error as any).response.headers.errorcode) === OmnichannelErrorCodes.WidgetNotFound) {
                    console.warn("No widget with the given app id is present in the system.");
                }
                throw error // Bubble up error by default to throw ChatConfigRetrievalFailure
            }
        }
        return this.liveChatConfig;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async buildConfigurations(liveChatConfig: any): Promise<void> {

        const {
            DataMaskingInfo: dataMaskingConfig,
            LiveChatConfigAuthSettings: authSettings,
            LiveWSAndLiveChatEngJoin: liveWSAndLiveChatEngJoin,
            LiveChatVersion: liveChatVersion,
            ChatWidgetLanguage: chatWidgetLanguage
        } = liveChatConfig;

        Promise.all([
            this.setDataMaskingConfiguration(dataMaskingConfig),
            this.setPrechatConfigurations(liveWSAndLiveChatEngJoin),
            this.setAuthSettingConfig(authSettings),
            this.setPersistentChatConfiguration(liveWSAndLiveChatEngJoin),
            this.setCallingOptionConfiguration(liveWSAndLiveChatEngJoin),
            this.setLocaleIdConfiguration(chatWidgetLanguage),
            this.setLiveChatVersionConfiguration(liveChatVersion)
        ]);
    }

    private resolveIC3ClientUrl(): string {
        return urlResolvers.resolveIC3ClientUrl(this.chatSDKConfig);
    }

    private resolveChatAdapterUrl(protocol: string): string {
        return urlResolvers.resolveChatAdapterUrl(this.chatSDKConfig, this.liveChatVersion, protocol);
    }

    private async updateChatToken(newToken: string, newRegionGTMS: IRegionGtms): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.UpdateChatToken, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        })

        try {
            if (this.liveChatVersion === LiveChatVersion.V1) {
                const sessionInfo: IInitializationInfo = {
                    token: newToken,
                    regionGtms: newRegionGTMS,
                    visitor: true
                };

                await this.IC3Client.initialize(sessionInfo);
            }

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
        }
    }

    private async setAuthTokenProvider(provider: ChatSDKConfig["getAuthToken"], optionalParams: SetAuthTokenProviderOptionalParams = {}): Promise<void> {
        this.scenarioMarker.startScenario(TelemetryEvent.GetAuthToken);

        this.chatSDKConfig.getAuthToken = provider;
        if (this.chatSDKConfig.getAuthToken) {
            try {
                const token = await this.chatSDKConfig.getAuthToken();

                if (token) {
                    this.authenticatedUserToken = token;
                    this.scenarioMarker.completeScenario(TelemetryEvent.GetAuthToken);
                } else {
                    const exceptionDetails = {
                        response: ChatSDKErrorName.UndefinedAuthToken
                    };

                    if (optionalParams?.throwError) {
                        throw Error(exceptionDetails.response);
                    }

                    // Fail scenario only if error is not thrown then bubbled up
                    this.scenarioMarker.failScenario(TelemetryEvent.GetAuthToken, {
                        ExceptionDetails: JSON.stringify(exceptionDetails)
                    });
                }
            } catch (error) {
                const exceptionDetails = {
                    response: ChatSDKErrorName.GetAuthTokenFailed as string
                };

                if ((error as Error).message == ChatSDKErrorName.UndefinedAuthToken) {
                    exceptionDetails.response = (error as Error).message;
                }

                this.scenarioMarker.failScenario(TelemetryEvent.GetAuthToken, {
                    ExceptionDetails: JSON.stringify(exceptionDetails)
                });

                if (optionalParams?.throwError) {
                    throw Error(exceptionDetails.response);
                }
            }
        } else {
            const exceptionDetails = {
                response: ChatSDKErrorName.GetAuthTokenNotFound
            };

            this.scenarioMarker.failScenario(TelemetryEvent.GetAuthToken, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            if (optionalParams?.throwError) {
                throw Error(exceptionDetails.response);
            }
        }
    }

    private useCoreServicesOrgUrlIfNotSet(): void {
        /* Perform orgUrl conversion to CoreServices only if orgUrl is not a CoreServices orgUrl.
         * Feature should be enabled by default. `createCoreServicesOrgUrlAtRuntime` set to `false`
         * would disable the orgUrl conversion and should only be used as fallback only.
         */
        if (!isCoreServicesOrgUrl(this.omnichannelConfig.orgUrl) && !(this.chatSDKConfig.internalConfig?.createCoreServicesOrgUrlAtRuntime === false)) {
            const result = unqOrgUrlPattern.exec(this.omnichannelConfig.orgUrl);
            if (result) {
                this.dynamicsLocationCode = result[1];
                const geoName = getCoreServicesGeoName(this.dynamicsLocationCode);
                if (geoName) {
                    this.unqServicesOrgUrl = this.omnichannelConfig.orgUrl;
                    this.coreServicesOrgUrl = createCoreServicesOrgUrl(this.omnichannelConfig.orgId, geoName);
                    this.omnichannelConfig.orgUrl = this.coreServicesOrgUrl;
                }
            }
        }
    }
}

export default OmnichannelChatSDK;