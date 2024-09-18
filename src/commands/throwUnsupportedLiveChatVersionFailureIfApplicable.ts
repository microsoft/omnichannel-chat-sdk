import { ChatSDKErrorName } from "../core/ChatSDKError";
import LiveChatVersion from "../core/LiveChatVersion";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";
import exceptionThrowers from "../utils/exceptionThrowers";

const throwUnsupportedLiveChatVersionFailureIfApplicable = (liveChatVersion: number, scenarioMarker: ScenarioMarker) => {
    const supportedLiveChatVersions = [LiveChatVersion.V1, LiveChatVersion.V2];
    if (!supportedLiveChatVersions.includes(liveChatVersion)) {
        exceptionThrowers.throwUnsupportedLiveChatVersionFailure(new Error(ChatSDKErrorName.UnsupportedLiveChatVersion), scenarioMarker, TelemetryEvent.InitializeChatSDK);
    }
};

export default throwUnsupportedLiveChatVersionFailureIfApplicable;