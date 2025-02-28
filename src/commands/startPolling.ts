import LiveChatVersion from "../core/LiveChatVersion";
import { ACSConversation } from "../core/messaging/ACSClient";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";
import exceptionThrowers from "../utils/exceptionThrowers";

/**
 * On demand command to start polling messages from `chatSDK.onNewMessage()` subscribers when polling was previously halted.
 * 
 * @param isInitialized Whether Chat SDK has been initialized
 * @param scenarioMarker Scenario Marker object
 * @param liveChatVersion Live Chat version
 * @param requestId Request Id
 * @param chatId Chat Id
 * @param conversation ACS Conversation object
 */
const startPolling = async (isInitialized: boolean, scenarioMarker: ScenarioMarker, liveChatVersion: number, requestId: string, chatId: string, conversation: ACSConversation | null): Promise<void> => {
    scenarioMarker.startScenario(TelemetryEvent.StartPolling);
    
    if (!isInitialized) {
        exceptionThrowers.throwUninitializedChatSDK(scenarioMarker, TelemetryEvent.StartPolling);
    }

    if (liveChatVersion === LiveChatVersion.V2) {
        try {
            await conversation?.startPolling();
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