import { ChatSDKErrorName } from "../core/ChatSDKError";
import LiveChatVersion from "../core/LiveChatVersion";
import exceptionThrowers from "../utils/exceptionThrowers";

const throwUnsupportedLiveChatVersionFailureIfApplicable = (liveChatVersion: number) => {
    const supportedLiveChatVersions = [LiveChatVersion.V1, LiveChatVersion.V2];
    if (!supportedLiveChatVersions.includes(liveChatVersion)) {
        exceptionThrowers.throwUnsupportedLiveChatVersionFailure(new Error(ChatSDKErrorName.UnsupportedLiveChatVersion), this.scenarioMarker, TelemetryEvent.InitializeChatSDK);
    }
};

export default throwUnsupportedLiveChatVersionFailureIfApplicable;