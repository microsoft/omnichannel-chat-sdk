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
export declare enum AWTUserIdType {
    /**
     * The user ID type is unknown.
     */
    Unknown = 0,
    /**
     * Microsoft Account ID.
     */
    MSACID = 1,
    /**
     * Microsoft .NET Passport Unique ID.
     */
    MSAPUID = 2,
    /**
     * Anonymous user ID.
     */
    ANID = 3,
    /**
     * Organization customer ID.
     */
    OrgIdCID = 4,
    /**
     * Microsoft Exchange Passport ID.
     */
    OrgIdPUID = 5,
    /**
     * User object ID.
     */
    UserObjectId = 6,
    /**
     * Skype ID.
     */
    Skype = 7,
    /**
     * Yammer ID.
     */
    Yammer = 8,
    /**
     * E-mail address.
     */
    EmailAddress = 9,
    /**
     * Telephone number.
     */
    PhoneNumber = 10,
    /**
     * SIP address.
     */
    SipAddress = 11,
    /**
     * Multiple unit identity.
     */
    MUID = 12,
}
/**
 * The AWTSessionState enumeration contains a set of values that indicate the session state.
 * @enum {number}
 */
export declare enum AWTSessionState {
    /**
     * Session started.
     */
    Started = 0,
    /**
     * Session ended.
     */
    Ended = 1,
}
