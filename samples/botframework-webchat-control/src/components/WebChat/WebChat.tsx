import React, { useCallback, useEffect, useState, useContext } from 'react';
import ReactWebChat from 'botframework-webchat';
import { IRawMessage, OmnichannelChatSDK } from '@microsoft/omnichannel-chat-sdk';
import IChatTranscriptBody from '@microsoft/omnichannel-chat-sdk/lib/core/IChatTranscriptBody';
import { ActionType, Store } from '../../context';
import Loading from '../Loading/Loading';
import ChatButton from '../ChatButton/ChatButton';
import ChatHeader from '../ChatHeader/ChatHeader';
import Calling from '../Calling/Calling';
import ActionBar from '../ActionBar/ActionBar';
import createCustomStore from './createCustomStore';
import { createDataMaskingMiddleware } from './createDataMaskingMiddleware';
import createActivityMiddleware from './createActivityMiddleware';
import createAvatarMiddleware from './createAvatarMiddleware';
import fetchOmnichannelConfig from '../../utils/fetchOmnichannelConfig';
import fetchTelemetryConfig from '../../utils/fetchTelemetryConfig';
import fetchCallingConfig from '../../utils/fetchCallingConfig';
import fetchDebugConfig from '../../utils/fetchDebugConfig';
import * as AdaptiveCards from 'adaptivecards';
import './WebChat.css';

const omnichannelConfig: any = fetchOmnichannelConfig();
const telemetryConfig: any = fetchTelemetryConfig();
const callingConfig: any = fetchCallingConfig();
const debugConfig: any = fetchDebugConfig();

console.log(`%c [OmnichannelConfig]`, 'background-color:#001433;color:#fff');
console.log(omnichannelConfig);

console.log(`%c [telemetryConfig]`, 'background-color:#001433;color:#fff');
console.log(telemetryConfig);

console.log(`%c [callingConfig]`, 'background-color:#001433;color:#fff');
console.log(callingConfig);

console.log(`%c [debugConfig]`, 'background-color:#001433;color:#fff');
console.log(debugConfig);

const activityMiddleware: any = createActivityMiddleware();
const avatarMiddleware: any = createAvatarMiddleware();
const styleOptions = {
  bubbleBorderRadius: 10,
  bubbleNubSize: 10,
  bubbleNubOffset: 15,

  bubbleFromUserBorderRadius: 10,
  bubbleFromUserNubSize: 10,
  bubbleFromUserNubOffset: 15,
  bubbleFromUserBackground: 'rgb(246, 246, 246)'
}

const patchAdaptiveCard = (adaptiveCard: any) => {
  return JSON.parse(adaptiveCard.replaceAll("&#42;", "*"));  // HTML entities '&#42;' is not unescaped for some reason
}

function WebChat() {
  const {state, dispatch} = useContext(Store);
  const [chatSDK, setChatSDK] = useState<OmnichannelChatSDK>();
  const [preChatSurvey, setPreChatSurvey] = useState(undefined);
  const [preChatResponse, setPreChatResponse] = useState(undefined);
  const [chatAdapter, setChatAdapter] = useState<any>(undefined);
  const [webChatStore, setWebChatStore] = useState(undefined);
  const [chatToken, setChatToken] = useState(undefined);
  const [VoiceVideoCallingSDK, setVoiceVideoCallingSDK] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const chatSDK = new OmnichannelChatSDK(omnichannelConfig, {
        ...telemetryConfig
      });

      chatSDK.setDebug(!debugConfig.disable);

      await chatSDK.initialize();
      setChatSDK(chatSDK);

      const liveChatContext = localStorage.getItem('liveChatContext');
      if (liveChatContext && Object.keys(JSON.parse(liveChatContext)).length > 0) {
        console.log("[liveChatContext]");
        console.log(liveChatContext);
      }

      if ((chatSDK as any).getVoiceVideoCalling && !callingConfig.disable) {
        try {
          const VoiceVideoCalling = await (chatSDK as any).getVoiceVideoCalling();
          VoiceVideoCalling.setDebug(true);
          setVoiceVideoCallingSDK(VoiceVideoCalling);
          console.log("VoiceVideoCalling loaded");
        } catch (e) {
          console.log(`Failed to load VoiceVideoCalling: ${e}`);
        }
      }

      let preChatSurvey = await chatSDK.getPreChatSurvey(false);
      if (preChatSurvey) {
        console.info('[PreChatSurvey]');
        preChatSurvey = patchAdaptiveCard(preChatSurvey);
        console.log(preChatSurvey);
        setPreChatSurvey(preChatSurvey);
      }
    }

    console.log(state);
    init();
  }, []);

  const onNewMessage = useCallback((message: IRawMessage) => {
    console.log(`[onNewMessage] ${message.content}`);
    dispatch({type: ActionType.SET_LOADING, payload: false});
  }, [dispatch]);

  const onTypingEvent = useCallback(() => {
    console.log(`[onTypingEvent]`);
  }, []);

  const onAgentEndSession = useCallback(() => {
    console.log(`[onAgentEndSession]`);
  }, []);

  const startChat = useCallback(async (_, optionalParams = {}) => {
    if (state.hasChatStarted) {
      return;
    }

    console.log('[startChat]');

    const dataMaskingRules = await chatSDK?.getDataMaskingRules();
    const store = createCustomStore();
    setWebChatStore(store.create());

    store.subscribe('DataMasking', createDataMaskingMiddleware(dataMaskingRules));

    // Check for active conversation in cache
    const cachedLiveChatContext = localStorage.getItem('liveChatContext');
    if (cachedLiveChatContext && Object.keys(JSON.parse(cachedLiveChatContext)).length > 0) {
      console.log("[liveChatContext]");
      optionalParams.liveChatContext = JSON.parse(cachedLiveChatContext);
    }

    dispatch({type: ActionType.SET_CHAT_STARTED, payload: true});

    // Start chats only if there's an existing live chat context or no PreChat
    if (cachedLiveChatContext || !preChatSurvey) {
      dispatch({type: ActionType.SET_LOADING, payload: true});

      try {
        await chatSDK?.startChat(optionalParams);
      } catch (error) {
        console.log(`Unable to start chat: ${error.message}`);
        return;
      }

      // Cache current conversation context
      const liveChatContext = await chatSDK?.getCurrentLiveChatContext();
      if (liveChatContext && Object.keys(liveChatContext).length) {
        localStorage.setItem('liveChatContext', JSON.stringify(liveChatContext));
      }

      chatSDK?.onNewMessage(onNewMessage, {rehydrate: true});
      chatSDK?.onTypingEvent(onTypingEvent);
      chatSDK?.onAgentEndSession(onAgentEndSession);

      const chatAdapter = await chatSDK?.createChatAdapter();

      setChatAdapter(chatAdapter);
      dispatch({type: ActionType.SET_LOADING, payload: false});

      if ((chatSDK as any)?.getVoiceVideoCalling) {
        const chatToken: any = await chatSDK?.getChatToken();
        setChatToken(chatToken);
      }
    }
  }, [chatSDK, state, dispatch, onAgentEndSession, onNewMessage, onTypingEvent, preChatSurvey]);

  const endChat = useCallback(async () => {
    console.log('[endChat]');
    await chatSDK?.endChat();

    // Clean up
    (VoiceVideoCallingSDK as any)?.close();
    setChatAdapter(undefined);
    setChatToken(undefined);
    setPreChatSurvey(undefined);
    setPreChatResponse(undefined);
    localStorage.removeItem('liveChatContext');
    dispatch({type: ActionType.SET_CHAT_STARTED, payload: false});
  }, [chatSDK, dispatch, VoiceVideoCallingSDK]);

  const downloadTranscript = useCallback(async () => {
    console.log('[downloadTranscript]');
    const transcript = await chatSDK?.getLiveChatTranscript();
    console.log(transcript);
  }, [chatSDK]);

  const emailTranscript = useCallback(async () => {
    console.log('[emailTranscript]');
    const transcriptBody: IChatTranscriptBody = {
      emailAddress: process.env.REACT_APP_email as string,
      attachmentMessage: 'Transcript',
      locale: 'en'
    }
    await chatSDK?.emailLiveChatTranscript(transcriptBody);
  }, [chatSDK]);

  const renderPreChatSurvey = useCallback(() => {
    const adaptiveCard = new AdaptiveCards.AdaptiveCard();
    adaptiveCard.parse(preChatSurvey);
    adaptiveCard.onExecuteAction = async (action: AdaptiveCards.Action) => { // Adaptive Card event handler
        const preChatResponse = (action as any).data;

        setPreChatResponse(preChatResponse);

        const optionalParams: any = {};
        if (preChatResponse) {
          optionalParams.preChatResponse = preChatResponse;
        }

        dispatch({type: ActionType.SET_LOADING, payload: true});

        try {
          await chatSDK?.startChat(optionalParams);
        } catch (error) {
          console.log(`Unable to start chat: ${error.message}`);
          return;
        }

        // Cache current conversation context
        const liveChatContext = await chatSDK?.getCurrentLiveChatContext();
        if (liveChatContext && Object.keys(liveChatContext).length) {
          localStorage.setItem('liveChatContext', JSON.stringify(liveChatContext));
        }

        chatSDK?.onNewMessage(onNewMessage, {rehydrate: true});
        chatSDK?.onTypingEvent(onTypingEvent);
        chatSDK?.onAgentEndSession(onAgentEndSession);

        const chatAdapter = await chatSDK?.createChatAdapter();

        setChatAdapter(chatAdapter);
        dispatch({type: ActionType.SET_LOADING, payload: false});

        if ((chatSDK as any)?.getVoiceVideoCalling) {
          const chatToken: any = await chatSDK?.getChatToken();
          setChatToken(chatToken);
        }
    }

    const renderedCard = adaptiveCard.render(); // Renders as HTML element
    return <div ref={(n) => { // Returns React element
      n && n.firstChild && n.removeChild(n.firstChild); // Removes duplicates fix
      renderedCard && n && n.appendChild(renderedCard);
    }} />
  }, [chatSDK, preChatSurvey])

  return (
    <>
      <div>
        {
          !state.hasChatStarted && <ChatButton onClick={startChat} />
        }
      </div>
      {
        state.hasChatStarted && <div className="chat-container">
          <ChatHeader
            title={'Live Chat via Chat SDK'}
            onClick={endChat}
          />
          {
            preChatSurvey && !preChatResponse && renderPreChatSurvey()
          }
          {
            state.isLoading && <Loading />
          }
          {
            !callingConfig.disable && VoiceVideoCallingSDK && chatToken && <Calling
              VoiceVideoCallingSDK={VoiceVideoCallingSDK}
              OCClient={chatSDK?.OCClient}
              chatToken={chatToken}
            />
          }
          {
            !state.isLoading && state.hasChatStarted && chatAdapter && webChatStore && activityMiddleware && <ReactWebChat
              activityMiddleware={activityMiddleware}
              avatarMiddleware={avatarMiddleware}
              userID="teamsvisitor"
              directLine={chatAdapter}
              sendTypingIndicator={true}
              store={webChatStore}
              styleOptions={styleOptions}
            />
          }
          {
            !state.isLoading && state.hasChatStarted && chatAdapter && <ActionBar
              onDownloadClick={downloadTranscript}
              onEmailTranscriptClick={emailTranscript}
            />
          }
        </div>
      }
    </>
  );
}

export default WebChat;
