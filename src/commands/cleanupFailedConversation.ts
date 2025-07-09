import { ChatSDKError, ChatSDKErrorName } from "../core/ChatSDKError";
import ChatSDKConfig from "../core/ChatSDKConfig";
import ChatSDKExceptionDetails from "../core/ChatSDKExceptionDetails";
import ISessionCloseOptionalParams from "@microsoft/ocsdk/lib/Interfaces/ISessionCloseOptionalParams";
import StartChatOptionalParams from "../core/StartChatOptionalParams";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";

/**
 * Cleans up failed conversations after MessagingClientConversationJoinFailure errors
 * to prevent orphaned conversations in CRM.
 * 
 * @param error The error that occurred during conversation joining
 * @param scenarioMarker Scenario Marker object for telemetry
 * @param chatSDKConfig Chat SDK configuration
 * @param reconnectId Reconnect ID if this is a reconnect scenario
 * @param authenticatedUserToken Authenticated user token for session close
 * @param OCClient OC Client for API calls (typed as any due to external SDK)
 * @param requestId Request ID for session close
 * @param liveChatContext Live chat context if provided
 */
const cleanupFailedConversation = async (
    error: Error,
    scenarioMarker: ScenarioMarker,
    chatSDKConfig: ChatSDKConfig,
    reconnectId: string | null,
    authenticatedUserToken: string | null,
    OCClient: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    requestId: string,
    liveChatContext?: StartChatOptionalParams['liveChatContext']
): Promise<void> => {
    scenarioMarker.startScenario(TelemetryEvent.CleanupFailedStartchat);

    const isLivechatContextPresent = Boolean(liveChatContext && Object.keys(liveChatContext).length > 0);
    const isReconnectIdPresent = Boolean(reconnectId && reconnectId.trim().length > 0);

    /**
     * Only cleanup if it's a MessagingClientConversationJoinFailure on a freshly created conversation
     *
     * DO NOT continue if:
     * - The error is not a ChatSDKError or not related to conversation join failure
     * - The conversation is not freshly created (i.e., if `useCreateConversation` is disabled)
     * - The conversation was previously created (i.e., if `isLivechatContextPresent` is true)
     * - The error is related to a reconnect attempt (i.e., if `isReconnectIdPresent` is true)
     */

    if (!(error instanceof ChatSDKError &&
        error?.message === ChatSDKErrorName.MessagingClientConversationJoinFailure &&
        !chatSDKConfig.useCreateConversation?.disable &&
        !isLivechatContextPresent &&
        !isReconnectIdPresent)) {
        return;
    }

    try {
        const sessionCloseOptionalParams: ISessionCloseOptionalParams = {};
        if (authenticatedUserToken) {
            sessionCloseOptionalParams.authenticatedUserToken = authenticatedUserToken;
        }

        await OCClient.sessionClose(requestId, sessionCloseOptionalParams);

        scenarioMarker.completeScenario(TelemetryEvent.CleanupFailedStartchat);

    } catch (cleanupError) {
        // No need to throw an error, it should be contained here.
        // Log cleanup failure following the same ExceptionDetails pattern as exceptionThrowers
        const exceptionDetails: ChatSDKExceptionDetails = {
            response: 'ConversationCleanupFailure',
            message: 'Failed to cleanup conversation after join failure',
            errorObject: String(cleanupError)
        };

        scenarioMarker.failScenario(TelemetryEvent.CleanupFailedStartchat, {
            ExceptionDetails: JSON.stringify(exceptionDetails)
        });

        // Don't rethrow the cleanup error to avoid masking the original error
    }
};

export default cleanupFailedConversation;