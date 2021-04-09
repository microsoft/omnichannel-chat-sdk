/**
* AWTTransmissionManagerCore.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
import { AWTEventHandler, AWTLogConfiguration } from './DataModels';
import { AWTEventDataWithMetaData } from '../common/DataModels';
/**
 * Class that manages the timers for when to send events. It also
 * handles flush and flushAndTeardown. This class also allows setting
 * new event handlers. The default event handler is the Inbound Queue Manager.
 */
export default class AWTTransmissionManagerCore {
    private static _eventHandler;
    private static _newEventsAllowed;
    private static _currentProfile;
    private static _timeout;
    private static _currentBackoffCount;
    private static _profiles;
    private static _paused;
    private static _timerCount;
    private static _lastUploadNowCall;
    private static _config;
    /**
     * Sets the event handler to be used by the tranmission manager.
     * The default event handler is the Inbound queue manager. This handler
     * is used to batch and send events to Aria. If you intend to send events
     * to Aria please make sure your event handler forwards events to the Inbound
     * Queue Manager. You can retrieve the Inbound Queue Manager by calling
     * getEventsHandler before you set your handler.
     * @param {object} eventsHandler - The new events handler to be used by the tranmission
     * manager.
     */
    static setEventsHandler(eventsHandler: AWTEventHandler): void;
    /**
     * Gets the current event handler used by the tranmission manager.
     * @return {object} The event handler currently used by the tranmission manager.
     */
    static getEventsHandler(): AWTEventHandler;
    /**
     * Try to schedule the timer after which events will be sent. If there are
     * no events to be sent, or there is already a timer scheduled, or the
     * http manager doesn't have any idle connections this method is no-op.
     */
    static scheduleTimer(): void;
    /**
     * Initialize the transmission manager. After this method is called events are
     * accepted for tranmission.
     * @param {object} config - The configuration passed during AWTLogManager initialize.
     */
    static initialize(config: AWTLogConfiguration): void;
    /**
     * Set the transmit profile to be used. This will change the tranmission timers
     * based on the transmit profile.
     * @param {string} profileName - The name of the transmit profile to be used.
     */
    static setTransmitProfile(profileName: string): void;
    /**
     * Load custom tranmission profiles. Each profile should have timers for
     * high, normal and low.  Each profile should make sure
     * that a each priority timer is a multiple of the priority higher than it.
     * Setting the timer value to -1 means that the events for that priority will
     * not be sent. Note that once a priority has been set to not send, all priorities
     * below it will also not be sent. The timers should be in the form of [low, normal, high].
     * e.g Custom: [30,10,5]
     * This also removes any previously loaded custom profiles.
     * @param {object} profiles - A dictionary containing the transmit profiles.
     */
    static loadTransmitProfiles(profiles: {
        [profileName: string]: number[];
    }): void;
    /**
     * Pass the event to the event handler and try to schedule the timer.
     * @param {object} event - The event to be sent.
     */
    static sendEvent(event: AWTEventDataWithMetaData): void;
    /**
     * Sends events for all priority for the current inbound queue.
     * This method adds new inbound queues to which new events will be added.
     * Note: If LogManager is paused or flush is called again in less than 30 sec
     * then flush will be no-op and the callback will not be called.
     * @param {function} callback - The function to be called when flush is finished.
     */
    static flush(callback: () => void): void;
    /**
     * Pauses transmission. It pauses the http manager and also clears timers.
     */
    static pauseTransmission(): void;
    /**
     * Resumes tranmission. It resumes the http manager and tries to schedule the timer.
     */
    static resumeTransmision(): void;
    /**
     * Stops allowing new events being added for tranmission. It also batches all
     * events currently in the queue and creates requests from them to be sent.
     */
    static flushAndTeardown(): void;
    /**
     * Backs off tranmission. This exponentially increases all the timers.
     */
    static backOffTransmission(): void;
    /**
     * Clears backoff for tranmission.
     */
    static clearBackOff(): void;
    /**
     * Resets the transmit profiles to the default profiles of Real Time, Near Real Time
     * and Best Effort. This removes all the custom profiles that were loaded.
     */
    private static _resetTransmitProfiles();
    private static clearTimeout();
    private static _batchAndSendEvents();
    private static _initializeProfiles();
}
