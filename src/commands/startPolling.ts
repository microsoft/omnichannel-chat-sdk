import IConversation from "@microsoft/omnichannel-ic3core/lib/model/IConversation";
import LiveChatVersion from "../core/LiveChatVersion";
import { ACSConversation } from "../core/messaging/ACSClient";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";
import exceptionThrowers from "../utils/exceptionThrowers";

const startPolling = (isInitialized: boolean, scenarioMarker: ScenarioMarker, liveChatVersion: number, requestId: string, chatId: string, conversation: ACSConversation | null) => {
    scenarioMarker.startScenario(TelemetryEvent.StartPolling);
    
    if (!isInitialized) {
        exceptionThrowers.throwUninitializedChatSDK(scenarioMarker, TelemetryEvent.StartPolling);
    }

    if (liveChatVersion === LiveChatVersion.V2) {
        try {
            conversation?.startPolling();
            scenarioMarker.completeScenario(TelemetryEvent.StartPolling);
        } catch (error) {
            const exceptionDetails = {
                errorObject: `${error}`
            };

            scenarioMarker.failScenario(TelemetryEvent.StartPolling, {
                RequestId: requestId,
                ChatId: chatId as string,
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });
        }
    }
}

export default startPolling;