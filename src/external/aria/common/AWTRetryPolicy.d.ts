/**
* Class for retry policy.
*/
export default class AWTRetryPolicy {
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
    static shouldRetryForStatus(httpStatusCode: number): boolean;
    /**
     * Gets the number of milliseconds to back off before retrying the request. The
     * back off duration is exponentially scaled based on the number of retries already
     * done for the request.
     * @param {number} retriesSoFar - The number of times the request has already been retried.
     * @return {number} The back off duration for the request before it can be retried.
     */
    static getMillisToBackoffForRetry(retriesSoFar: number): number;
}
