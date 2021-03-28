"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* Enums.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2018
* File containing the enums.
*/
/**
 * The AWTPropertyType enumeration contains a set of values that specify types of properties.
 * @enum {number}
 */
var AWTPropertyType;
(function (AWTPropertyType) {
    /**
     * Property type is unspecified.
     */
    AWTPropertyType[AWTPropertyType["Unspecified"] = 0] = "Unspecified";
    /**
     * A string.
     */
    AWTPropertyType[AWTPropertyType["String"] = 1] = "String";
    /**
     * A 64-bit integer.
     */
    AWTPropertyType[AWTPropertyType["Int64"] = 2] = "Int64";
    /**
     * A double.
     */
    AWTPropertyType[AWTPropertyType["Double"] = 3] = "Double";
    /**
     * A boolean.
     */
    AWTPropertyType[AWTPropertyType["Boolean"] = 4] = "Boolean";
    /**
     * A date.
     */
    AWTPropertyType[AWTPropertyType["Date"] = 5] = "Date";
})(AWTPropertyType = exports.AWTPropertyType || (exports.AWTPropertyType = {}));
/**
 * The AWTPiiKind enumeration contains a set of values that specify the kind of PII (Personal Identifiable Information).
 * @enum {number}
 */
var AWTPiiKind;
(function (AWTPiiKind) {
    /**
     * No kind.
     */
    AWTPiiKind[AWTPiiKind["NotSet"] = 0] = "NotSet";
    /**
     * An LDAP distinguished name. For example, CN=Jeff Smith,OU=Sales,DC=Fabrikam,DC=COM.
     */
    AWTPiiKind[AWTPiiKind["DistinguishedName"] = 1] = "DistinguishedName";
    /**
     * Generic information.
     */
    AWTPiiKind[AWTPiiKind["GenericData"] = 2] = "GenericData";
    /**
     * An IPV4 Internet address. For example, 192.0.2.1.
     */
    AWTPiiKind[AWTPiiKind["IPV4Address"] = 3] = "IPV4Address";
    /**
     * An IPV6 Internet address. For example, 2001:0db8:85a3:0000:0000:8a2e:0370:7334.
     */
    AWTPiiKind[AWTPiiKind["IPv6Address"] = 4] = "IPv6Address";
    /**
     * The Subject of an e-mail message.
     */
    AWTPiiKind[AWTPiiKind["MailSubject"] = 5] = "MailSubject";
    /**
     * A telephone number.
     */
    AWTPiiKind[AWTPiiKind["PhoneNumber"] = 6] = "PhoneNumber";
    /**
     * A query string.
     */
    AWTPiiKind[AWTPiiKind["QueryString"] = 7] = "QueryString";
    /**
     * An SIP (Session Internet Protocol) address.
     */
    AWTPiiKind[AWTPiiKind["SipAddress"] = 8] = "SipAddress";
    /**
     * An e-mail address.
     */
    AWTPiiKind[AWTPiiKind["SmtpAddress"] = 9] = "SmtpAddress";
    /**
     * An user ID.
     */
    AWTPiiKind[AWTPiiKind["Identity"] = 10] = "Identity";
    /**
     * A URI (Uniform Resource Identifier).
     */
    AWTPiiKind[AWTPiiKind["Uri"] = 11] = "Uri";
    /**
     * The fully-qualified domain name.
     */
    AWTPiiKind[AWTPiiKind["Fqdn"] = 12] = "Fqdn";
    /**
     * Scrubs the last octet in a IPV4 Internet address.
     * For example: 10.121.227.147 becomes 10.121.227.*
     */
    AWTPiiKind[AWTPiiKind["IPV4AddressLegacy"] = 13] = "IPV4AddressLegacy";
})(AWTPiiKind = exports.AWTPiiKind || (exports.AWTPiiKind = {}));
/**
 * The AWTCustomerContentKind enumeration contains a set of values that specify the kind of customer content.
 * @enum {number}
 */
var AWTCustomerContentKind;
(function (AWTCustomerContentKind) {
    /**
     * No kind.
     */
    AWTCustomerContentKind[AWTCustomerContentKind["NotSet"] = 0] = "NotSet";
    /**
     * Generic content.
     */
    AWTCustomerContentKind[AWTCustomerContentKind["GenericContent"] = 1] = "GenericContent";
})(AWTCustomerContentKind = exports.AWTCustomerContentKind || (exports.AWTCustomerContentKind = {}));
/**
 * The AWTEventPriority enumeration contains a set of values that specify an event's priority.
 * @enum {number}
 */
var AWTEventPriority;
(function (AWTEventPriority) {
    /**
     * Low priority.
     */
    AWTEventPriority[AWTEventPriority["Low"] = 1] = "Low";
    /**
     * Normal priority.
     */
    AWTEventPriority[AWTEventPriority["Normal"] = 2] = "Normal";
    /**
     * High priority.
     */
    AWTEventPriority[AWTEventPriority["High"] = 3] = "High";
    /**
     * Immediate_sync priority (Events are sent sync immediately).
     */
    AWTEventPriority[AWTEventPriority["Immediate_sync"] = 5] = "Immediate_sync";
})(AWTEventPriority = exports.AWTEventPriority || (exports.AWTEventPriority = {}));
/**
 * The AWTEventsDroppedReason enumeration contains a set of values that specify the reason for dropping an event.
 * @enum {number}
 */
var AWTEventsDroppedReason;
(function (AWTEventsDroppedReason) {
    /**
     * Status set to non-retryable.
     */
    AWTEventsDroppedReason[AWTEventsDroppedReason["NonRetryableStatus"] = 1] = "NonRetryableStatus";
    /**
     * Enum value 2 has been deprecated
     */
    /**
     * The event queue is full.
     */
    AWTEventsDroppedReason[AWTEventsDroppedReason["QueueFull"] = 3] = "QueueFull";
    /**
     * Max retry limit reached.
     */
    AWTEventsDroppedReason[AWTEventsDroppedReason["MaxRetryLimit"] = 4] = "MaxRetryLimit";
})(AWTEventsDroppedReason = exports.AWTEventsDroppedReason || (exports.AWTEventsDroppedReason = {}));
/**
 * The AWTEventsRejectedReason enumeration contains a set of values that specify the reason for rejecting an event.
 * @enum {number}
 */
var AWTEventsRejectedReason;
(function (AWTEventsRejectedReason) {
    /**
     * The event is invalid.
     */
    AWTEventsRejectedReason[AWTEventsRejectedReason["InvalidEvent"] = 1] = "InvalidEvent";
    /**
     * The size of the event is too large.
     */
    AWTEventsRejectedReason[AWTEventsRejectedReason["SizeLimitExceeded"] = 2] = "SizeLimitExceeded";
    /**
     * The server is not accepting events from this token.
     */
    AWTEventsRejectedReason[AWTEventsRejectedReason["KillSwitch"] = 3] = "KillSwitch";
})(AWTEventsRejectedReason = exports.AWTEventsRejectedReason || (exports.AWTEventsRejectedReason = {}));
