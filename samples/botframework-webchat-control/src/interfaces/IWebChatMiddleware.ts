import { IResultAction } from "./IResultAction";

export interface IWebChatMiddleware {
    apply(action: any): IResultAction;
    applicable(action: any): boolean;
}