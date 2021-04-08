"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Enums_1 = require("../common/Enums");
var AWTHttpManager_1 = require("./AWTHttpManager");
var AWTTransmissionManagerCore_1 = require("./AWTTransmissionManagerCore");
var AWTRecordBatcher_1 = require("../common/AWTRecordBatcher");
var AWTNotificationManager_1 = require("../common/AWTNotificationManager");
var Utils = require("../common/Utils");
var UploadNowCheckTimer = 250;
var MaxNumberEventPerBatch = 500;
var MaxSendAttempts = 6;
/**
 * Class that manages adding events to inbound queues and batching of events
 * into requests.
 */
var AWTQueueManager = /** @class */ (function () {
    /**
     * @constructor
     * @param {string} collectorUrl - The collector url to which the requests must be sent.
     */
    function AWTQueueManager(collectorUrl, _queueSizeLimit, xhrOverride, clockSkewRefreshDurationInMins) {
        this._queueSizeLimit = _queueSizeLimit;
        this._isCurrentlyUploadingNow = false;
        this._uploadNowQueue = [];
        this._shouldDropEventsOnPause = false;
        this._paused = false;
        this._queueSize = 0;
        this._outboundQueue = [];
        this._inboundQueues = {};
        this._inboundQueues[Enums_1.AWTEventPriority.High] = [];
        this._inboundQueues[Enums_1.AWTEventPriority.Normal] = [];
        this._inboundQueues[Enums_1.AWTEventPriority.Low] = [];
        this._addEmptyQueues();
        this._batcher = new AWTRecordBatcher_1.default(this._outboundQueue, MaxNumberEventPerBatch);
        this._httpManager = new AWTHttpManager_1.default(this._outboundQueue, collectorUrl, this, xhrOverride, clockSkewRefreshDurationInMins);
    }
    /**
     * Add an event to the appropriate inbound queue based on its priority.
     * @param {object} event - The event to be added to the queue.
     */
    AWTQueueManager.prototype.addEvent = function (event) {
        if (!Utils.isPriority(event.priority)) {
            //If invalid priority, then send it with normal priority
            event.priority = Enums_1.AWTEventPriority.Normal;
        }
        if (event.priority === Enums_1.AWTEventPriority.Immediate_sync) {
            //Log event synchronously
            this._httpManager.sendSynchronousRequest(this._batcher.addEventToBatch(event), event.apiKey);
        }
        else if (this._queueSize < this._queueSizeLimit) {
            this._addEventToProperQueue(event);
        }
        else {
            //Drop old event from lower or equal priority
            if (this._dropEventWithPriorityOrLess(event.priority)) {
                this._addEventToProperQueue(event);
            }
            else {
                //Can't drop events from current queues because the all the slots are taken by queues that are being flushed.
                AWTNotificationManager_1.default.eventsDropped([event], Enums_1.AWTEventsDroppedReason.QueueFull);
            }
        }
    };
    /**
     * Batch and send events currently in the queue for the given priority.
     * @param {enum} priority - Priority for which to send events.
     */
    AWTQueueManager.prototype.sendEventsForPriorityAndAbove = function (priority) {
        this._batchEvents(priority);
        this._httpManager.sendQueuedRequests();
    };
    /**
     * Check if the inbound queues or batcher has any events that can be sent presently.
     * @return {boolean} True if there are events, false otherwise.
     */
    AWTQueueManager.prototype.hasEvents = function () {
        return (this._inboundQueues[Enums_1.AWTEventPriority.High][0].length > 0 || this._inboundQueues[Enums_1.AWTEventPriority.Normal][0].length > 0
            || this._inboundQueues[Enums_1.AWTEventPriority.Low][0].length > 0 || this._batcher.hasBatch())
            && this._httpManager.hasIdleConnection();
    };
    /**
     * Add back the events from a failed request back to the queue.
     * @param {object} request - The request whose events need to be added back to the batcher.
     */
    AWTQueueManager.prototype.addBackRequest = function (request) {
        if (!this._paused || !this._shouldDropEventsOnPause) {
            for (var token in request) {
                if (request.hasOwnProperty(token)) {
                    for (var i = 0; i < request[token].length; ++i) {
                        if (request[token][i].sendAttempt < MaxSendAttempts) {
                            this.addEvent(request[token][i]);
                        }
                        else {
                            AWTNotificationManager_1.default.eventsDropped([request[token][i]], Enums_1.AWTEventsDroppedReason.MaxRetryLimit);
                        }
                    }
                }
            }
            AWTTransmissionManagerCore_1.default.scheduleTimer();
        }
    };
    /**
     * Batch all current events in the queues and send them.
     */
    AWTQueueManager.prototype.teardown = function () {
        if (!this._paused) {
            this._batchEvents(Enums_1.AWTEventPriority.Low);
            this._httpManager.teardown();
        }
    };
    /**
     * Sends events for all priority for the current inbound queue.
     * This method adds new inbound queues to which new events will be added.
     * @param {function} callback - The function to be called when uploadNow is finished.
     */
    AWTQueueManager.prototype.uploadNow = function (callback) {
        var _this = this;
        this._addEmptyQueues();
        if (!this._isCurrentlyUploadingNow) {
            this._isCurrentlyUploadingNow = true;
            setTimeout(function () { return _this._uploadNow(callback); }, 0);
        }
        else {
            this._uploadNowQueue.push(callback);
        }
    };
    /**
     * Pause the tranmission of any requests
     */
    AWTQueueManager.prototype.pauseTransmission = function () {
        this._paused = true;
        this._httpManager.pause();
        if (this._shouldDropEventsOnPause) {
            this._queueSize -= (this._inboundQueues[Enums_1.AWTEventPriority.High][0].length +
                this._inboundQueues[Enums_1.AWTEventPriority.Normal][0].length + this._inboundQueues[Enums_1.AWTEventPriority.Low][0].length);
            this._inboundQueues[Enums_1.AWTEventPriority.High][0] = [];
            this._inboundQueues[Enums_1.AWTEventPriority.Normal][0] = [];
            this._inboundQueues[Enums_1.AWTEventPriority.Low][0] = [];
            this._httpManager.removeQueuedRequests();
        }
    };
    /**
     * Resumes transmission of events.
     */
    AWTQueueManager.prototype.resumeTransmission = function () {
        this._paused = false;
        this._httpManager.resume();
    };
    /**
     * Determines whether events in the queues should be dropped when transmission is paused.
     */
    AWTQueueManager.prototype.shouldDropEventsOnPause = function (shouldDropEventsOnPause) {
        this._shouldDropEventsOnPause = shouldDropEventsOnPause;
    };
    /**
     * Remove the first queues for all priorities in the inbound queues map. This is called
     * when transmission manager has finished flushing the events in the old queues. We now make
     * the next queue the primary queue.
     */
    AWTQueueManager.prototype._removeFirstQueues = function () {
        this._inboundQueues[Enums_1.AWTEventPriority.High].shift();
        this._inboundQueues[Enums_1.AWTEventPriority.Normal].shift();
        this._inboundQueues[Enums_1.AWTEventPriority.Low].shift();
    };
    /**
     * Add empty queues for all priorities in the inbound queues map. This is called
     * when Transmission Manager is being flushed. This ensures that new events added
     * after flush are stored separately till we flush the current events.
     */
    AWTQueueManager.prototype._addEmptyQueues = function () {
        this._inboundQueues[Enums_1.AWTEventPriority.High].push([]);
        this._inboundQueues[Enums_1.AWTEventPriority.Normal].push([]);
        this._inboundQueues[Enums_1.AWTEventPriority.Low].push([]);
    };
    AWTQueueManager.prototype._addEventToProperQueue = function (event) {
        if (!this._paused || !this._shouldDropEventsOnPause) {
            this._queueSize++;
            this._inboundQueues[event.priority][this._inboundQueues[event.priority].length - 1].push(event);
        }
    };
    AWTQueueManager.prototype._dropEventWithPriorityOrLess = function (priority) {
        var currentPriority = Enums_1.AWTEventPriority.Low;
        while (currentPriority <= priority) {
            if (this._inboundQueues[currentPriority][this._inboundQueues[currentPriority].length - 1].length > 0) {
                //Dropped oldest event from lowest possible priority
                AWTNotificationManager_1.default.eventsDropped([this._inboundQueues[currentPriority][this._inboundQueues[currentPriority].length - 1].shift()], Enums_1.AWTEventsDroppedReason.QueueFull);
                return true;
            }
            currentPriority++;
        }
        return false;
    };
    AWTQueueManager.prototype._batchEvents = function (priority) {
        var priorityToProcess = Enums_1.AWTEventPriority.High;
        while (priorityToProcess >= priority) {
            while (this._inboundQueues[priorityToProcess][0].length > 0) {
                var event_1 = this._inboundQueues[priorityToProcess][0].pop();
                this._queueSize--;
                this._batcher.addEventToBatch(event_1);
            }
            priorityToProcess--;
        }
        this._batcher.flushBatch();
    };
    AWTQueueManager.prototype._uploadNow = function (callback) {
        var _this = this;
        if (this.hasEvents()) {
            this.sendEventsForPriorityAndAbove(Enums_1.AWTEventPriority.Low);
        }
        this._checkOutboundQueueEmptyAndSent(function () {
            //Move the next queues to be primary
            _this._removeFirstQueues();
            if (callback !== null && callback !== undefined) {
                callback();
            }
            if (_this._uploadNowQueue.length > 0) {
                setTimeout(function () { return _this._uploadNow(_this._uploadNowQueue.shift()); }, 0);
            }
            else {
                _this._isCurrentlyUploadingNow = false;
                if (_this.hasEvents()) {
                    AWTTransmissionManagerCore_1.default.scheduleTimer();
                }
            }
        });
    };
    AWTQueueManager.prototype._checkOutboundQueueEmptyAndSent = function (callback) {
        var _this = this;
        if (this._httpManager.isCompletelyIdle()) {
            callback();
        }
        else {
            setTimeout(function () { return _this._checkOutboundQueueEmptyAndSent(callback); }, UploadNowCheckTimer);
        }
    };
    return AWTQueueManager;
}());
exports.default = AWTQueueManager;
