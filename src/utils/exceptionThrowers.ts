import ChatSDKErrors from "../core/ChatSDKErrors";
import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";

export const throwOCSDKInitializationFailure = (e: unknown, scenarioMarker: ScenarioMarker): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.OCSDKInitializationFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(TelemetryEvent.InitializeChatSDK, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
};

export const throwChatConfigRetrievalFailure = (e: unknown, scenarioMarker: ScenarioMarker): void => {
    const exceptionDetails = {
        response: ChatSDKErrors.ChatConfigRetrievalFailure,
        errorObject: `${e}`
    }

    scenarioMarker.failScenario(TelemetryEvent.InitializeChatSDK, {
        ExceptionDetails: JSON.stringify(exceptionDetails)
    });

    throw Error(exceptionDetails.response);
}

export default {
    throwOCSDKInitializationFailure,
    throwChatConfigRetrievalFailure
}