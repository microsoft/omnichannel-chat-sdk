import React, {createContext, useReducer, Context} from 'react';

enum ActionType {
  SET_CHAT_STARTED,
  SET_MESSAGES,
  SET_TYPING,
  SET_AGENT_END_SESSION_EVENT,
  SET_LOADING
}

interface IState {
  hasChatStarted: boolean,
  messages: any[],
  isTyping: boolean,
  agentEndSessionEvent: boolean,
  isLoading: boolean
}

interface StoreContext {
  state: IState,
  dispatch: React.Dispatch<any>
}

const initialState = {
  hasChatStarted: false,
  messages: [] as any,
  isTyping: false,
  agentEndSessionEvent: false,
  isLoading: false
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
    case ActionType.SET_TYPING:
      return {
        ...state,
        type: action.type,
        isTyping: action.payload
      }
    case ActionType.SET_AGENT_END_SESSION_EVENT:
      return {
        ...state,
        type: action.type,
        agentEndSessionEvent: action.payload
      }
    case ActionType.SET_LOADING:
      return {
        ...state,
        type: action.type,
        isLoading: action.payload
      }
    default:
      return state;
  }
};

const Store:Context<StoreContext> = createContext({} as StoreContext);
const { Provider } = Store;

const StateProvider = (props: { children: React.ReactNode; }) => {
  const [state, dispatch] = useReducer(Reducer, initialState);
  return <Provider value={{state, dispatch} as any}>{props.children}</Provider>;
}

export {
  Store,
  StateProvider,
  ActionType
}