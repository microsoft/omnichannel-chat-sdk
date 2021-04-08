"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* AWTRetryPolicy.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
var RandomizationLowerThreshold = 0.8;
var RandomizationUpperThreshold = 1.2;
var BaseBackoff = 3000;
var MaxBackoff = 120000;
/**
* Class for retry policy.
*/
var AWTRetryPolicy = /** @class */ (function () {
    function AWTRetryPolicy() {
    }
    /**
     * Determine if the request should be retried for the given status code.
     * The below expression reads that we should only retry for:
     *      - HttpStatusCodes that are smaller than 300.
     *      - HttpStatusCodes greater or equal to 500 (except for 501-NotImplement
     *        and 505-HttpVersionNotSupport).
     *      - HttpStatusCode 408-RequestTimeout.
     * This is based on Microsoft.WindowsAzure.Storage.RetryPolicies.ExponentialRetry class
     * @param {number} httpStatusCode - The status code returned for the request.
     * @return {boolean} True if request should be retried, false otherwise.
     */
    AWTRetryPolicy.shouldRetryForStatus = function (httpStatusCode) {
        /* */
        return !((httpStatusCode >= 300 && httpStatusCode < 500 && httpStatusCode !== 408)
            || (httpStatusCode === 501)
            || (httpStatusCode === 505));
    };
    /**
     * Gets the number of milliseconds to back off before retrying the request. The
     * back off duration is exponentially scaled based on the number of retries already
     * done for the request.
     * @param {number} retriesSoFar - The number of times the request has already been retried.
     * @return {number} The back off duration for the request before it can be retried.
     */
    AWTRetryPolicy.getMillisToBackoffForRetry = function (retriesSoFar) {
        var waitDuration = 0;
        var minBackoff = BaseBackoff * RandomizationLowerThreshold;
        var maxBackoff = BaseBackoff * RandomizationUpperThreshold;
        var randomBackoff = Math.floor(Math.random() * (maxBackoff - minBackoff)) + minBackoff;
        waitDuration = Math.pow(4, retriesSoFar) * randomBackoff;
        return Math.min(waitDuration, MaxBackoff);
    };
    return AWTRetryPolicy;
}());
exports.default = AWTRetryPolicy;
