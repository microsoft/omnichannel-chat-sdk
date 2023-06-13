/**
 * Utilities to throw exception on failures in ChatSDK.
 *
 * It should throw ChatSDK standard errors as response with the exception object if any.
 *
 * The error thrown should have a short message in CamelCase to allow the exception to be caught easily programmatically.
 *
 * If a longer message needs to displayed to the user, a console.error() would be preferred.
 *
 * Stack trace should only be logged and not printed.
 */

import ChatSDKErrors from "../core/ChatSDKErrors";
import ChatSDKExceptionDetails from "../core/ChatSDKExceptionDetails";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";

export const throwChatSDKError = (chatSDKError: ChatSDKErrors, e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string} = {}, message = "", reject?: any): void => {
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

    if (reject) {
        reject(exceptionDetails.response)
    } else {
        throw new Error(exceptionDetails.response);
    }
}

export const throwScriptLoadFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.ScriptLoadFailure, e, scenarioMarker, telemetryEvent, reject = reject);
};

export const throwUnsupportedPlatform = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, message: string, telemetryData: {[key: string]: string} = {}, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.UnsupportedPlatform, undefined, scenarioMarker, telemetryEvent, telemetryData, message, reject = reject);
};

export const throwFeatureDisabled = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, message: string, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.FeatureDisabled, undefined, scenarioMarker, telemetryEvent, {}, message, reject = reject);
};

export const throwOmnichannelClientInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.OmnichannelClientInitializationFailure, e, scenarioMarker, telemetryEvent, reject = reject);
};

export const throwChatConfigRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.ChatConfigRetrievalFailure, e, scenarioMarker, telemetryEvent, reject = reject);
};

export const throwUnsupportedLiveChatVersionFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.UnsupportedLiveChatVersion, e, scenarioMarker, telemetryEvent, reject = reject)
};

export const throwMessagingClientCreationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.MessagingClientCreationFailure, e, scenarioMarker, telemetryEvent, reject = reject)
};

export const throwUninitializedChatSDK = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.UninitializedChatSDK, undefined, scenarioMarker, telemetryEvent, reject = reject)
};

export const throwChatTokenRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.ChatTokenRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData, reject = reject);
}

export const throwInvalidConversation = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}, reject?: any): void => {
    const message = `Conversation not found`;
    throwChatSDKError(ChatSDKErrors.InvalidConversation, undefined, scenarioMarker, telemetryEvent, telemetryData, message, reject = reject);
};

export const throwClosedConversation = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.ClosedConversation, undefined, scenarioMarker, telemetryEvent, telemetryData, reject = reject);
};

export const throwAuthenticatedChatConversationRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.AuthenticatedChatConversationRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData, reject = reject);
};

export const throwPersistentChatConversationRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.PersistentChatConversationRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData, reject = reject);
};

export const throwWidgetUseOutsideOperatingHour = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}, reject?: any): void => {
    const message = 'Widget used outside of operating hours';
    throwChatSDKError(ChatSDKErrors.WidgetUseOutsideOperatingHour, e, scenarioMarker, telemetryEvent, telemetryData, message, reject = reject);
};

export const throwConversationInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.ConversationInitializationFailure, e, scenarioMarker, telemetryEvent, telemetryData, reject = reject);
};

export const throwConversationClosureFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.ConversationClosureFailure, e, scenarioMarker, telemetryEvent, telemetryData, reject = reject);
};

export const throwMessagingClientInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.MessagingClientInitializationFailure, e, scenarioMarker, telemetryEvent, telemetryData, reject = reject);
};

export const throwMessagingClientConversationJoinFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.MessagingClientConversationJoinFailure, e, scenarioMarker, telemetryEvent, telemetryData, reject = reject);
};

export const throwChatAdapterInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.ChatAdapterInitializationFailure, e, scenarioMarker, telemetryEvent, reject = reject);
};

export const throwLiveChatTranscriptRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.LiveChatTranscriptRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData, reject = reject);
}

export const throwAuthContactIdNotFoundFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}, reject?: any): void => {
    throwChatSDKError(ChatSDKErrors.AuthContactIdNotFoundFailure, e, scenarioMarker, telemetryEvent, telemetryData, reject = reject);
}

export default {
    throwChatSDKError,
    throwScriptLoadFailure,
    throwUnsupportedPlatform,
    throwFeatureDisabled,
    throwOmnichannelClientInitializationFailure,
    throwUnsupportedLiveChatVersionFailure,
    throwChatConfigRetrievalFailure,
    throwMessagingClientCreationFailure,
    throwUninitializedChatSDK,
    throwChatTokenRetrievalFailure,
    throwInvalidConversation,
    throwClosedConversation,
    throwAuthenticatedChatConversationRetrievalFailure,
    throwPersistentChatConversationRetrievalFailure,
    throwWidgetUseOutsideOperatingHour,
    throwConversationInitializationFailure,
    throwConversationClosureFailure,
    throwMessagingClientInitializationFailure,
    throwMessagingClientConversationJoinFailure,
    throwChatAdapterInitializationFailure,
    throwLiveChatTranscriptRetrievalFailure,
    throwAuthContactIdNotFoundFailure
}