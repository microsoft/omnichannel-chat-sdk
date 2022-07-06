import InitContext from "@microsoft/ocsdk/lib/Model/InitContext";
import LiveChatContext from "./LiveChatContext";

export default interface StartChatOptionalParams {
    liveChatContext?: LiveChatContext;
    preChatResponse?: object;
    customContext?: object;
    browser?: string;
    os?: string;
    locale?: string;
    device?: string;
    initContext?: InitContext;
    reconnectId?: string;
    sendDefaultInitContext?: true;
}