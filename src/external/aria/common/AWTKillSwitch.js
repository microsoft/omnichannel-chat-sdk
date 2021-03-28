"use strict";
/**
* AWTKillSwitch.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
Object.defineProperty(exports, "__esModule", { value: true });
var SecToMsMultiplier = 1000;
/**
* Class to stop certain tenants sending events.
*/
var AWTKillSwitch = /** @class */ (function () {
    function AWTKillSwitch() {
        this._killedTokenDictionary = {};
    }
    /**
     * Set the tenants that are to be killed along with the duration. If the duration is
     * a special value identifying that the tokens are too be killed for only this request, then
     * a array of tokens is returned.
     * @param {string} killedTokens - Tokens that are too be marked to be killed.
     * @param {string} killDuration - The duration for which the tokens are to be killed.
     * @return {string[]} The tokens that are killed only for this given request.
     */
    AWTKillSwitch.prototype.setKillSwitchTenants = function (killTokens, killDuration) {
        if (killTokens && killDuration) {
            try {
                var killedTokens = killTokens.split(',');
                if (killDuration === 'this-request-only') {
                    return killedTokens;
                }
                var durationMs = parseInt(killDuration, 10) * SecToMsMultiplier;
                for (var i = 0; i < killedTokens.length; ++i) {
                    this._killedTokenDictionary[killedTokens[i]] = Date.now() + durationMs;
                }
            }
            catch (ex) {
                return [];
            }
        }
        return [];
    };
    /**
     * Determing if the given tenant token has been killed for the moment.
     * @param {string} tenantToken - The token to be checked.
     * @return {boolean} True if token has been killed, false otherwise.
     */
    AWTKillSwitch.prototype.isTenantKilled = function (tenantToken) {
        if (this._killedTokenDictionary[tenantToken] !== undefined && this._killedTokenDictionary[tenantToken] > Date.now()) {
            return true;
        }
        delete this._killedTokenDictionary[tenantToken];
        return false;
    };
    return AWTKillSwitch;
}());
exports.default = AWTKillSwitch;
