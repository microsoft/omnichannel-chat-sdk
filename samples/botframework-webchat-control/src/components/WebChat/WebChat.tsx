import React, { useCallback, useEffect, useState, useContext } from 'react';
import ReactWebChat from 'botframework-webchat';
import { IRawMessage, OmnichannelChatSDK } from '@microsoft/omnichannel-chat-sdk';
import IChatTranscriptBody from '@microsoft/omnichannel-chat-sdk/lib/core/IChatTranscriptBody';
import { ActionType, Store } from '../../context';
import Loading from '../Loading/Loading';
import ChatButton from '../ChatButton/ChatButton';
import Calling from '../Calling/Calling';
import createCustomStore from './createCustomStore';
import { createDataMaskingMiddleware } from './createDataMaskingMiddleware';
import './WebChat.css';
import ChatHeader from '../ChatHeader/ChatHeader';
import ActionBar from '../ActionBar/ActionBar';

const omnichannelConfig = {
  orgId: process.env.REACT_APP_orgId || '',
  orgUrl: process.env.REACT_APP_orgUrl || '',
  widgetId: process.env.REACT_APP_widgetId || ''
};

console.log(omnichannelConfig);

function WebChat() {
  const {state, dispatch} = useContext(Store);
  const [chatSDK, setChatSDK] = useState<OmnichannelChatSDK>();
  const [chatAdapter, setChatAdapter] = useState<any>(undefined);
  const [webChatStore, setWebChatStore] = useState(undefined);
  const [VoiceVideoCallingSDK, setVoiceVideoCallingSDK] = useState(undefined);
  const [incomingCall, setIncomingCall] = useState(false);

  useEffect(() => {
    const init = async () => {
      const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
      await chatSDK.initialize();
      setChatSDK(chatSDK);

      if ((chatSDK as any).getVoiceVideoCalling) {
        try {
          const VoiceVideoCalling = await (chatSDK as any).getVoiceVideoCalling();
          VoiceVideoCalling.setDebug(true);
          setVoiceVideoCallingSDK(VoiceVideoCalling);
          console.log("VoiceVideoCalling loaded");
        } catch (e) {
          console.log(`Failed to load VoiceVideoCalling: ${e}`);
        }
      }
    }

    console.log(state);
    init();
  }, [state]);

  const onNewMessage = useCallback((message: IRawMessage) => {
    console.log(`[onNewMessage] ${message.content}`);
    dispatch({type: ActionType.SET_LOADING, payload: false});
  }, [state, dispatch]);

  const onTypingEvent = useCallback(() => {
    console.log(`[onTypingEvent]`);
  }, []);

  const onAgentEndSession = useCallback(() => {
    console.log(`[onAgentEndSession]`);
  }, []);

  const startChat = useCallback(async () => {
    console.log('[startChat]');

    const chatConfig = await chatSDK?.getLiveChatConfig();
    const store = createCustomStore();
    setWebChatStore(store.create());

    store.subscribe('DataMasking', createDataMaskingMiddleware(chatConfig));

    await chatSDK?.startChat();
    dispatch({type: ActionType.SET_CHAT_STARTED, payload: true});
    dispatch({type: ActionType.SET_LOADING, payload: true});

    chatSDK?.onNewMessage(onNewMessage);
    chatSDK?.onTypingEvent(onTypingEvent);
    chatSDK?.onAgentEndSession(onAgentEndSession);

    const chatAdapter = await chatSDK?.createChatAdapter();

    // Recommended way to listen to messages when using WebChat
    (chatAdapter as any).activity$.subscribe((activity: any) => {
      console.log(`[activity] ${activity.text}`);
      dispatch({type: ActionType.SET_LOADING, payload: false});
    });

    setChatAdapter(chatAdapter);

    if ((chatSDK as any).getVoiceVideoCalling) {
      const chatToken: any = await chatSDK?.getChatToken();
      try {
        await (VoiceVideoCallingSDK as any).initialize({
          chatToken,
          selfVideoHTMLElementId: 'selfVideo',
          remoteVideoHTMLElementId: 'remoteVideo',
          environment: 'test',
          OCClient: chatSDK?.OCClient
        });
        console.log("VoiceVideoCallingProxy initialized!");
        console.log(VoiceVideoCallingSDK);
      } catch (e) {
        console.error("Failed to initialize VoiceVideoCalling!");
        console.error(e);
      }

      (VoiceVideoCallingSDK as any).onCallAdded(() => {
        console.log('[WebChat][CallAdded]');
        (VoiceVideoCallingSDK as any).acceptCall({
          withVideo: true
        })

        // Fix height
        const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript__scrollable')[0] as HTMLElement;
        const remoteVideoContainer = document.getElementById('remoteVideo') as HTMLElement;

        const heightGap = webChatTranscriptContainer.clientHeight - remoteVideoContainer.clientHeight;
        webChatTranscriptContainer.style.marginTop = `${remoteVideoContainer.clientHeight}px`;
        webChatTranscriptContainer.style.height = `${heightGap}px`;
        setIncomingCall(true);
      });

      (VoiceVideoCallingSDK as any).onCallDisconnected(() => {
        console.log('[WebChat][CallDisconnected]');
        // Clean up
        const remoteVideoElement = document.getElementById('remoteVideo');
        while (remoteVideoElement?.firstChild) {
          console.log('[RemoteVideo][Clean Up]');
          remoteVideoElement.firstChild.remove();
        }

        const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript__scrollable')[0] as HTMLElement;
        webChatTranscriptContainer.style.marginTop = '';
        webChatTranscriptContainer.style.height = '';
      });

      (VoiceVideoCallingSDK as any).onLocalVideoStreamAdded(() => {
        console.log('[WebChat][LocalVideoStreamAdded]');
      });

      (VoiceVideoCallingSDK as any).onLocalVideoStreamRemoved(() => {
        console.log('[WebChat][LocalVideoStreamRemoved]');
      });

      (VoiceVideoCallingSDK as any).onRemoteVideoStreamAdded(() => {
        console.log('[WebChat][RemoteVideoStreamAdded]');
      });

      (VoiceVideoCallingSDK as any).onRemoteVideoStreamRemoved(() => {
        console.log('[WebChat][RemoteVideoStreamRemoved]');
      });
    }
  }, [chatSDK, chatAdapter, state, dispatch, onAgentEndSession, onNewMessage, onTypingEvent, VoiceVideoCallingSDK]);

  const endChat = useCallback(async () => {
    console.log('[endChat]');
    await chatSDK?.endChat();
    (VoiceVideoCallingSDK as any).close();
    setChatAdapter(undefined);
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
            title={'Live Chat with Chat SDK'}
            onClick={endChat}
          />
          {
            state.isLoading && <Loading />
          }
          <Calling />
          {
            !state.isLoading && state.hasChatStarted && chatAdapter && <ReactWebChat
              userID="teamsvisitor"
              directLine={chatAdapter}
              sendTypingIndicator={true}
              store={webChatStore}
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
