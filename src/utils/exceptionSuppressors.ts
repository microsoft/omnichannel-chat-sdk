/**
 * Utilities to suppress exception on failures in ChatSDK.
 *
 * It should catch an exception, then silently fail. Not every exception thrown should be known by the user.
 *
 * An exception details object would be logged in telemetry with ChatSDK standard errors as response with the exception object if any.
 *
 * If a longer message needs to displayed to the user, a console.error() would be preferred.
 *
 * Stack trace should only be logged and not printed.
 */

import { ChatSDKErrorName } from "../core/ChatSDKError";
import ChatSDKExceptionDetails from "../core/ChatSDKExceptionDetails";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";

export const suppressChatSDKError = (chatSDKError: ChatSDKErrorName, e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string} = {}, message = ""): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: chatSDKError
    };

    if (e) {
        exceptionDetails.errorObject = `${e}`;
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ...telemetryData,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    if (message) {
        exceptionDetails.message = message;
        console.error(message);
    }
}

export const suppressConversationDetailsRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string} = {}): void => {
    suppressChatSDKError(ChatSDKErrorName.ConversationDetailsRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData);
}

export default {
    suppressChatSDKError,
    suppressConversationDetailsRetrievalFailure
}