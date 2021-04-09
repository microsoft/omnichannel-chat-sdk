"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* AWTTransmissionManagerCore.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
var DataModels_1 = require("./DataModels");
var Enums_1 = require("../common/Enums");
var AWTQueueManager_1 = require("./AWTQueueManager");
var AWTStatsManager_1 = require("../common/AWTStatsManager");
var AWTEventProperties_1 = require("./AWTEventProperties");
var AWTLogManager_1 = require("./AWTLogManager");
var Utils = require("../common/Utils");
var MaxBackoffCount = 4;
var MinDurationBetweenUploadNow = 30000; //30 sec
var StatName = 'awt_stats';
/**
 * Class that manages the timers for when to send events. It also
 * handles flush and flushAndTeardown. This class also allows setting
 * new event handlers. The default event handler is the Inbound Queue Manager.
 */
var AWTTransmissionManagerCore = /** @class */ (function () {
    function AWTTransmissionManagerCore() {
    }
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
    AWTTransmissionManagerCore.setEventsHandler = function (eventsHandler) {
        this._eventHandler = eventsHandler;
    };
    /**
     * Gets the current event handler used by the tranmission manager.
     * @return {object} The event handler currently used by the tranmission manager.
     */
    AWTTransmissionManagerCore.getEventsHandler = function () {
        return this._eventHandler;
    };
    /**
     * Try to schedule the timer after which events will be sent. If there are
     * no events to be sent, or there is already a timer scheduled, or the
     * http manager doesn't have any idle connections this method is no-op.
     */
    AWTTransmissionManagerCore.scheduleTimer = function () {
        var _this = this;
        var timer = this._profiles[this._currentProfile][2];
        if (this._timeout < 0 && timer >= 0 && !this._paused) {
            if (this._eventHandler.hasEvents()) {
                //If the transmission is backed off make the timer atleast 1 sec to allow for backoff.
                if (timer === 0 && this._currentBackoffCount > 0) {
                    timer = 1;
                }
                this._timeout = setTimeout(function () { return _this._batchAndSendEvents(); }, timer * (1 << this._currentBackoffCount) * 1000);
            }
            else {
                this._timerCount = 0;
            }
        }
    };
    /**
     * Initialize the transmission manager. After this method is called events are
     * accepted for tranmission.
     * @param {object} config - The configuration passed during AWTLogManager initialize.
     */
    AWTTransmissionManagerCore.initialize = function (config) {
        var _this = this;
        this._newEventsAllowed = true;
        this._config = config;
        this._eventHandler = new AWTQueueManager_1.default(config.collectorUri, config.cacheMemorySizeLimitInNumberOfEvents, config.httpXHROverride, config.clockSkewRefreshDurationInMins);
        this._initializeProfiles();
        AWTStatsManager_1.default.initialize(function (stats, tenantId) {
            if (_this._config.canSendStatEvent(StatName)) {
                var event_1 = new AWTEventProperties_1.default(StatName);
                event_1.setEventPriority(Enums_1.AWTEventPriority.High);
                event_1.setProperty('TenantId', tenantId);
                for (var statKey in stats) {
                    if (stats.hasOwnProperty(statKey)) {
                        event_1.setProperty(statKey, stats[statKey].toString());
                    }
                }
                AWTLogManager_1.default.getLogger(Utils.StatsApiKey).logEvent(event_1);
            }
        });
    };
    /**
     * Set the transmit profile to be used. This will change the tranmission timers
     * based on the transmit profile.
     * @param {string} profileName - The name of the transmit profile to be used.
     */
    AWTTransmissionManagerCore.setTransmitProfile = function (profileName) {
        if (this._currentProfile !== profileName && this._profiles[profileName] !== undefined) {
            this.clearTimeout();
            this._currentProfile = profileName;
            this.scheduleTimer();
        }
    };
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
    AWTTransmissionManagerCore.loadTransmitProfiles = function (profiles) {
        this._resetTransmitProfiles();
        for (var profileName in profiles) {
            if (profiles.hasOwnProperty(profileName)) {
                if (profiles[profileName].length !== 3) {
                    continue;
                }
                //Make sure if a higher priority is set to not send then dont send lower priority
                for (var i = 2; i >= 0; --i) {
                    if (profiles[profileName][i] < 0) {
                        for (var j = i; j >= 0; --j) {
                            profiles[profileName][j] = -1;
                        }
                        break;
                    }
                }
                //Make sure each priority is multiple of the priority higher then it. If not a multiple
                //we round up so that it becomes a multiple.
                for (var i = 2; i > 0; --i) {
                    if (profiles[profileName][i] > 0 && profiles[profileName][i - 1] > 0) {
                        var timerMultiplier = profiles[profileName][i - 1] / profiles[profileName][i];
                        profiles[profileName][i - 1] = Math.ceil(timerMultiplier) * profiles[profileName][i];
                    }
                }
                this._profiles[profileName] = profiles[profileName];
            }
        }
    };
    /**
     * Pass the event to the event handler and try to schedule the timer.
     * @param {object} event - The event to be sent.
     */
    AWTTransmissionManagerCore.sendEvent = function (event) {
        if (this._newEventsAllowed) {
            //If the transmission is backed off then do not send synchronous events.
            //We will convert these events to High priority instead.
            if (this._currentBackoffCount > 0 && event.priority === Enums_1.AWTEventPriority.Immediate_sync) {
                event.priority = Enums_1.AWTEventPriority.High;
            }
            this._eventHandler.addEvent(event);
            this.scheduleTimer();
        }
    };
    /**
     * Sends events for all priority for the current inbound queue.
     * This method adds new inbound queues to which new events will be added.
     * Note: If LogManager is paused or flush is called again in less than 30 sec
     * then flush will be no-op and the callback will not be called.
     * @param {function} callback - The function to be called when flush is finished.
     */
    AWTTransmissionManagerCore.flush = function (callback) {
        var currentTime = (new Date()).getTime();
        if (!this._paused && this._lastUploadNowCall + MinDurationBetweenUploadNow < currentTime) {
            this._lastUploadNowCall = currentTime;
            if (this._timeout > -1) {
                clearTimeout(this._timeout);
                this._timeout = -1;
            }
            this._eventHandler.uploadNow(callback);
        }
    };
    /**
     * Pauses transmission. It pauses the http manager and also clears timers.
     */
    AWTTransmissionManagerCore.pauseTransmission = function () {
        if (!this._paused) {
            this.clearTimeout();
            this._eventHandler.pauseTransmission();
            this._paused = true;
        }
    };
    /**
     * Resumes tranmission. It resumes the http manager and tries to schedule the timer.
     */
    AWTTransmissionManagerCore.resumeTransmision = function () {
        if (this._paused) {
            this._paused = false;
            this._eventHandler.resumeTransmission();
            this.scheduleTimer();
        }
    };
    /**
     * Stops allowing new events being added for tranmission. It also batches all
     * events currently in the queue and creates requests from them to be sent.
     */
    AWTTransmissionManagerCore.flushAndTeardown = function () {
        AWTStatsManager_1.default.teardown();
        this._newEventsAllowed = false;
        this.clearTimeout();
        //No op if offline storage is added
        this._eventHandler.teardown();
    };
    /**
     * Backs off tranmission. This exponentially increases all the timers.
     */
    AWTTransmissionManagerCore.backOffTransmission = function () {
        if (this._currentBackoffCount < MaxBackoffCount) {
            this._currentBackoffCount++;
            this.clearTimeout();
            this.scheduleTimer();
        }
    };
    /**
     * Clears backoff for tranmission.
     */
    AWTTransmissionManagerCore.clearBackOff = function () {
        if (this._currentBackoffCount > 0) {
            this._currentBackoffCount = 0;
            this.clearTimeout();
            this.scheduleTimer();
        }
    };
    /**
     * Resets the transmit profiles to the default profiles of Real Time, Near Real Time
     * and Best Effort. This removes all the custom profiles that were loaded.
     */
    AWTTransmissionManagerCore._resetTransmitProfiles = function () {
        this.clearTimeout();
        this._initializeProfiles();
        this._currentProfile = DataModels_1.AWT_REAL_TIME;
        this.scheduleTimer();
    };
    AWTTransmissionManagerCore.clearTimeout = function () {
        if (this._timeout > 0) {
            clearTimeout(this._timeout);
            this._timeout = -1;
            this._timerCount = 0;
        }
    };
    AWTTransmissionManagerCore._batchAndSendEvents = function () {
        var priority = Enums_1.AWTEventPriority.High;
        this._timerCount++;
        if (this._timerCount * this._profiles[this._currentProfile][2] === this._profiles[this._currentProfile][0]) {
            priority = Enums_1.AWTEventPriority.Low;
            this._timerCount = 0;
        }
        else if (this._timerCount * this._profiles[this._currentProfile][2] === this._profiles[this._currentProfile][1]) {
            priority = Enums_1.AWTEventPriority.Normal;
        }
        this._eventHandler.sendEventsForPriorityAndAbove(priority);
        this._timeout = -1;
        this.scheduleTimer();
    };
    AWTTransmissionManagerCore._initializeProfiles = function () {
        this._profiles = {};
        this._profiles[DataModels_1.AWT_REAL_TIME] = [4, 2, 1];
        this._profiles[DataModels_1.AWT_NEAR_REAL_TIME] = [12, 6, 3];
        this._profiles[DataModels_1.AWT_BEST_EFFORT] = [36, 18, 9];
    };
    AWTTransmissionManagerCore._newEventsAllowed = false;
    AWTTransmissionManagerCore._currentProfile = DataModels_1.AWT_REAL_TIME;
    AWTTransmissionManagerCore._timeout = -1;
    AWTTransmissionManagerCore._currentBackoffCount = 0;
    AWTTransmissionManagerCore._paused = false;
    AWTTransmissionManagerCore._timerCount = 0;
    AWTTransmissionManagerCore._lastUploadNowCall = 0;
    return AWTTransmissionManagerCore;
}());
exports.default = AWTTransmissionManagerCore;
