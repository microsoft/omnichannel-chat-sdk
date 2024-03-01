/* eslint-disable @typescript-eslint/no-explicit-any */

import ScenarioMarker from "../telemetry/ScenarioMarker";
import TelemetryEvent from "../telemetry/TelemetryEvent";
import platform from "./platform";

interface Location {
    latitude: string;
    longitude: string;
}

export const getLocationInfo = async (scenarioMarker: ScenarioMarker, chatId: string, requestId: string): Promise<Location> => {
    const reportLocationError = (response: string, error?: any) => {
        console.error(response, error);
        let exceptionDetails;
        try {
            exceptionDetails = JSON.stringify({Response: response, ExceptionalDetails: error})
        } catch {
            exceptionDetails = JSON.stringify({Response: response})
        }
        scenarioMarker.failScenario(TelemetryEvent.GetGeolocation, {
            RequestId: requestId,
            ChatId: chatId,
            ExceptionDetails: exceptionDetails
        });
    }

    return new Promise((resolve, reject) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        scenarioMarker.startScenario(TelemetryEvent.GetGeolocation, {
            RequestId: requestId
        });

        const location: Location = {
            latitude: "",
            longitude: ""
        };

        if (platform.isNode() || platform.isReactNative() || !navigator.geolocation) {
            reportLocationError("Unsupported");
            resolve(location);
        }

        const onSuccess = (position: any) => {
            try {
                location.latitude = position.coords.latitude.toString();
                location.longitude = position.coords.longitude.toString();
                scenarioMarker.completeScenario(TelemetryEvent.GetGeolocation, {
                    RequestId: requestId,
                    ChatId: chatId
                });
                resolve(location);
            } catch (ex) {
                reportLocationError("GetGeolocationFailed", ex);
                resolve(location);
            }
        }

        const onError = (ex: any) => {
            reportLocationError("GetGeolocationFailed", ex)
            resolve(location);
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    });
}
