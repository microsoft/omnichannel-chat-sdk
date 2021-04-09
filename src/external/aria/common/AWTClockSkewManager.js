"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* AWTClockSkewManager.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
/**
* Class to manage clock skew correction.
*/
var AWTClockSkewManager = /** @class */ (function () {
    function AWTClockSkewManager(clockSkewRefreshDurationInMins) {
        this.clockSkewRefreshDurationInMins = clockSkewRefreshDurationInMins;
        this._reset();
    }
    /**
     * Determine if the request can be sent.
     * @return {boolean} True if requests can be sent, false otherwise.
     */
    AWTClockSkewManager.prototype.allowRequestSending = function () {
        if (this._isFirstRequest && !this._clockSkewSet) {
            this._isFirstRequest = false;
            this._allowRequestSending = false;
            return true;
        }
        return this._allowRequestSending;
    };
    /**
     * Determine if clock skew headers should be added to the request.
     * @return {boolean} True if clock skew headers should be added, false otherwise.
     */
    AWTClockSkewManager.prototype.shouldAddClockSkewHeaders = function () {
        return this._shouldAddClockSkewHeaders;
    };
    /**
     * Gets the clock skew header value.
     * @return {string} The clock skew header value.
     */
    AWTClockSkewManager.prototype.getClockSkewHeaderValue = function () {
        return this._clockSkewHeaderValue;
    };
    /**
     * Sets the clock skew header value. Once clock skew is set this method
     * is no-op.
     * @param {string} timeDeltaInMillis - Time delta to be saved as the clock skew header value.
     */
    AWTClockSkewManager.prototype.setClockSkew = function (timeDeltaInMillis) {
        if (!this._clockSkewSet) {
            if (timeDeltaInMillis) {
                this._clockSkewHeaderValue = timeDeltaInMillis;
            }
            else {
                this._shouldAddClockSkewHeaders = false;
            }
            this._clockSkewSet = true;
            this._allowRequestSending = true;
        }
    };
    AWTClockSkewManager.prototype._reset = function () {
        var _this = this;
        this._isFirstRequest = true;
        this._clockSkewSet = false;
        this._allowRequestSending = true;
        this._shouldAddClockSkewHeaders = true;
        this._clockSkewHeaderValue = 'use-collector-delta';
        if (this.clockSkewRefreshDurationInMins > 0) {
            setTimeout(function () { return _this._reset(); }, this.clockSkewRefreshDurationInMins * 60000);
        }
    };
    return AWTClockSkewManager;
}());
exports.default = AWTClockSkewManager;
