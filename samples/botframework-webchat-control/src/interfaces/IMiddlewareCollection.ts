import { IWebChatMiddleware } from "./IWebChatMiddleware";

export interface IMiddlewareCollection {
    [name: string]: IWebChatMiddleware;
}