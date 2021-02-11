import { IWebChatAction } from "./IWebChatAction";

export interface IResultAction {
    dispatchAction: IWebChatAction | null;
    nextAction: IWebChatAction;
}