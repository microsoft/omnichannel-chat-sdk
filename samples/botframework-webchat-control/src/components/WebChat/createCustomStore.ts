import {createStore} from 'botframework-webchat';
import {IMiddlewareCollection} from '../../interfaces/IMiddlewareCollection';
import {IWebChatMiddleware} from '../../interfaces/IWebChatMiddleware';
import { DIRECT_LINE_INCOMING_ACTIVITY } from './ActionTypes';

const ActionType = "actionType";
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

    // Add new middlewares
    public subscribe(name: string, middleware: IWebChatMiddleware): void {
        this.middlewares[name] = middleware;
    }

    public create() {
        console.log(`[CustomStore][create]`);
        return createStore(
            {}, // initial state
            ({ dispatch }: any) => (next: any) => (action: any) => {
                // console.log(`[Store] ${action.type}`);

                if (action.type === DIRECT_LINE_INCOMING_ACTIVITY) {
                    const { activity } = action.payload;
                    if (activity) {
                        action.payload.activity[ActionType] = DIRECT_LINE_INCOMING_ACTIVITY;
                    }
                }

                let nextAction = action;
                if (action && action.payload) {
                    for (const name of Object.keys(this.middlewares)) {
                        const currentMiddleware = this.middlewares[name];
                        // Apply middleware if applicable
                        if (currentMiddleware.applicable(nextAction)) {
                            const result = currentMiddleware.apply(nextAction);
                            if (result.dispatchAction) {
                                dispatch(result.dispatchAction);
                            }
                            if (result.nextAction) {
                                nextAction = result.nextAction;
                            }
                        }
                    }
                }
                return next(nextAction);
            }
        );
    }
}

const createCustomStore = () => {
    console.log(`[createCustomStore]`);
    const store = CustomStore.getInstance();
    return store;
};

export default createCustomStore;