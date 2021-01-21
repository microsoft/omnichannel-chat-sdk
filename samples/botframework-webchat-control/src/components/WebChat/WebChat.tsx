import React, { useCallback, useEffect, useState } from 'react';
import ReactWebChat from 'botframework-webchat';
import { OmnichannelChatSDK } from '@microsoft/omnichannel-chat-sdk';
import './WebChat.css';


const omnichannelConfig = {
  orgId: process.env.REACT_APP_orgId || '',
  orgUrl: process.env.REACT_APP_orgUrl || '',
  widgetId: process.env.REACT_APP_widgetId || ''
};

console.log(omnichannelConfig);

function WebChat() {
  const [chatSDK, setChatSDK] = useState<OmnichannelChatSDK>();
  const [chatAdapter, setChatAdapter] = useState<any>(undefined);
  const [hasChatStarted, setHasChatStarted] = useState(false);

  useEffect(() => {
    const init = async () => {
      const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
      await chatSDK.initialize();
      setChatSDK(chatSDK);
    }

    init();

    (window as any).feather && (window as any).feather.replace();
  }, []);

  const startChat = useCallback(async () => {
    console.log('[startChat]');
    await chatSDK?.startChat();

    const chatAdapter = await chatSDK?.createChatAdapter();
    setChatAdapter(chatAdapter);

    setHasChatStarted(true);

    (window as any).feather && (window as any).feather.replace();
  }, [chatSDK]);

  const endChat = useCallback(async () => {
    console.log('[endChat]');
    await chatSDK?.endChat();
    setChatAdapter(undefined);
    setHasChatStarted(false);

    (window as any).feather && (window as any).feather.replace();
  }, [chatSDK]);

  const startChatIconStyle = {
    color: 'white'
  };

  const endChatIconStyle = {
    color: 'black'
  }

  return (
    <>
      <div>
      {
        !hasChatStarted && <div className="chat-button" onClick={startChat}>
          <i data-feather="message-circle" style={startChatIconStyle}></i>
        </div>
      }
      </div>
      {
        hasChatStarted && chatAdapter && <div className="chat-container">
          <div className="chat-header">
            <span> Chat </span>
            <div onClick={endChat}>
              <i data-feather="x" style={endChatIconStyle}></i>
            </div>
          </div>
          <ReactWebChat
            userID="teamsvisitor"
            directLine={chatAdapter}
            sendTypingIndicator={true}
          />
        </div>
      }
    </>
  );
}

export default WebChat;
