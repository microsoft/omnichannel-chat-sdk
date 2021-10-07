import IChatToken from "../external/IC3Adapter/IChatToken";

export default interface LiveChatContext {
    chatToken: IChatToken,
    requestId: string
}