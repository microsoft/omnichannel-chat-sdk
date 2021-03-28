/**
* AWTNotificationManager.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
import { AWTNotificationListener, AWTEventDataWithMetaData } from './DataModels';
import { AWTEventsDroppedReason, AWTEventsRejectedReason } from './Enums';
/**
 * Class to manage sending notifications to all the listeners.
 */
export default class AWTNotificationManager {
    static listeners: AWTNotificationListener[];
    /**
     * Adds a notification listener.
     * @param {object} listener - The notification listener to be added.
     */
    static addNotificationListener(listener: AWTNotificationListener): void;
    /**
     * Removes all instances of the listener.
     * @param {object} listener - AWTNotificationListener to remove.
     */
    static removeNotificationListener(listener: AWTNotificationListener): void;
    /**
     * Notification for events sent.
     * @param {object[]} events - The array of events that have been sent.
     */
    static eventsSent(events: AWTEventDataWithMetaData[]): void;
    /**
     * Notification for events being dropped.
     * @param {object[]} events - The array of events that have been dropped.
     * @param {enum} reason     - The reason for which the SDK dropped the events.
     */
    static eventsDropped(events: AWTEventDataWithMetaData[], reason: AWTEventsDroppedReason): void;
    /**
     * Notification for events being retried when the request failed with a retryable status.
     * @param {object[]} events - The array of events that are being retried.
     */
    static eventsRetrying(events: AWTEventDataWithMetaData[]): void;
    /**
     * Notification for events being rejected.
     * @param {object[]} events - The array of events that have been rejected.
     * @param {enum} reason     - The reason for which the SDK rejeceted the events.
     */
    static eventsRejected(events: AWTEventDataWithMetaData[], reason: AWTEventsRejectedReason): void;
}
