/**
* AWTLogManager.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
import { AWTLogConfiguration } from './DataModels';
import { AWTPiiKind, AWTPropertyType, AWTCustomerContentKind } from '../common/Enums';
import { AWTNotificationListener } from '../common/DataModels';
import AWTLogger from './AWTLogger';
import AWTSemanticContext from './AWTSemanticContext';
/**
* The AWTLogManager class manages the Aria SDK.
*/
export default class AWTLogManager {
    private static _loggers;
    private static _isInitialized;
    private static _isDestroyed;
    private static _config;
    /**
    * Initializes the log manager. After this method is called, events are
    * accepted for transmission.
    * @param {string} tenantToken - A string that contains the default tenant token.
    * @param {object} config      - [Optional] Configuration settings for initialize, as an AWTLogConfiguration object.
    */
    static initialize(tenantToken: string, configuration?: AWTLogConfiguration): AWTLogger;
    /**
     * Gets the global semantic context.
     *
     * @return A AWTSemanticContext object, through which you can set common semantic properties.
     */
    static getSemanticContext(): AWTSemanticContext;
    /**
     * Asynchronously sends events currently in the queue. New events added
     * are sent after the current flush finishes. The passed callback is
     * called when flush finishes. <b>Note:</b> If LogManager is paused, or if
     * flush is called again in less than 30 seconds, then flush is no-op, and
     * the callback is not called.
     * @param {function} callback - The function that is called when flush finishes.
     */
    static flush(callback: () => void): void;
    /**
     * Prevents new events from being added for transmission. It also batches all
     * events currently in the queue, and creates requests for them to be sent. If
     * HTML5 Beacons are supported, then they will be used.
     */
    static flushAndTeardown(): void;
    /**
     * Pasues the transmission of events.
     */
    static pauseTransmission(): void;
    /**
     * Resumes the tranmission of events.
     */
    static resumeTransmision(): void;
    /**
     * Sets the transmit profile. This changes the transmission timers
     * based on the transmit profile.
     * @param {string} profileName - A string that contains the name of the transmit profile.
     */
    static setTransmitProfile(profileName: string): void;
    /**
     * Loads custom transmission profiles. Each profile should have timers for
     * high, normal, and low. Each profile should make sure
     * that a each priority timer is a multiple of the priority higher than it.
     * Setting the timer value to <i>-1</i> means the events for that priority will
     * not be sent. Note that once a priority has been set to <i>not send</i>, then all priorities
     * below it will also not be sent. The timers should be in the form of [low, normal, high].
     * E.g, <i>Custom: [30,10,5]</i>.
     * This method removes any previously loaded custom profiles.
     * @param {object} profiles - A dictionary that contains the transmit profiles.
     */
    static loadTransmitProfiles(profiles: {
        [profileName: string]: number[];
    }): void;
    /**
     * Sets the context sent with every event.
     * @param {string} name                 - A string that contains the name of the context property.
     * @param {string|number|boolean} value - The value of the context property.
     * @param {enum} type                   - [Optional] The type for the context property value, as one of the
     * AWTPropertyType enumeration values.
     */
    static setContext(name: string, value: string | number | boolean, type?: AWTPropertyType): void;
    /**
     * Sets the context sents with every event, and tags it as PII.
     * @param {string} name                 - A string that contains the name of the context property.
     * @param {string|number|boolean} value - The value of the context property.
     * @param {enum} pii                    - The kind of PII for the context property.
     * @param {enum} type                   - [Optional] The type for the context property value, as one of the
     * AWTPropertyType enumeration values.
     */
    static setContextWithPii(name: string, value: string | number | boolean, pii: AWTPiiKind, type?: AWTPropertyType): void;
    /**
     * Sets the context sent with every event from this logger, and tags it as <i>customer content</i>.
     * @param {string} name                 - A string that contains the name of the context property.
     * @param {string|number|boolean} value - The value of the context property.
     * @param {enum} customerContent        - The kind of customer content for the context property, as one of the
     * AWTCustomerContentKind enumeration values.
     * @param {enum} type                   - [Optional] The type for the context property value, as one of the
     * AWTPropertyType enumeration values.
     */
    static setContextWithCustomerContent(name: string, value: string | number | boolean, customerContent: AWTCustomerContentKind, type?: AWTPropertyType): void;
    /**
     * Gets the logger for the specified tenant token.
     * @param {string} tenantToken - A string that contains the tenant token.
     * @return An AWTLogger object which sends data with the specified tenant token. If the tenant token is
     * undefined, or null, or empty, then undefined is returned.
     */
    static getLogger(tenantToken?: string): AWTLogger;
    /**
     * Adds a notification listener. The Aria SDK calls methods on the listener
     * when an appropriate notification is raised.
     * @param {object} listener - An AWTNotificationListener object.
     */
    static addNotificationListener(listener: AWTNotificationListener): void;
    /**
     * Removes all instances of the listener.
     * @param {object} listener - AWTNotificationListener to remove.
     */
    static removeNotificationListener(listener: AWTNotificationListener): void;
    private static _overrideValuesFromConfig(config);
}
