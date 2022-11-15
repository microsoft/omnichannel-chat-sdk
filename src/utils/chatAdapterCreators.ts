import AriaTelemetry from "../telemetry/AriaTelemetry";
import ChatAdapterOptionalParams from "../core/messaging/ChatAdapterOptionalParams";
import ChatSDKConfig from "../core/ChatSDKConfig";
import LiveChatVersion from "../core/LiveChatVersion";
import { loadScript } from "./WebUtils";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";
import urlResolvers from "./urlResolvers";

const createDirectLine = (optionalParams: ChatAdapterOptionalParams = {}, chatSDKConfig: ChatSDKConfig, liveChatVersion: LiveChatVersion, protocol: string, telemetry: typeof AriaTelemetry, scenarioMarker: ScenarioMarker): Promise<unknown> => {
    return new Promise (async (resolve) => { // eslint-disable-line no-async-promise-executor
        const options = optionalParams.DirectLine? optionalParams.DirectLine.options: {};

        const directLineCDNUrl = urlResolvers.resolveChatAdapterUrl(chatSDKConfig, liveChatVersion, protocol);

        telemetry?.setCDNPackages({
            DirectLine: directLineCDNUrl
        });

        scenarioMarker.startScenario(TelemetryEvent.CreateDirectLine);

        await loadScript(directLineCDNUrl, () => {
            try {
                const {DirectLine} = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                const adapter = new DirectLine.DirectLine({...options});

                scenarioMarker.completeScenario(TelemetryEvent.CreateDirectLine);

                resolve(adapter);
            } catch {
                throw new Error('Failed to load DirectLine');
            }
        }, () => {
            scenarioMarker.failScenario(TelemetryEvent.CreateDirectLine);
            throw new Error('Failed to load DirectLine');
        });
    });
};

export default {
    createDirectLine
};

export {
    createDirectLine
};