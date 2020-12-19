import React, { Component, useCallback, useContext, useEffect, useState, } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import { GiftedChat, IMessage, Composer, Send } from 'react-native-gifted-chat';
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
      avatar: 'https://placeimg.com/140/140/people'
    }
  }
}

const ChatScreen = (props: ChatScreenProps) => {
  const {state, dispatch} = useContext(Store);
  const [chatSDK, setChatSDK] = useState<OmnichannelChatSDK>();
  // const [messages, setMessages] = useState([]);

  const onNewMessage = useCallback(async (message: IRawMessage) => {
    console.log(`[onNewMessage] Received message: '${message.content}'`);
    // console.log(message);

    const { messages } = state;
    const giftedChatMessage = createGiftedChatMessage(message);

    const extraMetaData = {
      isSystemMessage: false,
      isAgentMessage: false,
      isAttachment: false
    };

    // Handles file attachments
    if(message.fileMetadata) {
      try {
        const blobResponse = await chatSDK!.downloadFileAttachment(message.fileMetadata);
        const fileReaderInstance = new FileReader();
        fileReaderInstance.readAsDataURL(blobResponse);
        fileReaderInstance.onload = () => {
          const base64data = fileReaderInstance.result;

          // TODO: Handle specific attachments format (video, pdf, etc)
          giftedChatMessage.image = base64data;

          extraMetaData.isAttachment = true;

          // Wait until image is downloaded succesfully before updating messages
          messages.unshift({...giftedChatMessage, ...extraMetaData});
        };
      } catch (error) {
        console.error('[downloadFileAttachment] Failed!');
        console.error(error);
      }
    } else if (isSystemMessage(message)) {
      extraMetaData.isSystemMessage = true;
      messages.unshift({...giftedChatMessage, ...extraMetaData});
    } else {
      extraMetaData.isAgentMessage = true;
      messages.unshift({...giftedChatMessage, ...extraMetaData});
    }

    dispatch({type: ActionType.SET_MESSAGES, payload: messages});
  }, [state, chatSDK]);

  const onTypingEvent = useCallback(() => {
    console.info("[onTypingEvent]");

    dispatch({type: ActionType.SET_TYPING, payload: true});
    setTimeout(() => {
      dispatch({type: ActionType.SET_TYPING, payload: false});
    }, typingAnimationDuration);
  }, [state]);

  const onAgentEndSession = useCallback(() => {
    console.info("[onAgentEndSession]");

    dispatch({type: ActionType.SET_AGENT_END_SESSION_EVENT, payload: true});
  }, [state]);

  useNavigationButtonPressedListener(async (event) => {
    const {buttonId, componentId} = event;
    if (componentId !== props.componentId) {
      return;
    }

    // Handles clicking end chat button
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
      dispatch({type: ActionType.SET_AGENT_END_SESSION_EVENT, payload: false});
    }

    // Handles clicking start chat button
    if (buttonId === buttons.startChat.id) {
      console.info('[ClickStartChat]');
      await chatSDK!.startChat();
      chatSDK!.onNewMessage(onNewMessage);
      chatSDK!.onTypingEvent(onTypingEvent);
      chatSDK!.onAgentEndSession(onAgentEndSession);

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
      dispatch({type: ActionType.SET_AGENT_END_SESSION_EVENT, payload: false});
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

  const startNewChat = useCallback(async () => {
    console.info('[StartNEWChat]');
    await chatSDK!.startChat();
    chatSDK!.onNewMessage(onNewMessage);
    chatSDK!.onTypingEvent(onTypingEvent);
    chatSDK!.onAgentEndSession(onAgentEndSession);

    dispatch({type: ActionType.SET_CHAT_STARTED, payload: true});
  }, [state, chatSDK, onNewMessage]);

  useDidAppearListener((event) => {
    const { componentId } = event;

    if (componentId !== props.componentId ) {
      return;
    }

    // Starts NEW chat only if chat screen is visible & chat has not started
    const {hasChatStarted} = state;
    !hasChatStarted && startNewChat();
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

  const onInputTextChanged = useCallback(async (text: string) => {
    const { hasChatStarted } = state;

    if (!hasChatStarted) {
      return;
    }

    console.log('[SendTyping]');
    await chatSDK?.sendTypingEvent();
  }, [state, chatSDK]);

  const renderComposer = (props: any) => {
    // Hides composer on agent ending the session
    if (state.agentEndSessionEvent) {
      return null;
    }
    return <Composer {...props}/>;
  }

  const renderSend = (props: any) => {
    // Hides send button on agent ending the session
    if (state.agentEndSessionEvent) {
      return null;
    }
    return <Send {...props}/>;
  }

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
        renderComposer={renderComposer}
        renderSend={renderSend}
        onSend={onSend}
        onInputTextChanged={onInputTextChanged}
        user={{
          _id: 2,
          name: 'Customer',
          avatar: 'https://placeimg.com/140/140/any'
        }}
        showUserAvatar
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