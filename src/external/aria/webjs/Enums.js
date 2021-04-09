"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* Enums.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
* File containing the enums.
*/
/**
 * The AWTUserIdType enumeration contains a set of values that specify the type of user ID.
 * @enum {number}
 */
var AWTUserIdType;
(function (AWTUserIdType) {
    /**
     * The user ID type is unknown.
     */
    AWTUserIdType[AWTUserIdType["Unknown"] = 0] = "Unknown";
    /**
     * Microsoft Account ID.
     */
    AWTUserIdType[AWTUserIdType["MSACID"] = 1] = "MSACID";
    /**
     * Microsoft .NET Passport Unique ID.
     */
    AWTUserIdType[AWTUserIdType["MSAPUID"] = 2] = "MSAPUID";
    /**
     * Anonymous user ID.
     */
    AWTUserIdType[AWTUserIdType["ANID"] = 3] = "ANID";
    /**
     * Organization customer ID.
     */
    AWTUserIdType[AWTUserIdType["OrgIdCID"] = 4] = "OrgIdCID";
    /**
     * Microsoft Exchange Passport ID.
     */
    AWTUserIdType[AWTUserIdType["OrgIdPUID"] = 5] = "OrgIdPUID";
    /**
     * User object ID.
     */
    AWTUserIdType[AWTUserIdType["UserObjectId"] = 6] = "UserObjectId";
    /**
     * Skype ID.
     */
    AWTUserIdType[AWTUserIdType["Skype"] = 7] = "Skype";
    /**
     * Yammer ID.
     */
    AWTUserIdType[AWTUserIdType["Yammer"] = 8] = "Yammer";
    /**
     * E-mail address.
     */
    AWTUserIdType[AWTUserIdType["EmailAddress"] = 9] = "EmailAddress";
    /**
     * Telephone number.
     */
    AWTUserIdType[AWTUserIdType["PhoneNumber"] = 10] = "PhoneNumber";
    /**
     * SIP address.
     */
    AWTUserIdType[AWTUserIdType["SipAddress"] = 11] = "SipAddress";
    /**
     * Multiple unit identity.
     */
    AWTUserIdType[AWTUserIdType["MUID"] = 12] = "MUID";
})(AWTUserIdType = exports.AWTUserIdType || (exports.AWTUserIdType = {}));
/**
 * The AWTSessionState enumeration contains a set of values that indicate the session state.
 * @enum {number}
 */
var AWTSessionState;
(function (AWTSessionState) {
    /**
     * Session started.
     */
    AWTSessionState[AWTSessionState["Started"] = 0] = "Started";
    /**
     * Session ended.
     */
    AWTSessionState[AWTSessionState["Ended"] = 1] = "Ended";
})(AWTSessionState = exports.AWTSessionState || (exports.AWTSessionState = {}));
