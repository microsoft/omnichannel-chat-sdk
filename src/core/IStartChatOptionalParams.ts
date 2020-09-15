import IChatToken from "../external/IC3Adapter/IChatToken";
import ILiveChatContext from "./ILiveChatContext";

export default interface IStartChatOptionalParams {
    liveChatContext?: ILiveChatContext
    preChatResponse?: object,
    authenticatedUserToken?: string
}