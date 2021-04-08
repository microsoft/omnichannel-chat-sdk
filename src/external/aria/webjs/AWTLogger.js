"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* AWTLogger.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
var Enums_1 = require("../common/Enums");
var Enums_2 = require("./Enums");
var AWTEventProperties_1 = require("./AWTEventProperties");
var Utils = require("../common/Utils");
var AWTStatsManager_1 = require("../common/AWTStatsManager");
var AWTNotificationManager_1 = require("../common/AWTNotificationManager");
var AWTTransmissionManagerCore_1 = require("./AWTTransmissionManagerCore");
var AWTLogManagerSettings_1 = require("./AWTLogManagerSettings");
var Version = require("./Version");
var AWTSemanticContext_1 = require("./AWTSemanticContext");
var AWTAutoCollection_1 = require("./AWTAutoCollection");
/**
* The AWTLogger class defines a logger.
*/
var AWTLogger = /** @class */ (function () {
    /**
     * The AWTLogger class constructor.
     * @constructor
     * @param {string} _apiKey - The API key (also known as application key, and tenant token).
     */
    function AWTLogger(_apiKey) {
        this._apiKey = _apiKey;
        this._contextProperties = new AWTEventProperties_1.default();
        this._semanticContext = new AWTSemanticContext_1.default(false, this._contextProperties);
        this._sessionStartTime = 0;
        this._createInitId();
    }
    /**
     * Sets the context sent with every event from this logger.
     * @param {string} name                 - The name of the context property.
     * @param {string|number|boolean} value - The context property's value.
     * @param {enum} type                   - [Optional] The type of context property, as one of the AWTPropertyType enumeration values.
     */
    AWTLogger.prototype.setContext = function (name, value, type) {
        if (type === void 0) { type = Enums_1.AWTPropertyType.Unspecified; }
        this._contextProperties.setProperty(name, value, type);
    };
    /**
     * Sets context that will be sent with every event from this logger, and tags it as PII.
     * @param {string} name                 - The name of the context property.
     * @param {string|number|boolean} value - The context property's value.
     * @param {enum} pii                    - The kind of PII for the context property, as one of the AWTPiiKind enumeration values.
     * @param {enum} type                   - [Optional] The type of context property, as one of the AWTPropertyType enumeration values.
     */
    AWTLogger.prototype.setContextWithPii = function (name, value, pii, type) {
        if (type === void 0) { type = Enums_1.AWTPropertyType.Unspecified; }
        this._contextProperties.setPropertyWithPii(name, value, pii, type);
    };
    /**
     * Sets the context that sent with every event from this logger, and tags it as customer content.
     * @param {string} name                 - The name of the context property.
     * @param {string|number|boolean} value - The context property's value.
     * @param {enum} customerContent        - The customer content kind, as one of the AWTCustomerContentKind enumeration values.
     * @param {enum} type                   - [Optional] The type of context property, as one of the AWTPropertyType enumeration values.
     */
    AWTLogger.prototype.setContextWithCustomerContent = function (name, value, customerContent, type) {
        if (type === void 0) { type = Enums_1.AWTPropertyType.Unspecified; }
        this._contextProperties.setPropertyWithCustomerContent(name, value, customerContent, type);
    };
    /**
     * Gets the logger semantic context.
     * <b>Note:</b> Device properties are not permitted at the logger level, but you can set them
     * at the global level using the AWTLogManager class.
     *
     * @return A AWTSemanticContext object that you can use to set common semantic properties.
     */
    AWTLogger.prototype.getSemanticContext = function () {
        return this._semanticContext;
    };
    /**
     * Logs a custom event with the specified name and fields - to track information
     * such as how a particular feature is used.
     * @param {Object} event - Can be either an AWTEventProperties object or an AWTEventData object or an event name.
     */
    AWTLogger.prototype.logEvent = function (event) {
        if (AWTLogManagerSettings_1.default.loggingEnabled) {
            if (!this._apiKey) {
                this._apiKey = AWTLogManagerSettings_1.default.defaultTenantToken;
                this._createInitId();
            }
            var sanitizeProperties = true;
            if (Utils.isString(event)) {
                event = {
                    name: event
                };
            }
            else if (event instanceof AWTEventProperties_1.default) {
                event = event.getEvent();
                //AWTEventProperties will already sanitize properties
                sanitizeProperties = false;
            }
            AWTStatsManager_1.default.eventReceived(this._apiKey);
            AWTLogger._logEvent(AWTLogger._getInternalEvent(event, this._apiKey, sanitizeProperties), this._contextProperties);
        }
    };
    /**
     * Logs the session state.
     * <b>Note:</b> Calling Logging session <i>start</i> while a session already exists will produce a no-op. Similarly, calling logging
     * session <i>end</i> while a session does not exist will also produce a no-op.
     * @param {enum} state         - The session's state.
     * @param {obbject} properties - [Optional] Properties of the session event as either a AWTEventProperties object,
     * or a AWTEventData object.
     */
    AWTLogger.prototype.logSession = function (state, properties) {
        if (AWTLogManagerSettings_1.default.sessionEnabled) {
            var sessionEvent = {
                name: 'session',
                type: 'session',
                properties: {}
            };
            AWTLogger._addPropertiesToEvent(sessionEvent, properties);
            sessionEvent.priority = Enums_1.AWTEventPriority.High;
            if (state === Enums_2.AWTSessionState.Started) {
                if (this._sessionStartTime > 0) {
                    //Session start called out of order. Session start time being non zero indicates an ongoing session.
                    return;
                }
                this._sessionStartTime = (new Date()).getTime();
                this._sessionId = Utils.newGuid();
                this.setContext('Session.Id', this._sessionId);
                sessionEvent.properties['Session.State'] = 'Started';
            }
            else if (state === Enums_2.AWTSessionState.Ended) {
                if (this._sessionStartTime === 0) {
                    //Session end called out of order. Session start time being zero indicates no ongoing session.
                    return;
                }
                var sessionDurationSec = Math.floor(((new Date()).getTime() - this._sessionStartTime) / 1000);
                sessionEvent.properties['Session.Id'] = this._sessionId;
                sessionEvent.properties['Session.State'] = 'Ended';
                sessionEvent.properties['Session.Duration'] = sessionDurationSec.toString();
                sessionEvent.properties['Session.DurationBucket'] =
                    AWTLogger._getSessionDurationFromTime(sessionDurationSec);
                this._sessionStartTime = 0;
                this.setContext('Session.Id', null);
                this._sessionId = undefined;
            }
            else {
                return;
            }
            sessionEvent.properties['Session.FirstLaunchTime'] = AWTAutoCollection_1.default.firstLaunchTime;
            this.logEvent(sessionEvent);
        }
    };
    /**
     * Gets the session ID for the ongoing session.
     * @return {string} A string that contains the session ID for the ongoing session. Returns undefined if there is
     * no ongoing session.
     */
    AWTLogger.prototype.getSessionId = function () {
        return this._sessionId;
    };
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
    AWTLogger.prototype.logFailure = function (signature, detail, category, id, properties) {
        if (!signature || !detail) {
            return;
        }
        var failureEvent = {
            name: 'failure',
            type: 'failure',
            properties: {}
        };
        AWTLogger._addPropertiesToEvent(failureEvent, properties);
        failureEvent.properties['Failure.Signature'] = signature;
        failureEvent.properties['Failure.Detail'] = detail;
        if (category) {
            failureEvent.properties['Failure.Category'] = category;
        }
        if (id) {
            failureEvent.properties['Failure.Id'] = id;
        }
        failureEvent.priority = Enums_1.AWTEventPriority.High;
        this.logEvent(failureEvent);
    };
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
    AWTLogger.prototype.logPageView = function (id, pageName, category, uri, referrerUri, properties) {
        if (!id || !pageName) {
            return;
        }
        var pageViewEvent = {
            name: 'pageview',
            type: 'pageview',
            properties: {}
        };
        AWTLogger._addPropertiesToEvent(pageViewEvent, properties);
        pageViewEvent.properties['PageView.Id'] = id;
        pageViewEvent.properties['PageView.Name'] = pageName;
        if (category) {
            pageViewEvent.properties['PageView.Category'] = category;
        }
        if (uri) {
            pageViewEvent.properties['PageView.Uri'] = uri;
        }
        if (referrerUri) {
            pageViewEvent.properties['PageView.ReferrerUri'] = referrerUri;
        }
        this.logEvent(pageViewEvent);
    };
    AWTLogger.prototype._createInitId = function () {
        // If no init ID for this tenant token exists, create one
        if (!AWTLogger._initIdMap[this._apiKey] && this._apiKey) {
            AWTLogger._initIdMap[this._apiKey] = Utils.newGuid();
        }
    };
    AWTLogger._addPropertiesToEvent = function (event, propertiesEvent) {
        if (propertiesEvent) {
            if (propertiesEvent instanceof AWTEventProperties_1.default) {
                propertiesEvent = propertiesEvent.getEvent();
            }
            if (propertiesEvent.name) {
                event.name = propertiesEvent.name;
            }
            if (propertiesEvent.priority) {
                event.priority = propertiesEvent.priority;
            }
            for (var name_1 in propertiesEvent.properties) {
                if (propertiesEvent.properties.hasOwnProperty(name_1)) {
                    event.properties[name_1] = propertiesEvent.properties[name_1];
                }
            }
        }
    };
    AWTLogger._getSessionDurationFromTime = function (timeInSec) {
        if (timeInSec < 0) {
            return 'Undefined';
        }
        else if (timeInSec <= 3) {
            return 'UpTo3Sec';
        }
        else if (timeInSec <= 10) {
            return 'UpTo10Sec';
        }
        else if (timeInSec <= 30) {
            return 'UpTo30Sec';
        }
        else if (timeInSec <= 60) {
            return 'UpTo60Sec';
        }
        else if (timeInSec <= 180) {
            return 'UpTo3Min';
        }
        else if (timeInSec <= 600) {
            return 'UpTo10Min';
        }
        else if (timeInSec <= 1800) {
            return 'UpTo30Min';
        }
        return 'Above30Min';
    };
    AWTLogger._logEvent = function (eventWithMetaData, contextProperties) {
        if (!eventWithMetaData.name || !Utils.isString(eventWithMetaData.name)) {
            AWTNotificationManager_1.default.eventsRejected([eventWithMetaData], Enums_1.AWTEventsRejectedReason.InvalidEvent);
            return;
        }
        eventWithMetaData.name = eventWithMetaData.name.toLowerCase();
        //Check if name is a string and replace . with _ if it is. Drop otherwise.
        eventWithMetaData.name = eventWithMetaData.name.replace(Utils.EventNameDotRegex, '_');
        if (!eventWithMetaData.type || !Utils.isString(eventWithMetaData.type)) {
            eventWithMetaData.type = 'custom';
        }
        else {
            eventWithMetaData.type = eventWithMetaData.type.toLowerCase();
        }
        //Validate name and type and drop if invalid
        if (!Utils.EventNameAndTypeRegex.test(eventWithMetaData.name) || !Utils.EventNameAndTypeRegex.test(eventWithMetaData.type)) {
            AWTNotificationManager_1.default.eventsRejected([eventWithMetaData], Enums_1.AWTEventsRejectedReason.InvalidEvent);
            return;
        }
        //Add the timestamp if the timestamp is not set or is negative.
        if (!Utils.isNumber(eventWithMetaData.timestamp) || eventWithMetaData.timestamp < 0) {
            eventWithMetaData.timestamp = (new Date()).getTime();
        }
        //If no properties create one for EventInfo and context 
        if (!eventWithMetaData.properties) {
            eventWithMetaData.properties = {};
        }
        // Logger ContextProperties
        this._addContextIfAbsent(eventWithMetaData, contextProperties.getPropertyMap());
        // LogManager ContextProperties
        this._addContextIfAbsent(eventWithMetaData, AWTLogManagerSettings_1.default.logManagerContext.getPropertyMap());
        //Add event info
        this._setDefaultProperty(eventWithMetaData, 'EventInfo.InitId', this._getInitId(eventWithMetaData.apiKey));
        this._setDefaultProperty(eventWithMetaData, 'EventInfo.Sequence', this._getSequenceId(eventWithMetaData.apiKey));
        this._setDefaultProperty(eventWithMetaData, 'EventInfo.SdkVersion', Version.FullVersionString);
        this._setDefaultProperty(eventWithMetaData, 'EventInfo.Name', eventWithMetaData.name);
        this._setDefaultProperty(eventWithMetaData, 'EventInfo.Time', (new Date(eventWithMetaData.timestamp)).toISOString());
        if (!Utils.isPriority(eventWithMetaData.priority)) {
            eventWithMetaData.priority = Enums_1.AWTEventPriority.Normal;
        }
        this._sendEvent(eventWithMetaData);
    };
    AWTLogger._addContextIfAbsent = function (event, contextProperties) {
        if (contextProperties) {
            for (var name_2 in contextProperties) {
                if (contextProperties.hasOwnProperty(name_2)) {
                    if (!event.properties[name_2]) {
                        event.properties[name_2] = contextProperties[name_2];
                    }
                }
            }
        }
    };
    AWTLogger._setDefaultProperty = function (event, name, value) {
        event.properties[name] = { value: value, pii: Enums_1.AWTPiiKind.NotSet, type: Enums_1.AWTPropertyType.String };
    };
    AWTLogger._sendEvent = function (event) {
        AWTTransmissionManagerCore_1.default.sendEvent(event);
    };
    AWTLogger._getInternalEvent = function (event, apiKey, sanitizeProperties) {
        event.properties = event.properties || {};
        if (sanitizeProperties) {
            // Event Properties 
            for (var name_3 in event.properties) {
                if (event.properties.hasOwnProperty(name_3)) {
                    event.properties[name_3] = Utils.sanitizeProperty(name_3, event.properties[name_3]);
                    if (event.properties[name_3] === null) {
                        delete event.properties[name_3];
                    }
                }
            }
        }
        var internalEvent = event;
        internalEvent.id = Utils.newGuid();
        internalEvent.apiKey = apiKey;
        return internalEvent;
    };
    AWTLogger._getInitId = function (apiKey) {
        return AWTLogger._initIdMap[apiKey];
    };
    AWTLogger._getSequenceId = function (apiKey) {
        if (AWTLogger._sequenceIdMap[apiKey] === undefined) {
            AWTLogger._sequenceIdMap[apiKey] = 0;
        }
        return (++AWTLogger._sequenceIdMap[apiKey]).toString();
    };
    AWTLogger._sequenceIdMap = {};
    AWTLogger._initIdMap = {};
    return AWTLogger;
}());
exports.default = AWTLogger;
