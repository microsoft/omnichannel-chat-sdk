import ILiveChatContext from "./ILiveChatContext";

export default interface IStartChatOptionalParams {
    liveChatContext?: ILiveChatContext;
    preChatResponse?: object;
    customContext?: object;
    browser?: string;
    os?: string;
    locale?: string;
    device?: string;
}