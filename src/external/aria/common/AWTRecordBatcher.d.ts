/**
* AWTRecordBatcher.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2017
*/
import { AWTEventDataWithMetaData } from './DataModels';
/**
* Class to batch events.
*/
export default class AWTRecordBatcher {
    private _outboundQueue;
    private _maxNumberOfEvents;
    private _currentBatch;
    private _currentNumEventsInBatch;
    constructor(_outboundQueue: {
        [token: string]: AWTEventDataWithMetaData[];
    }[], _maxNumberOfEvents: number);
    /**
     * Add an event to the current batch.
     * If the priority of the event is synchronous, it will also return the batch containing only the synchronous event.
     * @param {object} event - The event that needs to be batched.
     * @return {object} If the priority of the event is synchronous, it will also return the batch containing only the synchronous event.
     * Otherwise returns null.
     */
    addEventToBatch(event: AWTEventDataWithMetaData): {
        [token: string]: AWTEventDataWithMetaData[];
    };
    /**
     * Flush the current batch so that it is added to the outbound queue.
     */
    flushBatch(): void;
    /**
     * Check if there is a batch that contains events.
     */
    hasBatch(): boolean;
}
