import { ACSAdapterLogger, IC3ClientLogger } from "./loggers";
import ACSParticipantDisplayName from "../core/messaging/ACSParticipantDisplayName";
import AMSFileManager from "../external/ACSAdapter/AMSFileManager";
import AriaTelemetry from "../telemetry/AriaTelemetry";
import ChatAdapterOptionalParams from "../core/messaging/ChatAdapterOptionalParams";
import { ChatClient } from "@azure/communication-chat";
import ChatSDKConfig from "../core/ChatSDKConfig";
import createChannelDataEgressMiddleware from "../external/ACSAdapter/createChannelDataEgressMiddleware";
import createFormatEgressTagsMiddleware from "../external/ACSAdapter/createFormatEgressTagsMiddleware";
import createFormatIngressTagsMiddleware from "../external/ACSAdapter/createFormatIngressTagsMiddleware";
import IChatToken from "../external/IC3Adapter/IChatToken";
import IIC3AdapterOptions from "../external/IC3Adapter/IIC3AdapterOptions";
import LiveChatVersion from "../core/LiveChatVersion";
import { loadScript } from "./WebUtils";
import OmnichannelConfig from "../core/OmnichannelConfig";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";
import urlResolvers from "./urlResolvers";

const createDirectLine = async (optionalParams: ChatAdapterOptionalParams, chatSDKConfig: ChatSDKConfig, liveChatVersion: LiveChatVersion, protocol: string, telemetry: typeof AriaTelemetry, scenarioMarker: ScenarioMarker): Promise<unknown> => {
    const options = optionalParams.DirectLine? optionalParams.DirectLine.options: {};
    const directLineCDNUrl = urlResolvers.resolveChatAdapterUrl(chatSDKConfig, liveChatVersion, protocol);

    telemetry?.setCDNPackages({
        DirectLine: directLineCDNUrl
    });

    scenarioMarker.startScenario(TelemetryEvent.CreateDirectLine);

    try {
        await loadScript(directLineCDNUrl);
    } catch {
        scenarioMarker.failScenario(TelemetryEvent.CreateDirectLine);
        throw new Error('Failed to load DirectLine');
    }

    try {
        const {DirectLine} = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        const adapter = new DirectLine.DirectLine({...options});
        scenarioMarker.completeScenario(TelemetryEvent.CreateDirectLine);
        return adapter;
    } catch {
        scenarioMarker.failScenario(TelemetryEvent.CreateDirectLine);
        throw new Error('Failed to create DirectLine');
    }
};

const createACSAdapter = async (optionalParams: ChatAdapterOptionalParams, chatSDKConfig: ChatSDKConfig, liveChatVersion: LiveChatVersion, protocol: string, telemetry: typeof AriaTelemetry, scenarioMarker: ScenarioMarker, omnichannelConfig: OmnichannelConfig, chatToken: IChatToken, fileManager: AMSFileManager, chatClient: ChatClient, logger: ACSAdapterLogger): Promise<unknown> => {
    const options = optionalParams.ACSAdapter? optionalParams.ACSAdapter.options: {};
    const acsAdapterCDNUrl = urlResolvers.resolveChatAdapterUrl(chatSDKConfig, liveChatVersion, protocol);

    telemetry?.setCDNPackages({
        ACSAdapter: acsAdapterCDNUrl
    });

    // Tags formatting middlewares are required to be the last in the pipeline to ensure tags are converted to the right format
    const defaultEgressMiddlewares = [createChannelDataEgressMiddleware({widgetId: omnichannelConfig.widgetId}), createFormatEgressTagsMiddleware()];
    const defaultIngressMiddlewares = [createFormatIngressTagsMiddleware()];
    const egressMiddleware = options?.egressMiddleware? [...options.egressMiddleware, ...defaultEgressMiddlewares]: [...defaultEgressMiddlewares];
    const ingressMiddleware = options?.ingressMiddleware? [...options.egressMiddleware, ...defaultIngressMiddlewares]: [...defaultIngressMiddlewares];
    const featuresOption = {
        enableAdaptiveCards: true, // Whether to enable adaptive card payload in adapter (payload in JSON string)
        enableThreadMemberUpdateNotification: true, // Whether to enable chat thread member join/leave notification
        enableLeaveThreadOnWindowClosed: false, // Whether to remove user on browser close event
        ...options, // overrides
        ingressMiddleware,
        egressMiddleware
    };

    scenarioMarker.startScenario(TelemetryEvent.CreateACSAdapter);

    try {
        await loadScript(acsAdapterCDNUrl);
    } catch {
        scenarioMarker.failScenario(TelemetryEvent.CreateACSAdapter);
        throw new Error('Failed to load ACSAdapter');
    }

    try {
        const { ChatAdapter } = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        const adapter = ChatAdapter.createACSAdapter(
            chatToken.token as string,
            chatToken.visitorId || 'teamsvisitor',
            chatToken.chatId as string,
            chatToken.acsEndpoint as string,
            fileManager,
            30000,
            ACSParticipantDisplayName.Customer,
            chatClient,
            logger,
            featuresOption,
        );

        scenarioMarker.completeScenario(TelemetryEvent.CreateACSAdapter);
        return adapter;
    } catch {
        scenarioMarker.failScenario(TelemetryEvent.CreateACSAdapter);
        throw new Error('Failed to create ACSAdapter');
    }
};

const createIC3Adapter = async (optionalParams: ChatAdapterOptionalParams, chatSDKConfig: ChatSDKConfig, liveChatVersion: LiveChatVersion, protocol: string, telemetry: typeof AriaTelemetry, scenarioMarker: ScenarioMarker, chatToken: IChatToken, ic3Client: any, logger: IC3ClientLogger): Promise<unknown> => { // eslint-disable-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
    const options = optionalParams.IC3Adapter? optionalParams.IC3Adapter.options: {};
    const ic3AdapterCDNUrl = urlResolvers.resolveChatAdapterUrl(chatSDKConfig, liveChatVersion, protocol);

    telemetry?.setCDNPackages({
        IC3Adapter: ic3AdapterCDNUrl
    });

    scenarioMarker.startScenario(TelemetryEvent.CreateIC3Adapter);

    try {
        await loadScript(ic3AdapterCDNUrl);
    } catch {
        scenarioMarker.failScenario(TelemetryEvent.CreateIC3Adapter);
        throw new Error('Failed to load IC3Adapter');
    }

    const adapterConfig: IIC3AdapterOptions = {
        chatToken: chatToken,
        userDisplayName: 'Customer',
        userId: chatToken.visitorId || 'teamsvisitor',
        sdkURL: urlResolvers.resolveIC3ClientUrl(chatSDKConfig),
        sdk: ic3Client,
        ...options // overrides
    };

    try {
        const adapter = new window.Microsoft.BotFramework.WebChat.IC3Adapter(adapterConfig);
        adapter.logger = logger;
        scenarioMarker.completeScenario(TelemetryEvent.CreateIC3Adapter);
        return adapter;
    } catch {
        scenarioMarker.failScenario(TelemetryEvent.CreateIC3Adapter);
        throw new Error('Failed to create IC3Adapter');
    }
};

export default {
    createDirectLine,
    createACSAdapter,
    createIC3Adapter
};

export {
    createDirectLine,
    createACSAdapter,
    createIC3Adapter
};