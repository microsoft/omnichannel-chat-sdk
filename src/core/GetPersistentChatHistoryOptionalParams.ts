export default interface GetPersistentChatHistoryOptionalParams {
    /**
     * Number of messages to retrieve per page (Optional).
     */
    pageSize?: number;

    /**
     * Token for pagination to get the next page of results (Optional).
     */
    pageToken?: string;
}
