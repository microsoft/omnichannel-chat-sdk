import {createStore} from 'botframework-webchat';

const createCustomStore = () => {
    console.log(`[createCustomStore]`);
    return createStore(
        {}, // initial state
        ({ dispatch }: any) => (next: any) => (action: any) => {
            console.log(`[Store] ${action.type}`);
            return next(action);
        }
    )
};

export default createCustomStore;