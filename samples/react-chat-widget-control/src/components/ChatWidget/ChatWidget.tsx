import React, { useEffect, useState } from 'react';
import { Widget, addResponseMessage, isWidgetOpened, toggleWidget } from 'react-chat-widget';
import fetchOmnichannelConfig from '../../utils/fetchOmnichannelConfig';
import {OmnichannelChatSDK} from '@microsoft/omnichannel-chat-sdk';
import 'react-chat-widget/lib/styles.css';

const omnichannelConfig: any = fetchOmnichannelConfig();

console.log(`%c [OmnichannelConfig]`, 'background-color:#001433;color:#fff');
console.log(omnichannelConfig);

function ChatWidget() {
  const [chatSDK, setChatSDK] = useState<OmnichannelChatSDK>();
  const [open, setOpen] = useState<boolean>(false);
  const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
      await chatSDK.initialize();
      setChatSDK(chatSDK);

      const liveChatContext = localStorage.getItem('liveChatContext');
      if (liveChatContext && Object.keys(JSON.parse(liveChatContext)).length > 0) {
        console.log("[liveChatContext]");
        console.log(liveChatContext);
      }
    }

    init();
    // Sample message from agent
    addResponseMessage('Hi, how can I help you?');
  }, []);

  const handleNewUserMessage = (newMessage: any) => {
    console.log(`New message incoming! ${newMessage}`);

    // TODO: Send message to Omnichannel
  };

  const onWidgetClick = (event: any) => {
    const open = isWidgetOpened();
    // console.log(`[isWidgetOpened] ${open}`);
    setOpen(open);

    if (!hasChatStarted && open) {
      console.log(`[StartNEWChat]`);
      setHasChatStarted(true);
    }

    if (hasChatStarted && !open) {
      console.log(`[CloseChat]`);
      setHasChatStarted(false);
    }
  }

  return (
    <div>
      <h1> Hello World!</h1>
      <div onClick={onWidgetClick}>
        <Widget
          handleNewUserMessage={handleNewUserMessage}
        />
      </div>
    </div>
  );
}

export default ChatWidget;
