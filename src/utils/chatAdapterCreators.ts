import AriaTelemetry from "../telemetry/AriaTelemetry";
import ChatAdapterOptionalParams from "../core/messaging/ChatAdapterOptionalParams";
import ChatSDKConfig from "../core/ChatSDKConfig";
import LiveChatVersion from "../core/LiveChatVersion";
import { loadScript } from "./WebUtils";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";
import urlResolvers from "./urlResolvers";

const createDirectLine = async (optionalParams: ChatAdapterOptionalParams = {}, chatSDKConfig: ChatSDKConfig, liveChatVersion: LiveChatVersion, protocol: string, telemetry: typeof AriaTelemetry, scenarioMarker: ScenarioMarker): Promise<unknown> => {
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

export default {
    createDirectLine
};

export {
    createDirectLine
};