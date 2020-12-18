import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import { GiftedChat } from 'react-native-gifted-chat';
import { orgId, orgUrl, widgetId } from '@env';
import { IRawMessage, isSystemMessage, OmnichannelChatSDK } from '@microsoft/omnichannel-chat-sdk';
import { ActionType, Store } from '../context';
import { useDidAppearListener, useNavigationButtonPressedListener } from '../utils/hooks';

const buttons = {
  endChat: {
    id: 'CLOSE',
    text: 'End'
  },
  startChat: {
    id: 'START',
    text: 'Start'
  }
};

type ChatScreenProps = {
  componentId: string;
}

const createGiftedChatMessage = (message: any) => {
  return {
    _id: message.clientmessageid,
    text: message.content,
    createdAt: new Date(),
    system: message.tags?.includes("system"),
    received: true,
    sent: true,
    user: {
      _id: 2,
      name: 'Agent'
    }
  }
}


const ChatScreen = (props: ChatScreenProps) => {
  const {state, dispatch} = useContext(Store);
  const [chatSDK, setChatSDK] = useState<OmnichannelChatSDK>();
  // const [messages, setMessages] = useState([]);

  // TODO: Fix messages from context not updating
  const onNewMessage = useCallback((message: IRawMessage) => {
    console.log(`[onNewMessage] Received message: '${message.content}'`);
    // console.log(message);

    const { messages } = state;
    const giftedChatMessage = createGiftedChatMessage(message);

    if(message.fileMetadata) {
      // Handles file attachments
      return;
    }

    if (isSystemMessage(message)) {
      // messages.push({...giftedChatMessage, isSystemMessage: true, isAgentMessage: false, isAttachment: false});
    } else {
      // messages.push({...giftedChatMessage, isSystemMessage: false, isAgentMessage: true, isAttachment: false});
    }

    // console.log(messages);
    dispatch({type: ActionType.SET_MESSAGES, payload: GiftedChat.append(messages, [giftedChatMessage])});
  }, [state, chatSDK]);

  const onTypingEvent = useCallback(() => {
    console.log("[onTypingEvent]");
  }, [state]);

  useNavigationButtonPressedListener(async (event) => {
    const {buttonId, componentId} = event;
    if (componentId !== props.componentId) {
      return;
    }

    if (buttonId === buttons.endChat.id) {
      await chatSDK!.endChat();

      Navigation.mergeOptions(props.componentId, {
        topBar: {
          rightButtons: [{
            enabled: true,
            id: buttons.startChat.id,
            text: buttons.startChat.text,
            color: '#fff'
          }],
        }
      });

      dispatch({type: ActionType.SET_CHAT_STARTED, payload: false});
    }

    if (buttonId === buttons.startChat.id) {
      console.info('StartChat');
      await chatSDK!.startChat();
      chatSDK!.onNewMessage(onNewMessage);
      chatSDK!.onTypingEvent(onTypingEvent);

      Navigation.mergeOptions(props.componentId, {
        topBar: {
          rightButtons: [{
            enabled: true,
            id: buttons.endChat.id,
            text: buttons.endChat.text,
            color: '#fff'
          }],
        }
      });

      dispatch({type: ActionType.SET_CHAT_STARTED, payload: true});
    }
  }, [state, chatSDK, onNewMessage]);

  useEffect(() => {
    const init = async () => {
      // console.log(props);
      const omnichannelConfig  = {
        orgId,
        orgUrl,
        widgetId
      };

      console.info(omnichannelConfig);
      const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
      await chatSDK.initialize();
      setChatSDK(chatSDK);
    }

    Navigation.mergeOptions(props.componentId, {
      topBar: {
        rightButtons: [{
          enabled: true,
          id: buttons.endChat.id,
          text: buttons.endChat.text,
          color: '#fff'
        }],
      }
    });

    init();
  }, []);

  const init = useCallback(async () => {
    console.info('StartChat');
    await chatSDK!.startChat();
    chatSDK!.onNewMessage(onNewMessage);
    chatSDK!.onTypingEvent(onTypingEvent);

    dispatch({type: ActionType.SET_CHAT_STARTED, payload: true});
  }, [state, chatSDK, onNewMessage]);

  useDidAppearListener((event) => {
    const { componentId } = event;

    if (componentId !== props.componentId ) {
      return;
    }

    // Starts NEW chat only if chat screen is visible & chat has not started
    const {hasChatStarted} = state;
    !hasChatStarted && init();
  }, [state, chatSDK]);

  return (
    <>
      {/* <View style={styles.view}>
        <Text>Chat</Text>
      </View> */}
      <GiftedChat messages={state.messages}/>
    </>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

ChatScreen.options = {
  topBar: {
    title: {
      text: 'Chat'
    }
  }
}

export default ChatScreen;