import { ACSAdapterLogger, IC3ClientLogger } from "./loggers";

import ACSParticipantDisplayName from "../core/messaging/ACSParticipantDisplayName";
import AMSFileManager from "../external/ACSAdapter/AMSFileManager";
import AriaTelemetry from "../telemetry/AriaTelemetry";
import ChatAdapterOptionalParams from "../core/messaging/ChatAdapterOptionalParams";
import { ChatClient } from "@azure/communication-chat";
import ChatSDKConfig from "../core/ChatSDKConfig";
import IChatToken from "../external/IC3Adapter/IChatToken";
import LiveChatVersion from "../core/LiveChatVersion";
import OmnichannelConfig from "../core/OmnichannelConfig";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";
import WebUtils from "./WebUtils";
import createChannelDataEgressMiddleware from "../external/ACSAdapter/createChannelDataEgressMiddleware";
import createFileScanIngressMiddleware from "../external/ACSAdapter/createFileScanIngressMiddleware";
import createFormatEgressTagsMiddleware from "../external/ACSAdapter/createFormatEgressTagsMiddleware";
import createFormatIngressTagsMiddleware from "../external/ACSAdapter/createFormatIngressTagsMiddleware";
import exceptionThrowers from "./exceptionThrowers";
import urlResolvers from "./urlResolvers";

const createDirectLine = async (optionalParams: ChatAdapterOptionalParams, chatSDKConfig: ChatSDKConfig, liveChatVersion: LiveChatVersion, protocol: string, telemetry: typeof AriaTelemetry, scenarioMarker: ScenarioMarker): Promise<unknown> => {
    const options = optionalParams.DirectLine? optionalParams.DirectLine.options: {};
    const directLineCDNUrl = urlResolvers.resolveChatAdapterUrl(chatSDKConfig, liveChatVersion, protocol);

    telemetry?.setCDNPackages({
        DirectLine: directLineCDNUrl
    });

    scenarioMarker.startScenario(TelemetryEvent.CreateDirectLine);

    try {
        await WebUtils.loadScript(directLineCDNUrl);
    } catch (error) {
        exceptionThrowers.throwScriptLoadFailure(error, scenarioMarker, TelemetryEvent.CreateDirectLine);
    }

    try {
        const {DirectLine} = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        const adapter = new DirectLine.DirectLine({...options});
        scenarioMarker.completeScenario(TelemetryEvent.CreateDirectLine);
        return adapter;
    } catch (error) {
        exceptionThrowers.throwChatAdapterInitializationFailure(error, scenarioMarker, TelemetryEvent.CreateDirectLine)
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
    let defaultIngressMiddlewares = [createFormatIngressTagsMiddleware()];

    if (optionalParams.ACSAdapter?.fileScan?.disabled === false) {
        defaultIngressMiddlewares = [createFileScanIngressMiddleware(), ...defaultIngressMiddlewares];
    }

    const egressMiddleware = options?.egressMiddleware? [...options.egressMiddleware, ...defaultEgressMiddlewares]: [...defaultEgressMiddlewares];
    const ingressMiddleware = options?.ingressMiddleware? [...options.ingressMiddleware, ...defaultIngressMiddlewares]: [...defaultIngressMiddlewares];
    const featuresOption = {
        enableAdaptiveCards: true, // Whether to enable adaptive card payload in adapter (payload in JSON string)
        enableThreadMemberUpdateNotification: true, // Whether to enable chat thread member join/leave notification
        enableLeaveThreadOnWindowClosed: false, // Whether to remove user on browser close event
        enableSenderDisplayNameInTypingNotification: true, // Whether to send sender display name in typing notification
        ...options, // overrides
        ingressMiddleware,
        egressMiddleware
    };

    scenarioMarker.startScenario(TelemetryEvent.CreateACSAdapter);

    try {
        await WebUtils.loadScript(acsAdapterCDNUrl);
    } catch (error) {
        exceptionThrowers.throwScriptLoadFailure(error, scenarioMarker, TelemetryEvent.CreateACSAdapter);
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
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            { notifyErrorEvent: () => {} }, // Passing empty callback for now for backward compatibility
            ACSParticipantDisplayName.Customer,
            chatClient,
            logger,
            featuresOption,
        );

        scenarioMarker.completeScenario(TelemetryEvent.CreateACSAdapter);

        if (optionalParams.ACSAdapter?.fileScan?.disabled === false) {
            if (adapter.end) {
                const {end} = adapter;
                adapter.end = () => {
                    adapter.fileManager.fileScanner.end()
                    end();
                }
            }

            (window as any).chatAdapter = adapter;  // eslint-disable-line @typescript-eslint/no-explicit-any
        }

        return adapter;
    } catch (error) {
        exceptionThrowers.throwChatAdapterInitializationFailure(error, scenarioMarker, TelemetryEvent.CreateACSAdapter)
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