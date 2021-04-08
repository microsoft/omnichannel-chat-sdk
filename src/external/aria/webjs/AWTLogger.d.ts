/**
* AWTLogger.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
import { AWTPiiKind, AWTPropertyType, AWTCustomerContentKind } from '../common/Enums';
import { AWTSessionState } from './Enums';
import { AWTEventData } from '../common/DataModels';
import AWTEventProperties from './AWTEventProperties';
import AWTSemanticContext from './AWTSemanticContext';
/**
* The AWTLogger class defines a logger.
*/
export default class AWTLogger {
    private _apiKey;
    private static _sequenceIdMap;
    private static _initIdMap;
    private _contextProperties;
    private _semanticContext;
    private _sessionId;
    private _sessionStartTime;
    /**
     * The AWTLogger class constructor.
     * @constructor
     * @param {string} _apiKey - The API key (also known as application key, and tenant token).
     */
    constructor(_apiKey: string);
    /**
     * Sets the context sent with every event from this logger.
     * @param {string} name                 - The name of the context property.
     * @param {string|number|boolean} value - The context property's value.
     * @param {enum} type                   - [Optional] The type of context property, as one of the AWTPropertyType enumeration values.
     */
    setContext(name: string, value: string | number | boolean, type?: AWTPropertyType): void;
    /**
     * Sets context that will be sent with every event from this logger, and tags it as PII.
     * @param {string} name                 - The name of the context property.
     * @param {string|number|boolean} value - The context property's value.
     * @param {enum} pii                    - The kind of PII for the context property, as one of the AWTPiiKind enumeration values.
     * @param {enum} type                   - [Optional] The type of context property, as one of the AWTPropertyType enumeration values.
     */
    setContextWithPii(name: string, value: string | number | boolean, pii: AWTPiiKind, type?: AWTPropertyType): void;
    /**
     * Sets the context that sent with every event from this logger, and tags it as customer content.
     * @param {string} name                 - The name of the context property.
     * @param {string|number|boolean} value - The context property's value.
     * @param {enum} customerContent        - The customer content kind, as one of the AWTCustomerContentKind enumeration values.
     * @param {enum} type                   - [Optional] The type of context property, as one of the AWTPropertyType enumeration values.
     */
    setContextWithCustomerContent(name: string, value: string | number | boolean, customerContent: AWTCustomerContentKind, type?: AWTPropertyType): void;
    /**
     * Gets the logger semantic context.
     * <b>Note:</b> Device properties are not permitted at the logger level, but you can set them
     * at the global level using the AWTLogManager class.
     *
     * @return A AWTSemanticContext object that you can use to set common semantic properties.
     */
    getSemanticContext(): AWTSemanticContext;
    /**
     * Logs a custom event with the specified name and fields - to track information
     * such as how a particular feature is used.
     * @param {Object} event - Can be either an AWTEventProperties object or an AWTEventData object or an event name.
     */
    logEvent(event: AWTEventProperties | AWTEventData | string): void;
    /**
     * Logs the session state.
     * <b>Note:</b> Calling Logging session <i>start</i> while a session already exists will produce a no-op. Similarly, calling logging
     * session <i>end</i> while a session does not exist will also produce a no-op.
     * @param {enum} state         - The session's state.
     * @param {obbject} properties - [Optional] Properties of the session event as either a AWTEventProperties object,
     * or a AWTEventData object.
     */
    logSession(state: AWTSessionState, properties?: AWTEventProperties | AWTEventData): void;
    /**
     * Gets the session ID for the ongoing session.
     * @return {string} A string that contains the session ID for the ongoing session. Returns undefined if there is
     * no ongoing session.
     */
    getSessionId(): string;
    /**
     * Logs a failure event, such as an application exception.
     * @param {string} signature  - A string that identifies the bucket of the failure.
     * @param {string} detail     - A string that contains the a description of the failure.
     * @param {string} category   - [Optional] A string that identifies the category of the failure, such as an application error,
     * a hang, or a crash.
     * @param {string} id         - [Optional] A string that that uniquely identifies this failure.
     * @param {object} properties - [Optional] Properties of the failure event, as either an AWTEventProperties object or an
     * AWTEventData object. This value can also be null.
     */
    logFailure(signature: string, detail: string, category?: string, id?: string, properties?: AWTEventProperties | AWTEventData): void;
    /**
     * Logs a page view event which is normally a result of a user action on a UI page - such as search query,
     * a content request, or a page navigation.
     *
     * @param {string} id          - A string that uniquely identifies this page.
     * @param {string} pageName    - The name of the page.
     * @param {string} category    - [Optional] A string that contains the category to which this page belongs.
     * @param {string} uri         - [Optional] A string that contains the URI of this page.
     * @param {string} referrerUri - [Optional] A string that contains the URI that refers to this page.
     * @param {object} properties  - [Optional] Properties of the page view event, as an AWTEventProperties object.
     * This value can also be null.
     */
    logPageView(id: string, pageName: string, category?: string, uri?: string, referrerUri?: string, properties?: AWTEventProperties): void;
    private _createInitId();
    private static _addPropertiesToEvent(event, propertiesEvent);
    private static _getSessionDurationFromTime(timeInSec);
    private static _logEvent(eventWithMetaData, contextProperties);
    private static _addContextIfAbsent(event, contextProperties);
    private static _setDefaultProperty(event, name, value);
    private static _sendEvent(event);
    private static _getInternalEvent(event, apiKey, sanitizeProperties);
    private static _getInitId(apiKey);
    private static _getSequenceId(apiKey);
}
