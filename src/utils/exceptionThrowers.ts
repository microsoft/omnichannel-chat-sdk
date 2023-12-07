/**
 * Utilities to throw exception on failures in ChatSDK.
 *
 * It should throw ChatSDK standard errors.
 *
 * An exception details object would be logged in telemetry with ChatSDK standard errors as response with the exception object if any.
 *
 * The error thrown should have a short message in CamelCase to allow the exception to be caught easily programmatically.
 *
 * If a longer message needs to displayed to the user, a console.error() would be preferred.
 *
 * Stack trace should only be logged and not printed.
 */

import { ChatSDKErrorName, ChatSDKError } from "../core/ChatSDKError";
import ChatSDKExceptionDetails from "../core/ChatSDKExceptionDetails";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";

export const throwChatSDKError = (chatSDKError: ChatSDKErrorName, e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string} = {}, message = ""): void => {
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

    throw new ChatSDKError(
        chatSDKError,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((e as any)?.isAxiosError && (e as any)?.response?.status) ? (e as any)?.response?.status : undefined
    );
}

export const throwScriptLoadFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrorName.ScriptLoadFailure, e, scenarioMarker, telemetryEvent);
};

export const throwUnsupportedPlatform = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, message: string, telemetryData: {[key: string]: string} = {}): void => {
    throwChatSDKError(ChatSDKErrorName.UnsupportedPlatform, undefined, scenarioMarker, telemetryEvent, telemetryData, message);
};

export const throwFeatureDisabled = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, message: string): void => {
    throwChatSDKError(ChatSDKErrorName.FeatureDisabled, undefined, scenarioMarker, telemetryEvent, {}, message);
};

export const throwOmnichannelClientInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrorName.OmnichannelClientInitializationFailure, e, scenarioMarker, telemetryEvent);
};

export const throwChatConfigRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrorName.ChatConfigRetrievalFailure, e, scenarioMarker, telemetryEvent);
};

export const throwUnsupportedLiveChatVersionFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrorName.UnsupportedLiveChatVersion, e, scenarioMarker, telemetryEvent)
};

export const throwMessagingClientCreationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrorName.MessagingClientCreationFailure, e, scenarioMarker, telemetryEvent)
};

export const throwUninitializedChatSDK = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrorName.UninitializedChatSDK, undefined, scenarioMarker, telemetryEvent)
};

export const throwChatTokenRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrorName.ChatTokenRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData);
}

export const throwInvalidConversation = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const message = `Conversation not found`;
    throwChatSDKError(ChatSDKErrorName.InvalidConversation, undefined, scenarioMarker, telemetryEvent, telemetryData, message);
};

export const throwClosedConversation = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrorName.ClosedConversation, undefined, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwAuthenticatedChatConversationRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrorName.AuthenticatedChatConversationRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwPersistentChatConversationRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrorName.PersistentChatConversationRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwWidgetUseOutsideOperatingHour = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const message = 'Widget used outside of operating hours';
    throwChatSDKError(ChatSDKErrorName.WidgetUseOutsideOperatingHour, e, scenarioMarker, telemetryEvent, telemetryData, message);
};

export const throwConversationInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrorName.ConversationInitializationFailure, e, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwConversationClosureFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrorName.ConversationClosureFailure, e, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwMessagingClientInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrorName.MessagingClientInitializationFailure, e, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwMessagingClientConversationJoinFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrorName.MessagingClientConversationJoinFailure, e, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwChatAdapterInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrorName.ChatAdapterInitializationFailure, e, scenarioMarker, telemetryEvent);
};

export const throwLiveChatTranscriptRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrorName.LiveChatTranscriptRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData);
}

export const throwAuthContactIdNotFoundFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrorName.AuthContactIdNotFoundFailure, e, scenarioMarker, telemetryEvent, telemetryData);
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