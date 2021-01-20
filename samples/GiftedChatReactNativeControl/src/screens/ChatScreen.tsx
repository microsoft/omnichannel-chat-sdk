import { IFileInfo, IRawMessage, isSystemMessage, OmnichannelChatSDK, uuidv4 } from '@microsoft/omnichannel-chat-sdk';
import AdaptiveCard from "adaptivecards-reactnative";
import { Buffer } from 'buffer';
import React, { useCallback, useContext, useEffect, useState, } from 'react';
import { Alert, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { DownloadDirectoryPath, ExternalDirectoryPath, LibraryDirectoryPath, readFile, writeFile } from 'react-native-fs';
import { Actions, Composer, GiftedChat, IMessage, Send } from 'react-native-gifted-chat';
import { Navigation } from 'react-native-navigation';
import { orgId, orgUrl, widgetId, email } from '@env';
import TypingIndicator from '../components/TypingIndicator/TypingIndicator';
import { ActionType, Store } from '../context';
import { useDidAppearListener, useNavigationButtonPressedListener } from '../utils/hooks';
import { parseTranscript } from '../utils/parser';
import attachementImage from '../assets/img/attachment.png';

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
  const agentName = message.sender?.displayName;
  return {
    _id: message.clientmessageid,
    text: message.content,
    createdAt: new Date(),
    system: isSystemMessage(message),
    // received: true,
    // sent: true,
    user: {
      _id: 1,
      name: agentName || 'Agent',
      avatar: 'https://placeimg.com/140/140/people'
    }
  }
}

const patchAdaptiveCard = (adaptiveCard: any) => {
  return JSON.parse(JSON.stringify(adaptiveCard).replace("&#42;", "*"));  // HTML entities '&#42;' is not unescaped for some reason
}

const ChatScreen = (props: ChatScreenProps) => {
  const {state, dispatch} = useContext(Store);
  const [chatSDK, setChatSDK] = useState<OmnichannelChatSDK>();
  const [preChatSurvey, setPreChatSurvey] = useState(null);
  const [preChatResponse, setPreChatResponse] = useState(null);

  const onNewMessage = useCallback(async (message: IRawMessage) => {
    console.log(`[onNewMessage] Received message: '${message.content}'`);
    // console.log(message);

    const { messages } = state;
    const giftedChatMessage: any = createGiftedChatMessage(message);
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

      const rightButtons: any = [];

      if (!preChatSurvey) {
        // Switch TopBar button to start chat
        rightButtons.push({
          enabled: true,
          id: buttons.startChat.id,
          text: buttons.startChat.text,
          color: '#fff'
        });
      }

      Navigation.mergeOptions(props.componentId, {
        topBar: {
          rightButtons
        }
      });

      setPreChatResponse(null);
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

      // Switch TopBar button to end chat
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
  }, [state, chatSDK, onNewMessage, preChatSurvey]);

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

      let preChatSurvey = await chatSDK.getPreChatSurvey();
      if (preChatSurvey) {
        console.info('[PreChatSurvey]');
        preChatSurvey = patchAdaptiveCard(preChatSurvey);
        console.log(preChatSurvey);
        setPreChatSurvey(preChatSurvey);
      }
    }

    init();
  }, []);

  const startNewChat = useCallback(async (optionalParams = {}) => {
    console.info('[StartNEWChat]');
    await chatSDK!.startChat(optionalParams);
    chatSDK!.onNewMessage(onNewMessage);
    chatSDK!.onTypingEvent(onTypingEvent);
    chatSDK!.onAgentEndSession(onAgentEndSession);

    dispatch({type: ActionType.SET_CHAT_STARTED, payload: true});

    // Switch TopBar button to end chat
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
  }, [state, chatSDK, onNewMessage]);

  // Triggered only if chat screen is visible
  useDidAppearListener((event) => {
    const { componentId } = event;

    if (componentId !== props.componentId ) {
      return;
    }

    // Starts NEW chat only if chat screen is visible & chat has not started
    const {hasChatStarted} = state;
    !hasChatStarted && !preChatSurvey && startNewChat();
  }, [state, chatSDK, preChatSurvey]);

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

    console.info('[SendTyping]');
    try {
      await chatSDK?.sendTypingEvent();
    } catch {
      console.error('[SendTyping] Failure');
    }
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

  const onAttachmentUpload = useCallback(async () => {
    // Handles file attachment uploads
    const { messages } = state;

    try {
      const fileResult = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles]
      });

      const fileRNFS = await readFile(fileResult.uri, "base64");
      const fileBuffer = Buffer.from(fileRNFS, 'base64');

      const fileInfo: IFileInfo = {
        name: fileResult.name,
        type: fileResult.type,
        size: fileResult.size,
        data: fileBuffer
      };

      const inboundMessage: any = {
        _id: uuidv4(),
        text: '',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Customer',
          avatar: 'https://placeimg.com/140/140/any'
        }
      };

      inboundMessage.image = `data:image/png;base64,${fileBuffer.toString('base64')}`;

      const extraMetaData = {
        isSystemMessage: false,
        isAgentMessage: false,
        isAttachment: false
      };

      messages.unshift({...inboundMessage, ...extraMetaData});
      dispatch({type: ActionType.SET_MESSAGES, payload: messages});

      await chatSDK!.uploadFileAttachment(fileInfo);

      // Displays message tick
      // It only updates if the attachment is the last message
      // Known issue: https://github.com/FaridSafi/react-native-gifted-chat/issues/654
      const messageToUpdate = messages.find((message) => message._id === inboundMessage._id);
      messageToUpdate.sent = true;

      dispatch({type: ActionType.SET_MESSAGES, payload: messages});
    } catch (error) {
      console.error(`[FileAttachmentUpload] Failed with error ${error}`);
    }
  }, [state, chatSDK]);

  const renderActions = (props: any) => {
    // Hides actions on agent ending the session
    if (state.agentEndSessionEvent) {
      return null;
    }

    return (
      <Actions
        {...props}
        containerStyle={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 4,
          marginRight: 4,
          marginBottom: 0,
        }}
        icon={() => ( // Attachment Upload button
          <Image
            style={styles.attachmentIcon}
            source={attachementImage} />
        )}
        options={{
          'Choose From Library': () => {
            console.log('Choose From Library');
            onAttachmentUpload();
          },
          Cancel: () => {
            console.log('Cancel');
          },
        }}
        optionTintColor="#222B45"
      />
    )
  }

  const onEmailTranscript = useCallback(async () => {
    const {hasChatStarted} = state;

    if (!hasChatStarted) {
      return;
    }

    const body = {
      emailAddress: email,
      attachmentMessage: 'Sample Message',
      locale: 'en-us'
    }

    try {
      await chatSDK!.emailLiveChatTranscript(body);
      console.info('[EmailLiveChatTranscript]');
      Alert.alert(
        'Email Transcript',
        'Success!'
      );
    } catch {
      console.error(`[EmailLiveChatTranscript]: Failure`);
    }
  }, [state, chatSDK]);

  const onDownloadTranscript = useCallback(async () => {
    const {hasChatStarted} = state;

    if (!hasChatStarted) {
      return;
    }

    try {
      const transcriptResponse = await chatSDK?.getLiveChatTranscript();
      console.log('[DownloadTranscript] Download transcript succeeded!');

      const rootPath = Platform.OS.toLowerCase() === 'ios'? LibraryDirectoryPath: ExternalDirectoryPath;
      // const rootPath = DownloadDirectoryPath; // Requires storage permission
      const fileName = `transcript.txt`;
      const transcriptPath = `${rootPath}/${fileName}`;
      console.info(transcriptPath);

      const content = parseTranscript(transcriptResponse);
      try {
        await writeFile(transcriptPath, content, 'utf8');
        console.log('[DownloadTranscript] Write transcript succeeded!');
        Alert.alert(
          'Download Transcript',
          `Transcript downloaded successfully at '${transcriptPath}'`
        );
      } catch(err) {
        console.error(`[DownloadTranscript] Unable to write transcript`);
        console.error(`${err}`);
      }
    } catch {
      console.error('[DownloadTranscript] Download transcript failed.');
    }
  }, [state, chatSDK]);

  const renderAccessory = () => {
    return (
      <View style={styles.accessoryContainer}>
        <TouchableOpacity onPress={onDownloadTranscript}>
          <Image
            style={styles.downloadIcon}
            source={require("../assets/img/download.png")} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onEmailTranscript}>
          <Image
            style={styles.mailIcon}
            source={require("../assets/img/mail.png")} />
        </TouchableOpacity>
      </View>
    )
  }

  const renderChatWidget = () => {
    if (preChatSurvey && !preChatResponse) {
      const onExecuteAction = async (action: any) => {
        const {data: preChatResponse} = action;
        const optionalParams: any = {
          preChatResponse
        };

        setPreChatResponse(preChatResponse);
        startNewChat(optionalParams);
      }

      return (
        <AdaptiveCard payload={preChatSurvey} onExecuteAction={onExecuteAction}/>
      )
    }

    return (
      <>
        <GiftedChat
          inverted={props.inverted}
          placeholder={'Type your message here'}
          alwaysShowSend
          messages={state.messages}
          // isTyping={state.isTyping}
          renderFooter={renderTypingIndicator}
          renderComposer={renderComposer}
          renderActions={renderActions}
          renderSend={renderSend}
          renderAccessory={renderAccessory}
          onSend={onSend}
          onInputTextChanged={onInputTextChanged}
          user={{
            _id: 2,
            name: 'Customer',
            avatar: 'https://placeimg.com/140/140/any'
          }}
          showUserAvatar
          showAvatarForEveryMessage
          renderUsernameOnMessage
        />
      </>
    )
  }

  return renderChatWidget();
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
  },
  attachmentIcon: {
    width: 32,
    height: 32
  },
  accessoryContainer: {
    flexDirection: 'row',
    height: 44,
    width: '100%',
    alignItems: 'center',
    marginLeft: 15
  },
  downloadIcon: {
    width: 24,
    height: 24,
    marginRight: 7
  },
  mailIcon: {
    width: 24,
    height: 24,
    marginLeft: 7
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