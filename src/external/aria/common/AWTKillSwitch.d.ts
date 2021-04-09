/**
* Class to stop certain tenants sending events.
*/
export default class AWTKillSwitch {
    private _killedTokenDictionary;
    /**
     * Set the tenants that are to be killed along with the duration. If the duration is
     * a special value identifying that the tokens are too be killed for only this request, then
     * a array of tokens is returned.
     * @param {string} killedTokens - Tokens that are too be marked to be killed.
     * @param {string} killDuration - The duration for which the tokens are to be killed.
     * @return {string[]} The tokens that are killed only for this given request.
     */
    setKillSwitchTenants(killTokens: string, killDuration: string): string[];
    /**
     * Determing if the given tenant token has been killed for the moment.
     * @param {string} tenantToken - The token to be checked.
     * @return {boolean} True if token has been killed, false otherwise.
     */
    isTenantKilled(tenantToken: string): boolean;
}
