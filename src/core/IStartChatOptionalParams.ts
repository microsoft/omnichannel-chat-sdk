import ILiveChatContext from "./ILiveChatContext";

export default interface IStartChatOptionalParams {
    liveChatContext?: ILiveChatContext
    preChatResponse?: object
}