import {createStore} from 'botframework-webchat';

export interface IWebChatAction {
    type: string;
    payload: object;
}

export interface IResultAction {
    dispatchAction: IWebChatAction;
    nextAction: IWebChatAction;
}

export interface IWebChatMiddleware {
    apply(action: any): IResultAction;
    applicable(action: any): boolean;
}

export interface IMiddlewareCollection {
    [name: string]: IWebChatMiddleware;
}

class CustomStore {
    private static _instance: CustomStore;
    private middlewares: IMiddlewareCollection;

    private constructor() {
        this.middlewares = {};
    }

    public static getInstance(): CustomStore {
        if (!this._instance) {
            this._instance = new CustomStore();
        }
        return this._instance;
    }

    public subscribe(name: string, middleware: IWebChatMiddleware): void {
        this.middlewares[name] = middleware;
    }

    public create() {
        console.log(`[CustomStore][create]`);
        return createStore(
            {}, // initial state
            ({ dispatch }: any) => (next: any) => (action: any) => {
                console.log(`[Store] ${action.type}`);
                return next(action);
            }
        )
    }
}

const createCustomStore = () => {
    console.log(`[createCustomStore]`);
    const store = CustomStore.getInstance();
    return store;
};

export default createCustomStore;