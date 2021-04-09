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
export declare enum AWTPropertyType {
    /**
     * Property type is unspecified.
     */
    Unspecified = 0,
    /**
     * A string.
     */
    String = 1,
    /**
     * A 64-bit integer.
     */
    Int64 = 2,
    /**
     * A double.
     */
    Double = 3,
    /**
     * A boolean.
     */
    Boolean = 4,
    /**
     * A date.
     */
    Date = 5,
}
/**
 * The AWTPiiKind enumeration contains a set of values that specify the kind of PII (Personal Identifiable Information).
 * @enum {number}
 */
export declare enum AWTPiiKind {
    /**
     * No kind.
     */
    NotSet = 0,
    /**
     * An LDAP distinguished name. For example, CN=Jeff Smith,OU=Sales,DC=Fabrikam,DC=COM.
     */
    DistinguishedName = 1,
    /**
     * Generic information.
     */
    GenericData = 2,
    /**
     * An IPV4 Internet address. For example, 192.0.2.1.
     */
    IPV4Address = 3,
    /**
     * An IPV6 Internet address. For example, 2001:0db8:85a3:0000:0000:8a2e:0370:7334.
     */
    IPv6Address = 4,
    /**
     * The Subject of an e-mail message.
     */
    MailSubject = 5,
    /**
     * A telephone number.
     */
    PhoneNumber = 6,
    /**
     * A query string.
     */
    QueryString = 7,
    /**
     * An SIP (Session Internet Protocol) address.
     */
    SipAddress = 8,
    /**
     * An e-mail address.
     */
    SmtpAddress = 9,
    /**
     * An user ID.
     */
    Identity = 10,
    /**
     * A URI (Uniform Resource Identifier).
     */
    Uri = 11,
    /**
     * The fully-qualified domain name.
     */
    Fqdn = 12,
    /**
     * Scrubs the last octet in a IPV4 Internet address.
     * For example: 10.121.227.147 becomes 10.121.227.*
     */
    IPV4AddressLegacy = 13,
}
/**
 * The AWTCustomerContentKind enumeration contains a set of values that specify the kind of customer content.
 * @enum {number}
 */
export declare enum AWTCustomerContentKind {
    /**
     * No kind.
     */
    NotSet = 0,
    /**
     * Generic content.
     */
    GenericContent = 1,
}
/**
 * The AWTEventPriority enumeration contains a set of values that specify an event's priority.
 * @enum {number}
 */
export declare enum AWTEventPriority {
    /**
     * Low priority.
     */
    Low = 1,
    /**
     * Normal priority.
     */
    Normal = 2,
    /**
     * High priority.
     */
    High = 3,
    /**
     * Immediate_sync priority (Events are sent sync immediately).
     */
    Immediate_sync = 5,
}
/**
 * The AWTEventsDroppedReason enumeration contains a set of values that specify the reason for dropping an event.
 * @enum {number}
 */
export declare enum AWTEventsDroppedReason {
    /**
     * Status set to non-retryable.
     */
    NonRetryableStatus = 1,
    /**
     * Enum value 2 has been deprecated
     */
    /**
     * The event queue is full.
     */
    QueueFull = 3,
    /**
     * Max retry limit reached.
     */
    MaxRetryLimit = 4,
}
/**
 * The AWTEventsRejectedReason enumeration contains a set of values that specify the reason for rejecting an event.
 * @enum {number}
 */
export declare enum AWTEventsRejectedReason {
    /**
     * The event is invalid.
     */
    InvalidEvent = 1,
    /**
     * The size of the event is too large.
     */
    SizeLimitExceeded = 2,
    /**
     * The server is not accepting events from this token.
     */
    KillSwitch = 3,
}
