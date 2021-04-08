"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Enums_1 = require("../common/Enums");
var AWTSerializer_1 = require("../common/AWTSerializer");
var AWTRetryPolicy_1 = require("../common/AWTRetryPolicy");
var AWTKillSwitch_1 = require("../common/AWTKillSwitch");
var AWTClockSkewManager_1 = require("../common/AWTClockSkewManager");
var Version = require("./Version");
var Utils = require("../common/Utils");
var AWTNotificationManager_1 = require("../common/AWTNotificationManager");
var AWTTransmissionManagerCore_1 = require("./AWTTransmissionManagerCore");
var MaxConnections = 2;
var MaxRetries = 1;
var Method = 'POST';
/**
 * Class managing the sending of requests.
 */
var AWTHttpManager = /** @class */ (function () {
    /**
     * @constructor
     * @param {object} requestQueue   - The queue that contains the requests to be sent.
     * @param {string} collectorUrl   - The collector url to which the requests must be sent.
     * @param {object} _queueManager  - The queue manager that we should add requests back to if needed.
     * @param {object} _httpInterface - The http interface that should be used to send HTTP requests.
     */
    function AWTHttpManager(_requestQueue, collectorUrl, _queueManager, _httpInterface, clockSkewRefreshDurationInMins) {
        var _this = this;
        this._requestQueue = _requestQueue;
        this._queueManager = _queueManager;
        this._httpInterface = _httpInterface;
        this._urlString = '?qsp=true&content-type=application%2Fbond-compact-binary&client-id=NO_AUTH&sdk-version='
            + Version.FullVersionString;
        this._killSwitch = new AWTKillSwitch_1.default();
        this._paused = false;
        this._useBeacons = false;
        this._activeConnections = 0;
        this._clockSkewManager = new AWTClockSkewManager_1.default(clockSkewRefreshDurationInMins);
        if (!Utils.isUint8ArrayAvailable()) {
            this._urlString += '&content-encoding=base64';
        }
        this._urlString = collectorUrl + this._urlString;
        if (!this._httpInterface) {
            this._useBeacons = !Utils.isReactNative(); //Only use beacons if not running in React Native
            this._httpInterface = {
                sendPOST: function (urlString, data, ontimeout, onerror, onload, sync) {
                    try {
                        if (Utils.useFetchRequest()) {
                            //Use the fetch API to send events in React Native and ServiceWorkerGlobal Scope
                            fetch(urlString, {
                                body: data,
                                method: Method
                            }).then(function (response) {
                                var headerMap = {};
                                if (response.headers) {
                                    response.headers.forEach(function (value, name) {
                                        headerMap[name] = value;
                                    });
                                }
                                onload(response.status, headerMap);
                            }).catch(function (error) {
                                //In case there is an error in the request. Set the status to 0
                                //so that the events can be retried later.
                                onerror(0, {});
                            });
                        }
                        else if (Utils.useXDomainRequest()) {
                            var xdr = new XDomainRequest();
                            xdr.open(Method, urlString);
                            //can't get the status code in xdr.
                            xdr.onload = function () {
                                // we will assume onload means the request succeeded.
                                onload(200, null);
                            };
                            xdr.onerror = function () {
                                // we will assume onerror means we need to drop the events.
                                onerror(400, null);
                            };
                            xdr.ontimeout = function () {
                                // we will assume ontimeout means we need to retry the events.
                                ontimeout(500, null);
                            };
                            xdr.send(data);
                        }
                        else {
                            var xhr_1 = new XMLHttpRequest();
                            xhr_1.open(Method, urlString, !sync);
                            xhr_1.onload = function () {
                                onload(xhr_1.status, _this._convertAllHeadersToMap(xhr_1.getAllResponseHeaders()));
                            };
                            xhr_1.onerror = function () {
                                onerror(xhr_1.status, _this._convertAllHeadersToMap(xhr_1.getAllResponseHeaders()));
                            };
                            xhr_1.ontimeout = function () {
                                ontimeout(xhr_1.status, _this._convertAllHeadersToMap(xhr_1.getAllResponseHeaders()));
                            };
                            xhr_1.send(data);
                        }
                    }
                    catch (e) {
                        // we will assume exception means we need to drop the events.
                        onerror(400, null);
                    }
                }
            };
        }
    }
    /**
     * Check if there is an idle connection overwhich we can send a request.
     * @return {boolean} True if there is an idle connection, false otherwise.
     */
    AWTHttpManager.prototype.hasIdleConnection = function () {
        return this._activeConnections < MaxConnections;
    };
    /**
     * Send requests in the request queue up if there is an idle connection, sending is
     * not pause and clock skew manager allows sending request.
     */
    AWTHttpManager.prototype.sendQueuedRequests = function () {
        while (this.hasIdleConnection() && !this._paused && this._requestQueue.length > 0
            && this._clockSkewManager.allowRequestSending()) {
            this._activeConnections++;
            this._sendRequest(this._requestQueue.shift(), 0, false);
        }
        //No more requests to send, tell TPM to try to schedule timer
        //in case it was waiting for idle connections
        if (this.hasIdleConnection()) {
            AWTTransmissionManagerCore_1.default.scheduleTimer();
        }
    };
    /**
     * Check if there are no active requests being sent.
     * @return {boolean} True if idle, false otherwise.
     */
    AWTHttpManager.prototype.isCompletelyIdle = function () {
        return this._activeConnections === 0;
    };
    /**
     * Queue all the remaning requests to be sent. The requests will be
     * sent using HTML5 Beacons if they are available.
     */
    AWTHttpManager.prototype.teardown = function () {
        while (this._requestQueue.length > 0) {
            this._sendRequest(this._requestQueue.shift(), 0, true);
        }
    };
    /**
     * Pause the sending of requests. No new requests will be sent.
     */
    AWTHttpManager.prototype.pause = function () {
        this._paused = true;
    };
    /**
     * Resume the sending of requests.
     */
    AWTHttpManager.prototype.resume = function () {
        this._paused = false;
        this.sendQueuedRequests();
    };
    /**
     * Removes any pending requests to be sent.
     */
    AWTHttpManager.prototype.removeQueuedRequests = function () {
        this._requestQueue.length = 0;
    };
    /**
     * Sends a request synchronously to the Aria collector. This api is used to send
     * a request containing a single immediate event.
     *
     * @param request - The request to be sent.
     * @param token   - The token used to send the request.
     */
    AWTHttpManager.prototype.sendSynchronousRequest = function (request, token) {
        //This will not take into account the max connections restriction. Since this is sync, we can 
        //only send one of this request at a time and thus should not worry about multiple connections 
        //being used to send synchronoush events.
        if (this._paused) {
            //If paused then convert to High priority. It will be added back to queue in _sendRequest
            request[token][0].priority = Enums_1.AWTEventPriority.High;
        }
        //Increment active connection since we are still going to use a connection to send the request.
        this._activeConnections++;
        //For sync requests we will not wait for the clock skew. 
        this._sendRequest(request, 0, false, true);
    };
    AWTHttpManager.prototype._sendRequest = function (request, retryCount, isTeardown, isSynchronous) {
        var _this = this;
        if (isSynchronous === void 0) { isSynchronous = false; }
        try {
            if (this._paused) {
                this._activeConnections--;
                this._queueManager.addBackRequest(request);
                return;
            }
            var tokenCount_1 = 0;
            var apikey_1 = '';
            for (var token in request) {
                if (request.hasOwnProperty(token)) {
                    if (!this._killSwitch.isTenantKilled(token)) {
                        if (apikey_1.length > 0) {
                            apikey_1 += ',';
                        }
                        apikey_1 += token;
                        tokenCount_1++;
                    }
                    else {
                        AWTNotificationManager_1.default.eventsRejected(request[token], Enums_1.AWTEventsRejectedReason.KillSwitch);
                        delete request[token];
                    }
                }
            }
            if (tokenCount_1 > 0) {
                var payloadResult = AWTSerializer_1.default.getPayloadBlob(request, tokenCount_1);
                if (payloadResult.remainingRequest) {
                    this._requestQueue.push(payloadResult.remainingRequest);
                }
                var urlString = this._urlString + '&x-apikey=' + apikey_1 + '&client-time-epoch-millis='
                    + Date.now().toString();
                if (this._clockSkewManager.shouldAddClockSkewHeaders()) {
                    urlString = urlString + '&time-delta-to-apply-millis=' + this._clockSkewManager.getClockSkewHeaderValue();
                }
                var data = void 0;
                if (!Utils.isUint8ArrayAvailable()) {
                    data = AWTSerializer_1.default.base64Encode(payloadResult.payloadBlob);
                }
                else {
                    data = new Uint8Array(payloadResult.payloadBlob);
                }
                for (var token in request) {
                    if (request.hasOwnProperty(token)) {
                        //Increment the send attempt count
                        for (var i = 0; i < request[token].length; ++i) {
                            request[token][i].sendAttempt > 0 ? request[token][i].sendAttempt++ : request[token][i].sendAttempt = 1;
                        }
                    }
                }
                //beacons will not be used if an http interface was passed by the customer
                if (this._useBeacons && isTeardown && Utils.isBeaconsSupported()) {
                    if (navigator.sendBeacon(urlString, data)) {
                        //Request sent via beacon.
                        return;
                    }
                }
                //Send sync requests if the request is immediate or we are tearing down telemetry.
                this._httpInterface.sendPOST(urlString, data, function (status, headers) {
                    _this._retryRequestIfNeeded(status, headers, request, tokenCount_1, apikey_1, retryCount, isTeardown, isSynchronous);
                }, function (status, headers) {
                    _this._retryRequestIfNeeded(status, headers, request, tokenCount_1, apikey_1, retryCount, isTeardown, isSynchronous);
                }, function (status, headers) {
                    _this._retryRequestIfNeeded(status, headers, request, tokenCount_1, apikey_1, retryCount, isTeardown, isSynchronous);
                }, isTeardown || isSynchronous);
            }
            else if (!isTeardown) {
                this._handleRequestFinished(false, {}, isTeardown, isSynchronous);
            }
        }
        catch (e) {
            //If we catch any error while sending the request, drop the request.
            this._handleRequestFinished(false, {}, isTeardown, isSynchronous);
        }
    };
    AWTHttpManager.prototype._retryRequestIfNeeded = function (status, headers, request, tokenCount, apikey, retryCount, isTeardown, isSynchronous) {
        var _this = this;
        var shouldRetry = true;
        if (typeof status !== 'undefined') {
            if (headers) {
                var killedTokens = this._killSwitch.setKillSwitchTenants(headers['kill-tokens'], headers['kill-duration-seconds']);
                this._clockSkewManager.setClockSkew(headers['time-delta-millis']);
                for (var i = 0; i < killedTokens.length; ++i) {
                    AWTNotificationManager_1.default.eventsRejected(request[killedTokens[i]], Enums_1.AWTEventsRejectedReason.KillSwitch);
                    delete request[killedTokens[i]];
                    tokenCount--;
                }
            }
            else {
                this._clockSkewManager.setClockSkew(null);
            }
            if (status === 200) {
                this._handleRequestFinished(true, request, isTeardown, isSynchronous);
                return;
            }
            if (!AWTRetryPolicy_1.default.shouldRetryForStatus(status) || tokenCount <= 0) {
                shouldRetry = false;
            }
        }
        if (shouldRetry) {
            if (isSynchronous) {
                //Synchronous events only contain a single event so the apiKey is equal to the token for that event.
                //Convert the event to High priority and add back to queue to be sent as High event.
                this._activeConnections--;
                request[apikey][0].priority = Enums_1.AWTEventPriority.High;
                this._queueManager.addBackRequest(request);
            }
            else if (retryCount < MaxRetries) {
                for (var token in request) {
                    if (request.hasOwnProperty(token)) {
                        AWTNotificationManager_1.default.eventsRetrying(request[token]);
                    }
                }
                setTimeout(function () { return _this._sendRequest(request, retryCount + 1, false); }, AWTRetryPolicy_1.default.getMillisToBackoffForRetry(retryCount));
            }
            else {
                this._activeConnections--;
                AWTTransmissionManagerCore_1.default.backOffTransmission();
                this._queueManager.addBackRequest(request);
            }
        }
        else {
            this._handleRequestFinished(false, request, isTeardown, isSynchronous);
        }
    };
    AWTHttpManager.prototype._handleRequestFinished = function (success, request, isTeardown, isSynchronous) {
        if (success) {
            AWTTransmissionManagerCore_1.default.clearBackOff();
        }
        for (var token in request) {
            if (request.hasOwnProperty(token)) {
                if (success) {
                    AWTNotificationManager_1.default.eventsSent(request[token]);
                }
                else {
                    AWTNotificationManager_1.default.eventsDropped(request[token], Enums_1.AWTEventsDroppedReason.NonRetryableStatus);
                }
            }
        }
        this._activeConnections--;
        if (!isSynchronous && !isTeardown) {
            //Only continue sending more requests as long as the current request was not an synchronous request or sent
            //during teardown. We want to return after just sending this one sync request.
            this.sendQueuedRequests();
        }
    };
    /**
     * Converts the XHR getAllResponseHeaders to a map containing the header key and value.
     */
    AWTHttpManager.prototype._convertAllHeadersToMap = function (headersString) {
        var headers = {};
        if (headersString) {
            var headersArray = headersString.split('\n');
            for (var i = 0; i < headersArray.length; ++i) {
                var header = headersArray[i].split(': ');
                headers[header[0]] = header[1];
            }
        }
        return headers;
    };
    return AWTHttpManager;
}());
exports.default = AWTHttpManager;
