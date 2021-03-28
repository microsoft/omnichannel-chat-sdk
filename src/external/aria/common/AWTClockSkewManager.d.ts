/**
* AWTClockSkewManager.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
/**
* Class to manage clock skew correction.
*/
export default class AWTClockSkewManager {
    private _allowRequestSending;
    private _shouldAddClockSkewHeaders;
    private _isFirstRequest;
    private _clockSkewHeaderValue;
    private _clockSkewSet;
    private clockSkewRefreshDurationInMins;
    constructor(clockSkewRefreshDurationInMins?: number);
    /**
     * Determine if the request can be sent.
     * @return {boolean} True if requests can be sent, false otherwise.
     */
    allowRequestSending(): boolean;
    /**
     * Determine if clock skew headers should be added to the request.
     * @return {boolean} True if clock skew headers should be added, false otherwise.
     */
    shouldAddClockSkewHeaders(): boolean;
    /**
     * Gets the clock skew header value.
     * @return {string} The clock skew header value.
     */
    getClockSkewHeaderValue(): string;
    /**
     * Sets the clock skew header value. Once clock skew is set this method
     * is no-op.
     * @param {string} timeDeltaInMillis - Time delta to be saved as the clock skew header value.
     */
    setClockSkew(timeDeltaInMillis: string): void;
    private _reset();
}
