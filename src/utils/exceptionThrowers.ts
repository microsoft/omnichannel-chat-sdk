import ChatSDKErrors from "../core/ChatSDKErrors";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";

export const throwOmnichannelClientInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.OmnichannelClientInitializationFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwChatConfigRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.ChatConfigRetrievalFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwUnsupportedLiveChatVersionFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.UnsupportedLiveChatVersion,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwMessagingClientCreationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.MessagingClientCreationFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwUninitializedChatSDK = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.UninitializedChatSDK,
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwChatTokenRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails = {
        ...telemetryData,
        response: ChatSDKErrors.ChatTokenRetrievalFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
}

export const throwInvalidConversation = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails = {
        ...telemetryData,
        response: ChatSDKErrors.InvalidConversation
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    console.error(`Conversation not found`);
    throw Error(exceptionDetails.response);
};

export const throwClosedConversation = (scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails = {
        ...telemetryData,
        response: ChatSDKErrors.ClosedConversation
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwAuthenticatedChatConversationRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails = {
        ...telemetryData,
        response: ChatSDKErrors.AuthenticatedChatConversationRetrievalFailure
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwPersistentChatConversationRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent, telemetryData: {[key: string]: string}): void => {
    const exceptionDetails = {
        ...telemetryData,
        response: ChatSDKErrors.PersistentChatConversationRetrievalFailure
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export default {
    throwOmnichannelClientInitializationFailure,
    throwUnsupportedLiveChatVersionFailure,
    throwChatConfigRetrievalFailure,
    throwMessagingClientCreationFailure,
    throwUninitializedChatSDK,
    throwChatTokenRetrievalFailure,
    throwInvalidConversation,
    throwClosedConversation,
    throwAuthenticatedChatConversationRetrievalFailure,
    throwPersistentChatConversationRetrievalFailure
}