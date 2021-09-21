import React, { useCallback, useEffect, useState } from 'react';
import { Widget, addResponseMessage, isWidgetOpened, dropMessages, addUserMessage, setQuickButtons } from 'react-chat-widget';
import {OmnichannelChatSDK, isCustomerMessage, isSystemMessage} from '@microsoft/omnichannel-chat-sdk';
import fetchOmnichannelConfig from '../../utils/fetchOmnichannelConfig';
import fetchTelemetryConfig from '../../utils/fetchTelemetryConfig';
import fetchDebugConfig from '../../utils/fetchDebugConfig';
import transformLiveChatConfig, { ConfigurationManager } from '../../utils/transformLiveChatConfig';
import 'react-chat-widget/lib/styles.css';

const omnichannelConfig: any = fetchOmnichannelConfig();
const telemetryConfig: any = fetchTelemetryConfig();
const debugConfig: any = fetchDebugConfig();

console.log(`%c [OmnichannelConfig]`, 'background-color:#001433;color:#fff');
console.log(omnichannelConfig);

console.log(`%c [telemetryConfig]`, 'background-color:#001433;color:#fff');
console.log(telemetryConfig);

console.log(`%c [debugConfig]`, 'background-color:#001433;color:#fff');
console.log(debugConfig);

const createQuickButtons = () => {
  const quickButtons = [];

  if (ConfigurationManager.canUploadAttachment) {
    quickButtons.push({label: 'Attachment', value: 'Attachment'});
  }

  return quickButtons;
}

function ChatWidget() {
  const [chatSDK, setChatSDK] = useState<OmnichannelChatSDK>();
  const [open, setOpen] = useState<boolean>(false);
  const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);

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

      const liveChatContext = localStorage.getItem('liveChatContext');
      if (liveChatContext && Object.keys(JSON.parse(liveChatContext)).length > 0) {
        console.log("[liveChatContext]");
        console.log(liveChatContext);
      }

      const quickButtons = createQuickButtons();
      setQuickButtons(quickButtons);
    }

    init();
  }, []);

  const handleNewUserMessage = async (newMessage: any) => {
    console.log(`New message incoming! ${newMessage}`);

    await chatSDK?.sendMessage({
      content: newMessage
    });
  };

  const onWidgetClick = useCallback(async (event: any) => {
    console.log('[onWidgetClick]');
    const open = isWidgetOpened();
    // console.log(`[isWidgetOpened] ${open}`);
    // console.log(`[hasChatStarted] ${hasChatStarted}`);
    setOpen(open);

    if (!hasChatStarted && open) {
      console.log(`[StartChat]`);

      const optionalParams: any = {};

      // Check for active conversation in cache
      const cachedLiveChatContext = localStorage.getItem('liveChatContext');
      if (cachedLiveChatContext && Object.keys(JSON.parse(cachedLiveChatContext)).length > 0) {
        console.log("[liveChatContext]");
        optionalParams.liveChatContext = JSON.parse(cachedLiveChatContext);
      }

      await chatSDK?.startChat(optionalParams);

      const chatToken = await chatSDK?.getChatToken();
      console.log(`[chatToken]`);
      console.log(chatToken);

      // Cache current conversation context
      const liveChatContext = await chatSDK?.getCurrentLiveChatContext();
      localStorage.setItem('liveChatContext', JSON.stringify(liveChatContext));

      chatSDK?.onNewMessage(async (message: any) => {
        if (isSystemMessage(message)) {
          addResponseMessage(message.content);
        } else if (isCustomerMessage(message)) {
          // Renders attachment
          if (message.fileMetadata) {
            console.log(`[onNewMessage][Attachment][User] ${message.fileMetadata.name}`);
            const blob = await chatSDK?.downloadFileAttachment(message.fileMetadata);
            const fileReader = new FileReader();
            fileReader.readAsDataURL(blob as Blob);
            fileReader.onloadend = () => {
              addUserMessage(`![attachment](${fileReader.result})`);
              return;
            }
          } else {
            addUserMessage(message.content);
          }
        } else {
          // Renders attachment
          if (message.fileMetadata) {
            console.log(`[onNewMessage][Attachment][Agent] ${message.fileMetadata.name}`);
            const blob = await chatSDK?.downloadFileAttachment(message.fileMetadata);
            const fileReader = new FileReader();
            fileReader.readAsDataURL(blob as Blob);
            fileReader.onloadend = () => {
              addResponseMessage(`![attachment](${fileReader.result})`);
              return;
            }
          } else {
            addResponseMessage(message.content);
          }
        }
      }, {
        rehydrate: true
      });

      setHasChatStarted(true);
    }

    if (hasChatStarted && !open) {
      console.log(`[CloseChat]`);
      await chatSDK?.endChat();

      // Clean up
      localStorage.removeItem('liveChatContext');
      dropMessages()
      setHasChatStarted(false);
    }
  }, [hasChatStarted, chatSDK, open]);

  const handleQuickButtonClicked = (value: string) => {
    console.log('[handleQuickButtonClicked]');
    if (value === 'Attachment') {
      const fileSelector = document.createElement('input');
      fileSelector.setAttribute('type', 'file');
      fileSelector.click();
      fileSelector.onchange = async (event: any) => {
        const file = event.target.files[0];
        console.log(file);
        console.log('[UploadFileAttachment]');
        chatSDK?.uploadFileAttachment(file);

        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onloadend = () => {
          addUserMessage(`![attachment](${fileReader.result})`);
        }
      }
    }
  }

  const handleTextInputChange = useCallback(async () => {
    console.log('[sendTypingEvent]')
    await chatSDK?.sendTypingEvent();
  }, [chatSDK]);

  return (
    <div>
      <h1> Omnichannel Chat SDK </h1>
      <div onClick={onWidgetClick}>
        <Widget
          title='Live Chat'
          subtitle='via omnichannel-sdk & react-chat-widget control'
          handleNewUserMessage={handleNewUserMessage}
          handleQuickButtonClicked={handleQuickButtonClicked}
          handleTextInputChange={handleTextInputChange}
        />
      </div>
    </div>
  );
}

export default ChatWidget;
