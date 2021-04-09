"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class to manage sending notifications to all the listeners.
 */
var AWTNotificationManager = /** @class */ (function () {
    function AWTNotificationManager() {
    }
    /**
     * Adds a notification listener.
     * @param {object} listener - The notification listener to be added.
     */
    AWTNotificationManager.addNotificationListener = function (listener) {
        this.listeners.push(listener);
    };
    /**
     * Removes all instances of the listener.
     * @param {object} listener - AWTNotificationListener to remove.
     */
    AWTNotificationManager.removeNotificationListener = function (listener) {
        var index = this.listeners.indexOf(listener);
        while (index > -1) {
            this.listeners.splice(index, 1);
            index = this.listeners.indexOf(listener);
        }
    };
    /**
     * Notification for events sent.
     * @param {object[]} events - The array of events that have been sent.
     */
    AWTNotificationManager.eventsSent = function (events) {
        var _this = this;
        var _loop_1 = function (i) {
            if (this_1.listeners[i].eventsSent) {
                setTimeout(function () { return _this.listeners[i].eventsSent(events); }, 0);
            }
        };
        var this_1 = this;
        for (var i = 0; i < this.listeners.length; ++i) {
            _loop_1(i);
        }
    };
    /**
     * Notification for events being dropped.
     * @param {object[]} events - The array of events that have been dropped.
     * @param {enum} reason     - The reason for which the SDK dropped the events.
     */
    AWTNotificationManager.eventsDropped = function (events, reason) {
        var _this = this;
        var _loop_2 = function (i) {
            if (this_2.listeners[i].eventsDropped) {
                setTimeout(function () { return _this.listeners[i].eventsDropped(events, reason); }, 0);
            }
        };
        var this_2 = this;
        for (var i = 0; i < this.listeners.length; ++i) {
            _loop_2(i);
        }
    };
    /**
     * Notification for events being retried when the request failed with a retryable status.
     * @param {object[]} events - The array of events that are being retried.
     */
    AWTNotificationManager.eventsRetrying = function (events) {
        var _this = this;
        var _loop_3 = function (i) {
            if (this_3.listeners[i].eventsRetrying) {
                setTimeout(function () { return _this.listeners[i].eventsRetrying(events); }, 0);
            }
        };
        var this_3 = this;
        for (var i = 0; i < this.listeners.length; ++i) {
            _loop_3(i);
        }
    };
    /**
     * Notification for events being rejected.
     * @param {object[]} events - The array of events that have been rejected.
     * @param {enum} reason     - The reason for which the SDK rejeceted the events.
     */
    AWTNotificationManager.eventsRejected = function (events, reason) {
        var _this = this;
        var _loop_4 = function (i) {
            if (this_4.listeners[i].eventsRejected) {
                setTimeout(function () { return _this.listeners[i].eventsRejected(events, reason); }, 0);
            }
        };
        var this_4 = this;
        for (var i = 0; i < this.listeners.length; ++i) {
            _loop_4(i);
        }
    };
    AWTNotificationManager.listeners = [];
    return AWTNotificationManager;
}());
exports.default = AWTNotificationManager;
