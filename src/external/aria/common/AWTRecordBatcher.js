"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Enums_1 = require("./Enums");
/**
* Class to batch events.
*/
var AWTRecordBatcher = /** @class */ (function () {
    function AWTRecordBatcher(_outboundQueue, _maxNumberOfEvents) {
        this._outboundQueue = _outboundQueue;
        this._maxNumberOfEvents = _maxNumberOfEvents;
        this._currentBatch = {};
        this._currentNumEventsInBatch = 0;
    }
    /**
     * Add an event to the current batch.
     * If the priority of the event is synchronous, it will also return the batch containing only the synchronous event.
     * @param {object} event - The event that needs to be batched.
     * @return {object} If the priority of the event is synchronous, it will also return the batch containing only the synchronous event.
     * Otherwise returns null.
     */
    AWTRecordBatcher.prototype.addEventToBatch = function (event) {
        if (event.priority === Enums_1.AWTEventPriority.Immediate_sync) {
            //batch immediate priority into its own batch
            var immediateBatch = {};
            immediateBatch[event.apiKey] = [event];
            return immediateBatch;
        }
        else {
            if (this._currentNumEventsInBatch >= this._maxNumberOfEvents) {
                this.flushBatch();
            }
            if (this._currentBatch[event.apiKey] === undefined) {
                this._currentBatch[event.apiKey] = [];
            }
            this._currentBatch[event.apiKey].push(event);
            this._currentNumEventsInBatch++;
        }
        return null;
    };
    /**
     * Flush the current batch so that it is added to the outbound queue.
     */
    AWTRecordBatcher.prototype.flushBatch = function () {
        if (this._currentNumEventsInBatch > 0) {
            this._outboundQueue.push(this._currentBatch);
            this._currentBatch = {};
            this._currentNumEventsInBatch = 0;
        }
    };
    /**
     * Check if there is a batch that contains events.
     */
    AWTRecordBatcher.prototype.hasBatch = function () {
        return this._currentNumEventsInBatch > 0;
    };
    return AWTRecordBatcher;
}());
exports.default = AWTRecordBatcher;
