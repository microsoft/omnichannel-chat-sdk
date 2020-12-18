import React, {createContext, useReducer, Context} from 'react';

enum ActionType {
  SET_CHAT_STARTED,
  SET_MESSAGES
}

interface IState {
  hasChatStarted: boolean,
  messages: any[]
}

interface StoreContext {
  state: IState,
  dispatch: React.Dispatch<any>
}

const initialState = {
  hasChatStarted: false,
  messages: [] as any
};

const Reducer = (state: any, action: any) => {
  switch (action.type) {
    case ActionType.SET_CHAT_STARTED:
      return {
        ...state,
        type: action.type,
        hasChatStarted: action.payload
      }
    case ActionType.SET_MESSAGES:
      return {
        ...state,
        type: action.type,
        messages: action.payload
      };
    default:
      return state;
  }
};

const Store:Context<StoreContext> = createContext({} as StoreContext);
const { Provider } = Store;

const StateProvider = (props: { children: React.ReactNode; }) => {
  const [state, dispatch] = useReducer(Reducer, initialState);
  console.log(state);
  return <Provider value={{state, dispatch} as any}>{props.children}</Provider>;
}

export {
  Store,
  StateProvider,
  ActionType
}