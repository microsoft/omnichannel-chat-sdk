/* eslint-disable @typescript-eslint/no-explicit-any */
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

import ChatSDKErrors from "../core/ChatSDKErrors";
import ChatSDKExceptionDetails from "../core/ChatSDKExceptionDetails";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";

class CustomChatSDKError {
    public message: string;
    public httpResponseStatusCode: number | undefined;

    constructor(message: string, httpResponseStatusCode?: number) {
        this.message = message;
        this.httpResponseStatusCode = httpResponseStatusCode;
    }

    toString(): string {
        return this.message;
    }
}

export const throwChatSDKError = (chatSDKError: ChatSDKErrors, e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string} = {}, message = ""): void => {
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

    throw new CustomChatSDKError(
        exceptionDetails.response,
        ((e as any)?.isAxiosError && (e as any)?.response?.status) ? (e as any)?.response?.status : undefined
    );
}

export const throwScriptLoadFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrors.ScriptLoadFailure, e, scenarioMarker, telemetryEvent);
};

export const throwUnsupportedPlatform = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, message: string, telemetryData: {[key: string]: string} = {}): void => {
    throwChatSDKError(ChatSDKErrors.UnsupportedPlatform, undefined, scenarioMarker, telemetryEvent, telemetryData, message);
};

export const throwFeatureDisabled = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, message: string): void => {
    throwChatSDKError(ChatSDKErrors.FeatureDisabled, undefined, scenarioMarker, telemetryEvent, {}, message);
};

export const throwOmnichannelClientInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrors.OmnichannelClientInitializationFailure, e, scenarioMarker, telemetryEvent);
};

export const throwChatConfigRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrors.ChatConfigRetrievalFailure, e, scenarioMarker, telemetryEvent);
};

export const throwUnsupportedLiveChatVersionFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrors.UnsupportedLiveChatVersion, e, scenarioMarker, telemetryEvent)
};

export const throwMessagingClientCreationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrors.MessagingClientCreationFailure, e, scenarioMarker, telemetryEvent)
};

export const throwUninitializedChatSDK = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrors.UninitializedChatSDK, undefined, scenarioMarker, telemetryEvent)
};

export const throwChatTokenRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrors.ChatTokenRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData);
}

export const throwInvalidConversation = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const message = `Conversation not found`;
    throwChatSDKError(ChatSDKErrors.InvalidConversation, undefined, scenarioMarker, telemetryEvent, telemetryData, message);
};

export const throwClosedConversation = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrors.ClosedConversation, undefined, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwAuthenticatedChatConversationRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrors.AuthenticatedChatConversationRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwPersistentChatConversationRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrors.PersistentChatConversationRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwWidgetUseOutsideOperatingHour = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const message = 'Widget used outside of operating hours';
    throwChatSDKError(ChatSDKErrors.WidgetUseOutsideOperatingHour, e, scenarioMarker, telemetryEvent, telemetryData, message);
};

export const throwConversationInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrors.ConversationInitializationFailure, e, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwConversationClosureFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrors.ConversationClosureFailure, e, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwMessagingClientInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrors.MessagingClientInitializationFailure, e, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwMessagingClientConversationJoinFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrors.MessagingClientConversationJoinFailure, e, scenarioMarker, telemetryEvent, telemetryData);
};

export const throwChatAdapterInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    throwChatSDKError(ChatSDKErrors.ChatAdapterInitializationFailure, e, scenarioMarker, telemetryEvent);
};

export const throwLiveChatTranscriptRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrors.LiveChatTranscriptRetrievalFailure, e, scenarioMarker, telemetryEvent, telemetryData);
}

export const throwAuthContactIdNotFoundFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    throwChatSDKError(ChatSDKErrors.AuthContactIdNotFoundFailure, e, scenarioMarker, telemetryEvent, telemetryData);
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