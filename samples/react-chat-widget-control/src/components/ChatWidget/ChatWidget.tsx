import React, { useEffect } from 'react';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';

function ChatWidget() {
  useEffect(() => {
    // Sample message from agent
    addResponseMessage('Hi, how can I help you?');
  }, []);

  const handleNewUserMessage = (newMessage: any) => {
    console.log(`New message incoming! ${newMessage}`);

    // TODO: Send message to Omnichannel
  };

  return (
    <div>
      <h1> Hello World!</h1>
      <Widget
        handleNewUserMessage={handleNewUserMessage}
      />
    </div>
  );
}

export default ChatWidget;
