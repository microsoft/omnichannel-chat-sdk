/**
* AWTHttpManager.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
import { AWTEventDataWithMetaData } from '../common/DataModels';
import { AWTXHROverride } from './DataModels';
import AWTQueueManager from './AWTQueueManager';
/**
 * Class managing the sending of requests.
 */
export default class AWTHttpManager {
    _requestQueue: {
        [token: string]: AWTEventDataWithMetaData[];
    }[];
    private _queueManager;
    private _httpInterface;
    private _urlString;
    private _killSwitch;
    private _paused;
    private _clockSkewManager;
    private _useBeacons;
    _activeConnections: number;
    /**
     * @constructor
     * @param {object} requestQueue   - The queue that contains the requests to be sent.
     * @param {string} collectorUrl   - The collector url to which the requests must be sent.
     * @param {object} _queueManager  - The queue manager that we should add requests back to if needed.
     * @param {object} _httpInterface - The http interface that should be used to send HTTP requests.
     */
    constructor(_requestQueue: {
        [token: string]: AWTEventDataWithMetaData[];
    }[], collectorUrl: string, _queueManager: AWTQueueManager, _httpInterface: AWTXHROverride, clockSkewRefreshDurationInMins?: number);
    /**
     * Check if there is an idle connection overwhich we can send a request.
     * @return {boolean} True if there is an idle connection, false otherwise.
     */
    hasIdleConnection(): boolean;
    /**
     * Send requests in the request queue up if there is an idle connection, sending is
     * not pause and clock skew manager allows sending request.
     */
    sendQueuedRequests(): void;
    /**
     * Check if there are no active requests being sent.
     * @return {boolean} True if idle, false otherwise.
     */
    isCompletelyIdle(): boolean;
    /**
     * Queue all the remaning requests to be sent. The requests will be
     * sent using HTML5 Beacons if they are available.
     */
    teardown(): void;
    /**
     * Pause the sending of requests. No new requests will be sent.
     */
    pause(): void;
    /**
     * Resume the sending of requests.
     */
    resume(): void;
    /**
     * Removes any pending requests to be sent.
     */
    removeQueuedRequests(): void;
    /**
     * Sends a request synchronously to the Aria collector. This api is used to send
     * a request containing a single immediate event.
     *
     * @param request - The request to be sent.
     * @param token   - The token used to send the request.
     */
    sendSynchronousRequest(request: {
        [token: string]: AWTEventDataWithMetaData[];
    }, token: string): void;
    private _sendRequest(request, retryCount, isTeardown, isSynchronous?);
    private _retryRequestIfNeeded(status, headers, request, tokenCount, apikey, retryCount, isTeardown, isSynchronous);
    private _handleRequestFinished(success, request, isTeardown, isSynchronous);
    /**
     * Converts the XHR getAllResponseHeaders to a map containing the header key and value.
     */
    private _convertAllHeadersToMap(headersString);
}
