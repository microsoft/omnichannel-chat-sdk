import * as AdaptiveCards from 'adaptivecards';
import AdaptiveCardFieldsValidator from './AdaptiveCardFieldsValidator';
import { CardElement, SerializationContext } from 'adaptivecards';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import ReactWebChat from 'botframework-webchat';
import { IRawMessage, OmnichannelChatSDK } from '@microsoft/omnichannel-chat-sdk';
import { ActionType, Store } from '../../context';
import Loading from '../Loading/Loading';
import ChatButton from '../ChatButton/ChatButton';
import ChatHeader from '../ChatHeader/ChatHeader';
import Calling from '../Calling/Calling';
import ActionBar from '../ActionBar/ActionBar';
import createCustomStore from './createCustomStore';
import createDataMaskingMiddleware from './createDataMaskingMiddleware';
import createActivityMiddleware from './createActivityMiddleware';
import createAvatarMiddleware from './createAvatarMiddleware';
import createActivityStatusMiddleware from './createActivityStatusMiddleware';
import createChannelDataMiddleware from './createChannelDataMiddleware';
import createTypingIndicatorMiddleware from './createTypingIndicatorMiddleware';
import fetchOmnichannelConfig from '../../utils/fetchOmnichannelConfig';
import fetchTelemetryConfig from '../../utils/fetchTelemetryConfig';
import fetchCallingConfig from '../../utils/fetchCallingConfig';
import fetchDebugConfig from '../../utils/fetchDebugConfig';
import transformLiveChatConfig, { ConfigurationManager } from '../../utils/transformLiveChatConfig';
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

const avatarMiddleware: any = createAvatarMiddleware();
const activityStatusMiddleware: any = createActivityStatusMiddleware();
const channelDataMiddleware: any = createChannelDataMiddleware();

let styleOptions = {
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

const createWebChatStyleOptions = (additionalStyleOptions: any = {}) => {
  (styleOptions as any).hideUploadButton = !ConfigurationManager.canUploadAttachment;

  if (additionalStyleOptions.hideSendBox) {
    (styleOptions as any).hideSendBox = additionalStyleOptions.hideSendBox;
  }

  styleOptions = {...styleOptions};
}

function WebChat() {
  const {state, dispatch} = useContext(Store);
  const [chatSDK, setChatSDK] = useState<OmnichannelChatSDK>();
  const [liveChatContext, setLiveChatContext] = useState<any>(undefined);
  const [preChatSurvey, setPreChatSurvey] = useState(undefined);
  const [preChatResponse, setPreChatResponse] = useState(undefined);
  const [chatAdapter, setChatAdapter] = useState<any>(undefined);
  const [webChatStore, setWebChatStore] = useState(undefined);
  const [chatToken, setChatToken] = useState(undefined);
  const [VoiceVideoCallingSDK, setVoiceVideoCallingSDK] = useState(undefined);
  const [typingIndicatorMiddleware, setTypingIndicatorMiddleware] = useState(undefined);
  const [activityMiddleware, setActivityMiddleware] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const chatSDK = new OmnichannelChatSDK(omnichannelConfig, {
        ...telemetryConfig
      });

      chatSDK.setDebug(!debugConfig.disable);

      await chatSDK.initialize();
      setChatSDK(chatSDK);

      const liveChatConfig = await chatSDK.getLiveChatConfig();
      transformLiveChatConfig(liveChatConfig);

      createWebChatStyleOptions();

      const liveChatContext = localStorage.getItem('liveChatContext');
      if (liveChatContext && Object.keys(JSON.parse(liveChatContext)).length > 0) {
        console.log("[liveChatContext]");
        console.log(liveChatContext);
        setLiveChatContext(liveChatContext);
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

    const typingIndicatorMiddleware: any = createTypingIndicatorMiddleware(() => {
      chatSDK?.sendTypingEvent();
    });

    setTypingIndicatorMiddleware(() => typingIndicatorMiddleware);

    const activityMiddleware: any = createActivityMiddleware(() => {
      createWebChatStyleOptions({hideSendBox: true});
      dispatch({type: ActionType.RERENDER_WEBCHAT, payload: true}); // Rerender webchat to hide SendBox on agent ending the conversation
    });

    setActivityMiddleware(() => activityMiddleware);

    const dataMaskingRules = await chatSDK?.getDataMaskingRules();
    const store = createCustomStore();
    setWebChatStore(store.create());

    store.subscribe('DataMasking', createDataMaskingMiddleware(dataMaskingRules));
    store.subscribe('ChannelData', channelDataMiddleware);

    // Check for active conversation in cache
    if (liveChatContext && Object.keys(JSON.parse(liveChatContext)).length > 0) {
      console.log("[liveChatContext]");
      optionalParams.liveChatContext = JSON.parse(liveChatContext);
    }

    dispatch({type: ActionType.SET_CHAT_STARTED, payload: true});

    // Start chats only if there's an existing live chat context or no PreChat
    if (liveChatContext || !preChatSurvey) {
      dispatch({type: ActionType.SET_LOADING, payload: true});

      try {
        await chatSDK?.startChat(optionalParams);
      } catch (error) {
        console.log(`Unable to start chat: ${error.message}`);
        return;
      }

      // Cache current conversation context
      const newliveChatContext = await chatSDK?.getCurrentLiveChatContext();
      if (newliveChatContext && Object.keys(newliveChatContext).length) {
        console.log('[newliveChatContext]')
        console.log(newliveChatContext);
        localStorage.setItem('liveChatContext', JSON.stringify(newliveChatContext));
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
  }, [chatSDK, state, dispatch, onAgentEndSession, onNewMessage, onTypingEvent, liveChatContext, preChatSurvey]);

  const endChat = useCallback(async () => {
    console.log('[endChat]');
    await chatSDK?.endChat();

    // Clean up
    (VoiceVideoCallingSDK as any)?.close();
    setChatAdapter(undefined);
    setChatToken(undefined);
    setLiveChatContext(undefined);
    setPreChatSurvey(undefined);
    setPreChatResponse(undefined);
    localStorage.removeItem('liveChatContext');
    dispatch({type: ActionType.SET_CHAT_STARTED, payload: false});
    dispatch({type: ActionType.RERENDER_WEBCHAT, payload: false});
  }, [chatSDK, dispatch, VoiceVideoCallingSDK]);

  const downloadTranscript = useCallback(async () => {
    console.log('[downloadTranscript]');
    const transcript = await chatSDK?.getLiveChatTranscript();
    console.log(transcript);
  }, [chatSDK]);

  const emailTranscript = useCallback(async () => {
    console.log('[emailTranscript]');
    const transcriptBody: any = {
      emailAddress: process.env.REACT_APP_email as string,
      attachmentMessage: 'Transcript',
      locale: 'en'
    }
    await chatSDK?.emailLiveChatTranscript(transcriptBody);
  }, [chatSDK]);

  const renderPreChatSurvey = useCallback(() => {
    const validator = new AdaptiveCardFieldsValidator();
    const adaptiveCard = new AdaptiveCards.AdaptiveCard();
    const context = new SerializationContext();

    // Add custom validation handler on parsing every field
    context.onParseElement = (element: CardElement, source: any, context: SerializationContext) => {
      validator.attachFieldValidator(element, source, context);
    }

    adaptiveCard.parse(preChatSurvey, context);

    adaptiveCard.onExecuteAction = async (action: AdaptiveCards.Action) => { // Adaptive Card event handler
        const inputs = adaptiveCard.getAllInputs();
        const canSubmitSurvey = validator.canSubmitSurvey(inputs);

        console.log(`[canSubmitSurvey] ${canSubmitSurvey}`);

        if (!canSubmitSurvey) {
          return;
        }

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
            (!liveChatContext || !Object.keys(liveChatContext).length) && preChatSurvey && !preChatResponse && renderPreChatSurvey()
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
            ((!state.isLoading && state.hasChatStarted && chatAdapter && webChatStore && activityMiddleware && typingIndicatorMiddleware) || state.rerenderWebChat) && <ReactWebChat
              activityMiddleware={activityMiddleware}
              avatarMiddleware={avatarMiddleware}
              activityStatusMiddleware={activityStatusMiddleware}
              typingIndicatorMiddleware={typingIndicatorMiddleware}
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
