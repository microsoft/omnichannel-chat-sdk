import React, { useCallback, useContext, useEffect, useState, } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { orgId, orgUrl, widgetId } from '@env';
import { IRawMessage, isSystemMessage, OmnichannelChatSDK } from '@microsoft/omnichannel-chat-sdk';
import { ActionType, Store } from '../context';
import { useDidAppearListener, useNavigationButtonPressedListener } from '../utils/hooks';
import TypingIndicator from '../components/TypingIndicator/TypingIndicator';

const typingAnimationDuration = 1500;
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
  inverted: boolean;
}

const createGiftedChatMessage = (message: any): IMessage => {
  return {
    _id: message.clientmessageid,
    text: message.content,
    createdAt: new Date(),
    system: isSystemMessage(message),
    // received: true,
    // sent: true,
    user: {
      _id: 1,
      name: 'Agent',
      avatar: 'https://placeimg.com/140/140/any'
    }
  }
}

const ChatScreen = (props: ChatScreenProps) => {
  const {state, dispatch} = useContext(Store);
  const [chatSDK, setChatSDK] = useState<OmnichannelChatSDK>();
  // const [messages, setMessages] = useState([]);

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
      const extraMetaData = {
        isSystemMessage: true,
        isAgentMessage: false,
        isAttachment: false
      };
      messages.unshift({...giftedChatMessage, ...extraMetaData});
    } else {
      const extraMetaData = {
        isSystemMessage: false,
        isAgentMessage: true,
        isAttachment: false
      };
      messages.unshift({...giftedChatMessage, ...extraMetaData});
    }

    // console.log(messages);
    dispatch({type: ActionType.SET_MESSAGES, payload: messages});
  }, [state, chatSDK]);

  const onTypingEvent = useCallback(() => {
    console.log("[onTypingEvent]");

    dispatch({type: ActionType.SET_TYPING, payload: true});
    setTimeout(() => {
      dispatch({type: ActionType.SET_TYPING, payload: false});
    }, typingAnimationDuration);
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
      dispatch({type: ActionType.SET_MESSAGES, payload: GiftedChat.append([], [])});
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

  const onSend = useCallback(async (outboundMessages: IMessage[]) => {
    const { hasChatStarted, messages } = state;

    if (!hasChatStarted) {
      return;
    }

    // console.info(outboundMessages);
    const outboundMessage = outboundMessages[0];
    const messageId = outboundMessage._id;
    const messageToSend = {
      content: outboundMessage.text
    };

    try {
      await chatSDK?.sendMessage(messageToSend);
      const extraMetaData = {
        isSystemMessage: false,
        isAgentMessage: false,
        isAttachment: false
      };
      outboundMessage.sent = true;
      messages.unshift({...outboundMessage, ...extraMetaData});
      dispatch({type: ActionType.SET_MESSAGES, payload: messages});
    } catch {
      console.error(`Failed to send message '${outboundMessage.text}' with _id ${messageId}`);
    }
  }, [state, chatSDK, onNewMessage]);

  const renderTypingIndicator = () => {
    return state.isTyping && (
      <View style={styles.typingContainer}>
        <TypingIndicator name={'Agent'} />
      </View>
    );
  };

  return (
    <>
      {/* <View style={styles.view}>
        <Text>Chat</Text>
      </View> */}
      <GiftedChat
        inverted={props.inverted}
        placeholder={'Type your message here'}
        alwaysShowSend
        messages={state.messages}
        // isTyping={state.isTyping}
        renderFooter={renderTypingIndicator}
        onSend={messages => onSend(messages)}
        user={{
          _id: 2,
          name: 'Customer',
          avatar: 'https://placeimg.com/140/140/any'
        }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  typingContainer: {
    paddingTop: 5,
    left: 5,
    bottom: 10
  }
});

ChatScreen.options = {
  topBar: {
    title: {
      text: 'Chat'
    }
  }
}

ChatScreen.defaultProps = {
  inverted: true
}

export default ChatScreen;