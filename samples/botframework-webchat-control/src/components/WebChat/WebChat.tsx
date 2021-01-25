import React, { useCallback, useEffect, useState, useContext } from 'react';
import ReactWebChat from 'botframework-webchat';
import { IRawMessage, OmnichannelChatSDK } from '@microsoft/omnichannel-chat-sdk';
import { Download, Mail, MessageCircle, X} from 'react-feather';
import IChatTranscriptBody from '@microsoft/omnichannel-chat-sdk/lib/core/IChatTranscriptBody';
import { ActionType, Store } from '../../context';
import Loading from '../Loading/Loading';
import ChatButton from '../ChatButton/ChatButton';
import Calling from '../Calling/Calling';
import createCustomStore from './createCustomStore';
import { createDataMaskingMiddleware } from './createDataMaskingMiddleware';
import './WebChat.css';

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

      const chatConfig = await chatSDK.getLiveChatConfig();

      const store = createCustomStore();
      setWebChatStore(store.create());

      store.subscribe('DataMasking', createDataMaskingMiddleware(chatConfig));
    }

    console.log(state);
    init();
  }, [state]);

  const onNewMessage = useCallback((message: IRawMessage) => {
    console.log(`[onNewMessage] ${message.content}`);
    dispatch({type: ActionType.SET_LOADING, payload: false});
  }, [state, dispatch, chatAdapter]);

  const onTypingEvent = useCallback(() => {
    console.log(`[onTypingEvent]`);
  }, []);

  const onAgentEndSession = useCallback(() => {
    console.log(`[onAgentEndSession]`);
  }, []);

  const startChat = useCallback(async () => {
    console.log('[startChat]');

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
    setChatAdapter(undefined);
    dispatch({type: ActionType.SET_CHAT_STARTED, payload: false});
  }, [chatSDK]);

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
    console.log(transcriptBody);
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
          <div className="chat-header">
            <span> Live Chat </span>
            <div onClick={endChat}>
              <X />
            </div>
          </div>
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
            !state.isLoading && state.hasChatStarted && chatAdapter && <div className="action-bar">
              <Download
                size={'16'}
                color='rgb(22, 27, 34)'
                className='download-button'
                onClick={downloadTranscript}
              />
              <Mail
                size={'16'}
                color='rgb(22, 27, 34)'
                className='email-button'
                onClick={emailTranscript}
              />
            </div>
          }
        </div>
      }
    </>
  );
}

export default WebChat;
