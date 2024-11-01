import OmnichannelChatToken from "./OmnichannelChatToken";

/**
 * Context of a live chat conversation. It contains all the necessary metadata to interact with a conversation.
 *
 * chatToken: Omnichannel chat metadata to interact with message/voice client
 * requestId: Unique ID used to retrieve a conversation
 * reconnectId: Unique ID used to retrieve conversation for chat reconnect or persistent chat tied to the user
 */
export default interface LiveChatContext {
    chatToken: OmnichannelChatToken,
    requestId: string,
    reconnectId?: string,
    sessionId?: string
}