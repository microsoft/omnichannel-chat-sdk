import { ACSAdapterLogger } from "./loggers";
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
        throw new Error('Failed to load DirectLine');
    }

    try {
        const {DirectLine} = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        const adapter = new DirectLine.DirectLine({...options});
        scenarioMarker.completeScenario(TelemetryEvent.CreateDirectLine);
        return adapter;
    } catch {
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
        throw new Error('Failed to create ACSAdapter');
    }
};

export default {
    createDirectLine,
    createACSAdapter
};

export {
    createDirectLine,
    createACSAdapter
};