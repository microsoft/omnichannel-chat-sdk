/**
* DataModels.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
* File containing the interfaces for Web JS SDK.
*/
import { AWTEventDataWithMetaData } from '../common/DataModels';
import { AWTEventPriority } from '../common/Enums';
/**
 * The AWTLogConfiguration interface holds the configuration details passed to AWTLogManager initialize.
 * @interface
 * @property {string} collectorUri                         - [Optional] A string that contains the collector URI to which requests are sent.
 * @property {number} cacheMemorySizeLimitInNumberOfEvents - [Optional] The number of events that can be kept in memory before
 * the SDK starts to drop events. By default, this is 10,000.
 * @property {object} httpXHROverride                      - [Optional] The HTTP override that should be used to send requests, as an
 * AWTXHROverride object.
 * @property {object} propertyStorageOverride              - [Optional] The property storage override that should be used to store
 * internal SDK properties, otherwise stored as cookies. It is needed where cookies are not available.
 * @property {string} userAgent                            - [Optional] A string that contains the user agent parsed for auto collection in
 * case the userAgent can't be obtained from the DOM.
 * @property {boolean} disableCookiesUsage                 - [Optional] A boolean that indicated whether to disable the use of cookies by
 * the Aria SDK. The cookies added by the SDK are MicrosoftApplicationsTelemetryDeviceId and MicrosoftApplicationsTelemetryFirstLaunchTime.
 *  If cookies are disabled, then session events are not sent unless propertyStorageOverride is provided to store the values elsewhere.
 * @property {function} canSendStats                       - [Optional] A function that returns a boolean that identifies whether
 * statistics can be sent. The SDK calls this method before sending statistics.
 * @property {boolean} enableAutoUserSession               - [Optional] A boolean that indicates if we should auto instrument session
 *  events. Note: This setting is only respected for browsers where window events are accessible.
 * @property {number} clockSkewRefreshDurationInMins       - [Optional] A number that identifies the time in minutes after which the clock
 *  skew value should be refreshed. By default the value is 0, which means there is no refreshing of the clock skew value obtained at the
 *  start of the AWTLogManager.
 */
export interface AWTLogConfiguration {
    collectorUri?: string;
    cacheMemorySizeLimitInNumberOfEvents?: number;
    httpXHROverride?: AWTXHROverride;
    propertyStorageOverride?: AWTPropertyStorageOverride;
    userAgent?: string;
    disableCookiesUsage?: boolean;
    canSendStatEvent?: (eventName: string) => boolean;
    enableAutoUserSession?: boolean;
    clockSkewRefreshDurationInMins?: number;
}
/**
 * The AWTPropertyStorageOverride interface provides a custom interface for storing internal SDK properties - otherwise they are
 * stored as cookies.
 * You need this interface when you intend to run auto collection for common properties, or when you log a session in
 * a non browser environment.
 * @interface
 * @property {function} setProperty - A function for passing key value pairs to be stored.
 * @property {function} getProperty - A function that gets a value for a given key.
 */
export interface AWTPropertyStorageOverride {
    setProperty: (key: string, value: string) => void;
    getProperty: (key: string) => string;
}
/**
 * The AWTXHROverride interface overrides the way HTTP requests are sent.
 * @interface
 * @method {function} send - This method sends data to the specified URI using a POST request. If sync is true,
 * then the request is sent synchronously. The <i>ontimeout</i> function should be called when the request is timed out.
 * The <i>onerror</i> function should be called when an error is thrown while sending the request.
 * The <i>onload</i> function should be called when the request is completed.
 */
export interface AWTXHROverride {
    sendPOST: (urlString: string, data: Uint8Array | string, ontimeout: (status: number, headers: {
        [headerName: string]: string;
    }) => void, onerror: (status: number, headers: {
        [headerName: string]: string;
    }) => void, onload: (status: number, headers: {
        [headerName: string]: string;
    }) => void, sync?: boolean) => void;
}
/**
 * The AWTEventHandler interface is used for an event handler used by the transmission manager.
 * @interface
 * @method {function} addEvent                      - Adds an event to the event handler.
 * @method {function} sendEventsForPriorityAndAbove - Sends events currently in the event handler for the given
 * priority and priorities higher than it.
 * @method {function} hasEvents                     - Checks to see if the event handler currently
 * has any events that can be sent. The transmission manager uses this to determine if timers should continue to be
 * scheduled.
 * @method {function} uploadNow                     - Uploads all events currently in the event
 * handler that need to be uploaded ASAP. Any new events added should be put on hold until all of the previous events have been sent.
 * @method {function} pauseTransmission             - Pauses the transmission of events.
 * @method {function} resumeTransmission            - Resumes the transmission of events.
 * @method {function} teardown                      - Shuts-down the event handler. This is usually called when telemetry is shut down.
 */
export interface AWTEventHandler {
    addEvent: (event: AWTEventDataWithMetaData) => void;
    sendEventsForPriorityAndAbove: (priority: AWTEventPriority) => void;
    hasEvents: () => boolean;
    uploadNow: (callback: () => void) => void;
    pauseTransmission: () => void;
    resumeTransmission: () => void;
    teardown: () => void;
}
export declare const AWT_REAL_TIME = "REAL_TIME";
export declare const AWT_NEAR_REAL_TIME = "NEAR_REAL_TIME";
export declare const AWT_BEST_EFFORT = "BEST_EFFORT";
