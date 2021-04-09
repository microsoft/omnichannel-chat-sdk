"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
* AWTStatsManager.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
var Utils = require("./Utils");
var AWTNotificationManager_1 = require("./AWTNotificationManager");
var Enums_1 = require("./Enums");
var StatsTimer = 60000;
/**
* Class that manages the stats.
*/
var AWTStatsManager = /** @class */ (function () {
    function AWTStatsManager() {
    }
    /**
     * Intiailizes the stats collection.
     * @param {function} sendStats - The function to call when the stats are ready to be sent.
     */
    AWTStatsManager.initialize = function (sendStats) {
        var _this = this;
        this._sendStats = sendStats;
        this._isInitalized = true;
        AWTNotificationManager_1.default.addNotificationListener({
            eventsSent: function (events) {
                _this._addStat('records_sent_count', events.length, events[0].apiKey);
            },
            eventsDropped: function (events, reason) {
                switch (reason) {
                    case Enums_1.AWTEventsDroppedReason.NonRetryableStatus:
                        _this._addStat('d_send_fail', events.length, events[0].apiKey);
                        _this._addStat('records_dropped_count', events.length, events[0].apiKey);
                        break;
                    case Enums_1.AWTEventsDroppedReason.MaxRetryLimit:
                        _this._addStat('d_retry_limit', events.length, events[0].apiKey);
                        _this._addStat('records_dropped_count', events.length, events[0].apiKey);
                        break;
                    case Enums_1.AWTEventsDroppedReason.QueueFull:
                        _this._addStat('d_queue_full', events.length, events[0].apiKey);
                        break;
                }
            },
            eventsRejected: function (events, reason) {
                switch (reason) {
                    case Enums_1.AWTEventsRejectedReason.InvalidEvent:
                        _this._addStat('r_inv', events.length, events[0].apiKey);
                        break;
                    case Enums_1.AWTEventsRejectedReason.KillSwitch:
                        _this._addStat('r_kl', events.length, events[0].apiKey);
                        break;
                    case Enums_1.AWTEventsRejectedReason.SizeLimitExceeded:
                        _this._addStat('r_size', events.length, events[0].apiKey);
                        break;
                }
                _this._addStat('r_count', events.length, events[0].apiKey);
            },
            eventsRetrying: null
        });
        setTimeout(function () { return _this.flush(); }, StatsTimer);
    };
    /**
     * Flush the current stats and stop the stats collection.
     */
    AWTStatsManager.teardown = function () {
        if (this._isInitalized) {
            this.flush();
            this._isInitalized = false;
        }
    };
    /**
     * Increments the stat for event received.
     * @param {string} apiKey - The apiKey for which the event was received
     */
    AWTStatsManager.eventReceived = function (apiKey) {
        AWTStatsManager._addStat('records_received_count', 1, apiKey);
    };
    /**
     * Creates an event for each tenant token which had a stat and calls the
     * sendStats for that token.
     */
    AWTStatsManager.flush = function () {
        var _this = this;
        if (this._isInitalized) {
            for (var tenantId in this._stats) {
                if (this._stats.hasOwnProperty(tenantId)) {
                    this._sendStats(this._stats[tenantId], tenantId);
                }
            }
            this._stats = {};
            setTimeout(function () { return _this.flush(); }, StatsTimer);
        }
    };
    AWTStatsManager._addStat = function (statName, value, apiKey) {
        if (this._isInitalized && apiKey !== Utils.StatsApiKey) {
            var tenantId = Utils.getTenantId(apiKey);
            if (!this._stats[tenantId]) {
                this._stats[tenantId] = {};
            }
            if (!this._stats[tenantId][statName]) {
                this._stats[tenantId][statName] = value;
            }
            else {
                this._stats[tenantId][statName] = this._stats[tenantId][statName] + value;
            }
        }
    };
    AWTStatsManager._isInitalized = false;
    AWTStatsManager._stats = {};
    return AWTStatsManager;
}());
exports.default = AWTStatsManager;
