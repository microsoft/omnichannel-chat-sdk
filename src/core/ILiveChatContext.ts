import IChatToken from "../external/IC3Adapter/IChatToken";

export default interface ILiveChatContext {
    chatToken: IChatToken,
    requestId: string
}