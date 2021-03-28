"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Enums_1 = require("../common/Enums");
var Enums_2 = require("./Enums");
var AWTLogManagerSettings_1 = require("./AWTLogManagerSettings");
var AWTLogger_1 = require("./AWTLogger");
var AWTTransmissionManagerCore_1 = require("./AWTTransmissionManagerCore");
var AWTNotificationManager_1 = require("../common/AWTNotificationManager");
var AWTAutoCollection_1 = require("./AWTAutoCollection");
/**
* The AWTLogManager class manages the Aria SDK.
*/
var AWTLogManager = /** @class */ (function () {
    function AWTLogManager() {
    }
    /**
    * Initializes the log manager. After this method is called, events are
    * accepted for transmission.
    * @param {string} tenantToken - A string that contains the default tenant token.
    * @param {object} config      - [Optional] Configuration settings for initialize, as an AWTLogConfiguration object.
    */
    AWTLogManager.initialize = function (tenantToken, configuration) {
        if (configuration === void 0) { configuration = {}; }
        if (this._isInitialized) {
            return;
        }
        this._isInitialized = true;
        AWTLogManagerSettings_1.default.defaultTenantToken = tenantToken;
        this._overrideValuesFromConfig(configuration);
        if (this._config.disableCookiesUsage && !this._config.propertyStorageOverride) {
            AWTLogManagerSettings_1.default.sessionEnabled = false;
        }
        AWTAutoCollection_1.default.addPropertyStorageOverride(this._config.propertyStorageOverride);
        AWTAutoCollection_1.default.autoCollect(AWTLogManagerSettings_1.default.semanticContext, this._config.disableCookiesUsage, this._config.userAgent);
        //Create sender
        AWTTransmissionManagerCore_1.default.initialize(this._config);
        AWTLogManagerSettings_1.default.loggingEnabled = true;
        //Autolog session events for browsers
        if (this._config.enableAutoUserSession) {
            this.getLogger().logSession(Enums_2.AWTSessionState.Started);
            window.addEventListener('beforeunload', this.flushAndTeardown);
        }
        return this.getLogger();
    };
    /**
     * Gets the global semantic context.
     *
     * @return A AWTSemanticContext object, through which you can set common semantic properties.
     */
    AWTLogManager.getSemanticContext = function () {
        return AWTLogManagerSettings_1.default.semanticContext;
    };
    /**
     * Asynchronously sends events currently in the queue. New events added
     * are sent after the current flush finishes. The passed callback is
     * called when flush finishes. <b>Note:</b> If LogManager is paused, or if
     * flush is called again in less than 30 seconds, then flush is no-op, and
     * the callback is not called.
     * @param {function} callback - The function that is called when flush finishes.
     */
    AWTLogManager.flush = function (callback) {
        if (this._isInitialized && !this._isDestroyed) {
            AWTTransmissionManagerCore_1.default.flush(callback);
        }
    };
    /**
     * Prevents new events from being added for transmission. It also batches all
     * events currently in the queue, and creates requests for them to be sent. If
     * HTML5 Beacons are supported, then they will be used.
     */
    AWTLogManager.flushAndTeardown = function () {
        if (this._isInitialized && !this._isDestroyed) {
            if (this._config.enableAutoUserSession) {
                this.getLogger().logSession(Enums_2.AWTSessionState.Ended);
            }
            AWTTransmissionManagerCore_1.default.flushAndTeardown();
            AWTLogManagerSettings_1.default.loggingEnabled = false;
            this._isDestroyed = true;
        }
    };
    /**
     * Pasues the transmission of events.
     */
    AWTLogManager.pauseTransmission = function () {
        if (this._isInitialized && !this._isDestroyed) {
            AWTTransmissionManagerCore_1.default.pauseTransmission();
        }
    };
    /**
     * Resumes the tranmission of events.
     */
    AWTLogManager.resumeTransmision = function () {
        if (this._isInitialized && !this._isDestroyed) {
            AWTTransmissionManagerCore_1.default.resumeTransmision();
        }
    };
    /**
     * Sets the transmit profile. This changes the transmission timers
     * based on the transmit profile.
     * @param {string} profileName - A string that contains the name of the transmit profile.
     */
    AWTLogManager.setTransmitProfile = function (profileName) {
        if (this._isInitialized && !this._isDestroyed) {
            AWTTransmissionManagerCore_1.default.setTransmitProfile(profileName);
        }
    };
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
    AWTLogManager.loadTransmitProfiles = function (profiles) {
        if (this._isInitialized && !this._isDestroyed) {
            AWTTransmissionManagerCore_1.default.loadTransmitProfiles(profiles);
        }
    };
    /**
     * Sets the context sent with every event.
     * @param {string} name                 - A string that contains the name of the context property.
     * @param {string|number|boolean} value - The value of the context property.
     * @param {enum} type                   - [Optional] The type for the context property value, as one of the
     * AWTPropertyType enumeration values.
     */
    AWTLogManager.setContext = function (name, value, type) {
        if (type === void 0) { type = Enums_1.AWTPropertyType.Unspecified; }
        AWTLogManagerSettings_1.default.logManagerContext.setProperty(name, value, type);
    };
    /**
     * Sets the context sents with every event, and tags it as PII.
     * @param {string} name                 - A string that contains the name of the context property.
     * @param {string|number|boolean} value - The value of the context property.
     * @param {enum} pii                    - The kind of PII for the context property.
     * @param {enum} type                   - [Optional] The type for the context property value, as one of the
     * AWTPropertyType enumeration values.
     */
    AWTLogManager.setContextWithPii = function (name, value, pii, type) {
        if (type === void 0) { type = Enums_1.AWTPropertyType.Unspecified; }
        AWTLogManagerSettings_1.default.logManagerContext.setPropertyWithPii(name, value, pii, type);
    };
    /**
     * Sets the context sent with every event from this logger, and tags it as <i>customer content</i>.
     * @param {string} name                 - A string that contains the name of the context property.
     * @param {string|number|boolean} value - The value of the context property.
     * @param {enum} customerContent        - The kind of customer content for the context property, as one of the
     * AWTCustomerContentKind enumeration values.
     * @param {enum} type                   - [Optional] The type for the context property value, as one of the
     * AWTPropertyType enumeration values.
     */
    AWTLogManager.setContextWithCustomerContent = function (name, value, customerContent, type) {
        if (type === void 0) { type = Enums_1.AWTPropertyType.Unspecified; }
        AWTLogManagerSettings_1.default.logManagerContext.setPropertyWithCustomerContent(name, value, customerContent, type);
    };
    /**
     * Gets the logger for the specified tenant token.
     * @param {string} tenantToken - A string that contains the tenant token.
     * @return An AWTLogger object which sends data with the specified tenant token. If the tenant token is
     * undefined, or null, or empty, then undefined is returned.
     */
    AWTLogManager.getLogger = function (tenantToken) {
        var key = tenantToken;
        if (!key || key === AWTLogManagerSettings_1.default.defaultTenantToken) {
            key = '';
        }
        if (!this._loggers[key]) {
            this._loggers[key] = new AWTLogger_1.default(key);
        }
        return this._loggers[key];
    };
    /**
     * Adds a notification listener. The Aria SDK calls methods on the listener
     * when an appropriate notification is raised.
     * @param {object} listener - An AWTNotificationListener object.
     */
    AWTLogManager.addNotificationListener = function (listener) {
        AWTNotificationManager_1.default.addNotificationListener(listener);
    };
    /**
     * Removes all instances of the listener.
     * @param {object} listener - AWTNotificationListener to remove.
     */
    AWTLogManager.removeNotificationListener = function (listener) {
        AWTNotificationManager_1.default.removeNotificationListener(listener);
    };
    AWTLogManager._overrideValuesFromConfig = function (config) {
        if (config.collectorUri) {
            this._config.collectorUri = config.collectorUri;
        }
        if (config.cacheMemorySizeLimitInNumberOfEvents > 0) {
            this._config.cacheMemorySizeLimitInNumberOfEvents = config.cacheMemorySizeLimitInNumberOfEvents;
        }
        if (config.httpXHROverride && config.httpXHROverride.sendPOST) {
            this._config.httpXHROverride = config.httpXHROverride;
        }
        if (config.propertyStorageOverride && config.propertyStorageOverride.getProperty &&
            config.propertyStorageOverride.setProperty) {
            this._config.propertyStorageOverride = config.propertyStorageOverride;
        }
        if (config.userAgent) {
            this._config.userAgent = config.userAgent;
        }
        if (config.disableCookiesUsage) {
            this._config.disableCookiesUsage = config.disableCookiesUsage;
        }
        if (config.canSendStatEvent) {
            this._config.canSendStatEvent = config.canSendStatEvent;
        }
        if (config.enableAutoUserSession && typeof window !== 'undefined' && window.addEventListener) {
            this._config.enableAutoUserSession = config.enableAutoUserSession;
        }
        if (config.clockSkewRefreshDurationInMins > 0) {
            this._config.clockSkewRefreshDurationInMins = config.clockSkewRefreshDurationInMins;
        }
    };
    AWTLogManager._loggers = {};
    AWTLogManager._isInitialized = false;
    AWTLogManager._isDestroyed = false;
    AWTLogManager._config = {
        collectorUri: 'https://browser.pipe.aria.microsoft.com/Collector/3.0/',
        cacheMemorySizeLimitInNumberOfEvents: 10000,
        disableCookiesUsage: false,
        canSendStatEvent: function (eventName) { return true; },
        clockSkewRefreshDurationInMins: 0
    };
    return AWTLogManager;
}());
exports.default = AWTLogManager;
