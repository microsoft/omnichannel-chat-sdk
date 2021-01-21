import React, { useCallback, useEffect, useState } from 'react';
import ReactWebChat from 'botframework-webchat';
import { OmnichannelChatSDK } from '@microsoft/omnichannel-chat-sdk';
import './App.css';

const omnichannelConfig = {
  orgId: process.env.REACT_APP_orgId || '',
  orgUrl: process.env.REACT_APP_orgUrl || '',
  widgetId: process.env.REACT_APP_widgetId || ''
};

console.log(omnichannelConfig);

function App() {
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
  }, []);

  const chatStyle = {
    width: '100vw',
    height: '100vh'
  };

  const startChat = useCallback(async () => {
    console.log('[startChat]');
    await chatSDK?.startChat();

    const chatAdapter = await chatSDK?.createChatAdapter();
    setChatAdapter(chatAdapter);

    setHasChatStarted(true);
  }, [chatSDK]);

  const endChat = useCallback(async () => {
    console.log('[endChat]');
    await chatSDK?.endChat();
    setChatAdapter(undefined);
    setHasChatStarted(false);
  }, [chatSDK]);

  return (
    <>
      <div>
        <button onClick={startChat}> Start </button>
        <button onClick={endChat}> End </button>
      </div>
      {
        hasChatStarted && chatAdapter && <div className="chat-container" style={chatStyle}>
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

export default App;
