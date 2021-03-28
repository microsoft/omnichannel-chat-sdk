/**
* DataModels.ts
* @author  Brent Erickson (brericks) and Abhilash Panwar (abpanwar)
* @copyright Microsoft 2018
* File containing the common interfaces.
*/
import { AWTPiiKind, AWTPropertyType, AWTEventPriority, AWTEventsDroppedReason, AWTEventsRejectedReason, AWTCustomerContentKind } from './Enums';
/**
 * An interface used to create an event property value along with its type, PII, and customer content.
 * <b>Caution:</b> Customer content and PII are mutually exclusive. You can use only one of them at a time.
 * If you use both, then both properties will be considered invalid, and therefore won't be sent.
 * @interface
 * @property {string|number|boolean|Date} value - The value for the property.
 * @property {enum} type                        - [Optional] The type for the property value.
 * @property {enum} pii                         - [Optional] The pii kind associated with property value.
 * @property {enum} cc                          - [Optional] The customer content kind associated with the property value.
 */
export interface AWTEventProperty {
    value: string | number | boolean | Date;
    type?: AWTPropertyType;
    pii?: AWTPiiKind;
    cc?: AWTCustomerContentKind;
}
/**
 * An interface used to create an event, along with its name, properties, type, timestamp, and priority.
 * @interface
 * @property {string} name        - A string that contains the name of the event.
 * @property {object} properties  - The properties associated with this event. Can be a number, a boolean, or an AWTEventProperty object.
 * @property {string} type        - [Optional] A string that contains the base type of the event.
 * @property {number} timestamp   - [Optional] A number that contain the timestamp for the event.
 * @property {enum} priority      - [Optional] An AWTEventPriority enumeration value, that specifies the priority for the event.
 */
export interface AWTEventData {
    name?: string;
    properties?: {
        [name: string]: string | number | boolean | Date | AWTEventProperty;
    };
    type?: string;
    timestamp?: number;
    priority?: AWTEventPriority;
}
/**
 * An interface used for an event when it is returned in a notification, or sent to storage.
 * @property {string} name        - A string that contains the name of the event.
 * @property {object} properties  - The properties associated with this event. Can be a number, a boolean, or an AWTEventProperty object.
 * @property {number} timestamp   - [Optional] The timestamp for the event.
 * @property {enum} priority      - [Optional] An AWTEventPriority enumeration value, that specifies the priority for the event.
 * @property {string} sendAttempt - [Optional] The number of times this event has been attempted to be sent while in memory.
 * @property {string} apiKey      - [Optional] A string that contains the tenant token (also known as the application key).
 * @property {string} id          - [Optional] A string that contains the event identifier.
 */
export interface AWTEventDataWithMetaData extends AWTEventData {
    name: string;
    properties: {
        [name: string]: string | number | boolean | AWTEventProperty;
    };
    timestamp: number;
    priority: AWTEventPriority;
    sendAttempt: number;
    apiKey: string;
    id: string;
}
/**
 * An interface used for the notification listener.
 * @interface
 * @property {function} eventsSent     - [Optional] A function called when events are sent.
 * @property {function} eventsDropped  - [Optional] A function called when events are dropped.
 * @property {function} eventsRejected - [Optional] A function called when events are rejected.
 * @property {function} eventsRetrying - [Optional] A function called when events are resent.
 */
export interface AWTNotificationListener {
    eventsSent?: (events: AWTEventDataWithMetaData[]) => void;
    eventsDropped?: (events: AWTEventDataWithMetaData[], reason: AWTEventsDroppedReason) => void;
    eventsRejected?: (events: AWTEventDataWithMetaData[], reason: AWTEventsRejectedReason) => void;
    eventsRetrying?: (events: AWTEventDataWithMetaData[]) => void;
}
