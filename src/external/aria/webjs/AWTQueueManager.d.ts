/**
* AWTQueueManager.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
import { AWTEventHandler, AWTXHROverride } from './DataModels';
import { AWTEventDataWithMetaData } from '../common/DataModels';
import { AWTEventPriority } from '../common/Enums';
import AWTHttpManager from './AWTHttpManager';
/**
 * Class that manages adding events to inbound queues and batching of events
 * into requests.
 */
export default class AWTQueueManager implements AWTEventHandler {
    private _queueSizeLimit;
    private _batcher;
    private _isCurrentlyUploadingNow;
    private _uploadNowQueue;
    private _shouldDropEventsOnPause;
    private _paused;
    private _queueSize;
    _httpManager: AWTHttpManager;
    _outboundQueue: {
        [token: string]: AWTEventDataWithMetaData[];
    }[];
    _inboundQueues: {
        [eventPriority: number]: AWTEventDataWithMetaData[][];
    };
    /**
     * @constructor
     * @param {string} collectorUrl - The collector url to which the requests must be sent.
     */
    constructor(collectorUrl: string, _queueSizeLimit: number, xhrOverride?: AWTXHROverride, clockSkewRefreshDurationInMins?: number);
    /**
     * Add an event to the appropriate inbound queue based on its priority.
     * @param {object} event - The event to be added to the queue.
     */
    addEvent(event: AWTEventDataWithMetaData): void;
    /**
     * Batch and send events currently in the queue for the given priority.
     * @param {enum} priority - Priority for which to send events.
     */
    sendEventsForPriorityAndAbove(priority: AWTEventPriority): void;
    /**
     * Check if the inbound queues or batcher has any events that can be sent presently.
     * @return {boolean} True if there are events, false otherwise.
     */
    hasEvents(): boolean;
    /**
     * Add back the events from a failed request back to the queue.
     * @param {object} request - The request whose events need to be added back to the batcher.
     */
    addBackRequest(request: {
        [token: string]: AWTEventDataWithMetaData[];
    }): void;
    /**
     * Batch all current events in the queues and send them.
     */
    teardown(): void;
    /**
     * Sends events for all priority for the current inbound queue.
     * This method adds new inbound queues to which new events will be added.
     * @param {function} callback - The function to be called when uploadNow is finished.
     */
    uploadNow(callback: () => void): void;
    /**
     * Pause the tranmission of any requests
     */
    pauseTransmission(): void;
    /**
     * Resumes transmission of events.
     */
    resumeTransmission(): void;
    /**
     * Determines whether events in the queues should be dropped when transmission is paused.
     */
    shouldDropEventsOnPause(shouldDropEventsOnPause: boolean): void;
    /**
     * Remove the first queues for all priorities in the inbound queues map. This is called
     * when transmission manager has finished flushing the events in the old queues. We now make
     * the next queue the primary queue.
     */
    private _removeFirstQueues();
    /**
     * Add empty queues for all priorities in the inbound queues map. This is called
     * when Transmission Manager is being flushed. This ensures that new events added
     * after flush are stored separately till we flush the current events.
     */
    private _addEmptyQueues();
    private _addEventToProperQueue(event);
    private _dropEventWithPriorityOrLess(priority);
    private _batchEvents(priority);
    private _uploadNow(callback);
    private _checkOutboundQueueEmptyAndSent(callback);
}
