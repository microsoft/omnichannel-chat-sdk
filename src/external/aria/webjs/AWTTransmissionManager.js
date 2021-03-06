"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AWTTransmissionManagerCore_1 = require("./AWTTransmissionManagerCore");
/**
 * The AWTTransmissionManager calss is a wrapper class that exposes some of the
 * Transmission functionality needed by other Aria modules.
 */
var AWTTransmissionManager = /** @class */ (function () {
    function AWTTransmissionManager() {
    }
    /**
     * Sets the event handler used by the tranmission manager.
     * The default event handler is the Inbound queue manager. This handler
     * is used to batch and send events to Aria. If you intend to send events
     * to Aria please make sure that your event handler forwards events to the Inbound
     * Queue Manager. You can retrieve the Inbound Queue Manager by calling
     * getEventsHandler before you set your handler.
     * @param {object} eventsHandler - An AWTEventHandler event handler used by the tranmission
     * manager.
     */
    AWTTransmissionManager.setEventsHandler = function (eventsHandler) {
        AWTTransmissionManagerCore_1.default.setEventsHandler(eventsHandler);
    };
    /**
     * Gets the current event handler used by the tranmission manager.
     * @return {object} An AWTEventHandler event handler used by the tranmission manager.
     */
    AWTTransmissionManager.getEventsHandler = function () {
        return AWTTransmissionManagerCore_1.default.getEventsHandler();
    };
    /**
     * The scheduleTimer method tries to schedule the waiting period after which events are sent. If there are
     * no events to be sent, or if there is already a timer scheduled, or if the
     * http manager doesn't have any idle connections, then this method is no-op.
     */
    AWTTransmissionManager.scheduleTimer = function () {
        AWTTransmissionManagerCore_1.default.scheduleTimer();
    };
    return AWTTransmissionManager;
}());
exports.default = AWTTransmissionManager;
