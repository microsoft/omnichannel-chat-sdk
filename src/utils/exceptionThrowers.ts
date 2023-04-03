import ChatSDKErrors from "../core/ChatSDKErrors";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";

export const throwOCSDKInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.OCSDKInitializationFailure,
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

export const throwMessagingSDKInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker, telemetryEvent: TelemetryEvent): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.MessagingSDKInitializationFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(telemetryEvent, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export default {
    throwOCSDKInitializationFailure,
    throwChatConfigRetrievalFailure,
    throwMessagingSDKInitializationFailure
}