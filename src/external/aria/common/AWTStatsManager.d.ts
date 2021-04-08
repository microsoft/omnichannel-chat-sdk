/**
* Class that manages the stats.
*/
export default class AWTStatsManager {
    private static _isInitalized;
    private static _stats;
    private static _sendStats;
    /**
     * Intiailizes the stats collection.
     * @param {function} sendStats - The function to call when the stats are ready to be sent.
     */
    static initialize(sendStats: (stats: {
        [statName: string]: number;
    }, tenantId: string) => void): void;
    /**
     * Flush the current stats and stop the stats collection.
     */
    static teardown(): void;
    /**
     * Increments the stat for event received.
     * @param {string} apiKey - The apiKey for which the event was received
     */
    static eventReceived(apiKey: string): void;
    /**
     * Creates an event for each tenant token which had a stat and calls the
     * sendStats for that token.
     */
    static flush(): void;
    private static _addStat(statName, value, apiKey);
}
