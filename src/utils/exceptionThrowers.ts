/**
 * Utilities to throw exception on failures in ChatSDK.
 *
 * It should throw ChatSDK standard errors as response with the exception object if any.
 *
 * The error thrown should have a short message in CamelCase to allow the exception to be caught easily programmatically.
 *
 * If a longer message needs to displayed to the user, a console.error() would be preferred.
 */
import ChatSDKErrors from "../core/ChatSDKErrors";
import ChatSDKExceptionDetails from "../core/ChatSDKExceptionDetails";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";

export const throwUnsupportedPlatform = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, message: string, telemetryData: {[key: string]: string} = {}): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.UnsupportedPlatform,
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ...telemetryData,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    if (message) {
        exceptionDetails.message = message;
        console.error(message);
    }

    throw Error(exceptionDetails.response);
};

export const throwFeatureDisabled = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, message: string): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.FeatureDisabled,
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    if (message) {
        exceptionDetails.message = message;
        console.error(message);
    }

    throw Error(exceptionDetails.response);
};

export const throwOmnichannelClientInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.OmnichannelClientInitializationFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwChatConfigRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.ChatConfigRetrievalFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwUnsupportedLiveChatVersionFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.UnsupportedLiveChatVersion,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwMessagingClientCreationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.MessagingClientCreationFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwUninitializedChatSDK = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.UninitializedChatSDK,
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwChatTokenRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.ChatTokenRetrievalFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ...telemetryData,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
}

export const throwInvalidConversation = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.InvalidConversation
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ...telemetryData,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    console.error(`Conversation not found`);
    throw Error(exceptionDetails.response);
};

export const throwClosedConversation = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.ClosedConversation
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ...telemetryData,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwAuthenticatedChatConversationRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.AuthenticatedChatConversationRetrievalFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ...telemetryData,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwPersistentChatConversationRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.PersistentChatConversationRetrievalFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ...telemetryData,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwWidgetUseOutsideOperatingHour = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.WidgetUseOutsideOperatingHour,
        message: 'Widget used outside of operating hours',
        errorObject: `${e}`
    };

    scenarioMarker.failScenario(telemetryEvent, {
        ...telemetryData,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    console.log(exceptionDetails.message);
    throw Error(exceptionDetails.response);
};

export const throwConversationInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.ConversationInitializationFailure,
        errorObject: `${e}`
    };

    scenarioMarker.failScenario(telemetryEvent, {
        ...telemetryData,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwConversationClosureFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.ConversationClosureFailure,
        errorObject: `${e}`
    };

    scenarioMarker.failScenario(telemetryEvent, {
        ...telemetryData,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwMessagingClientInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.MessagingClientInitializationFailure,
        errorObject: `${e}`
    };

    scenarioMarker.failScenario(telemetryEvent, {
        ...telemetryData,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwMessagingClientConversationJoinFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails: ChatSDKExceptionDetails = {
        response: ChatSDKErrors.MessagingClientConversationJoinFailure,
        errorObject: `${e}`
    };

    scenarioMarker.failScenario(telemetryEvent, {
        ...telemetryData,
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export default {
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
    throwMessagingClientConversationJoinFailure
}