import LiveChatVersion from "../core/LiveChatVersion";
import { ACSConversation } from "../core/messaging/ACSClient";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";
import exceptionThrowers from "../utils/exceptionThrowers";

/**
 * On demand command to stop polling messages from `chatSDK.onNewMessage()` subscribers to not overload server.
 *
 * @param isInitialized Whether Chat SDK has been initialized
 * @param scenarioMarker Scenario Marker object
 * @param liveChatVersion Live Chat version
 * @param requestId Request Id
 * @param chatId Chat Id
 * @param conversation ACS Conversation object
 */
const stopPolling = async (isInitialized: boolean, scenarioMarker: ScenarioMarker, liveChatVersion: number, requestId: string, chatId: string, conversation: ACSConversation | null): Promise<void> => {
    scenarioMarker.startScenario(TelemetryEvent.StopPolling);

    if (!isInitialized) {
        exceptionThrowers.throwUninitializedChatSDK(scenarioMarker, TelemetryEvent.StopPolling);
    }

    if (liveChatVersion === LiveChatVersion.V2) {
        try {
            await conversation?.stopPolling();
            scenarioMarker.completeScenario(TelemetryEvent.StopPolling);
        } catch (error) {
            const exceptionDetails = {
                errorObject: `${error}`
            };

            scenarioMarker.failScenario(TelemetryEvent.StopPolling, {
                RequestId: requestId,
                ChatId: chatId as string,
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });
        }
    }
}

export default stopPolling;