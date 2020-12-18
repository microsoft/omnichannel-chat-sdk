import React, { useCallback, useContext, useEffect } from "react"
import { StyleSheet, Text, View } from 'react-native';
import { Navigation } from "react-native-navigation";
import { useDidAppearListener, useNavigationButtonPressedListener } from '../utils/hooks';
import { ActionType, Store } from '../context';

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

const ChatScreen = (props: ChatScreenProps) => {
  const {state, dispatch} = useContext(Store);

  useNavigationButtonPressedListener(async (event: any) => {
    const {buttonId, componentId} = event;
    if (componentId !== props.componentId) {
      return;
    }

    if (buttonId === buttons.endChat.id) {
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

      dispatch({type: ActionType.SET_CHAT_STARTED, payload: false})
    }

    if (buttonId === buttons.startChat.id) {
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
    }

    dispatch({type: ActionType.SET_CHAT_STARTED, payload: true})
  }, [state]);

  useEffect(() => {
    const init = async () => {
      console.log(props);
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
    console.log('StartChat');
    dispatch({type: ActionType.SET_CHAT_STARTED, payload: true})
  }, [state]);

  useDidAppearListener((data) => {
    const { componentId } = data;

    if (componentId !== props.componentId ) {
      return;
    }

    const {hasChatStarted} = state;
    !hasChatStarted && init();
  }, [state]);

  return (
    <View style={styles.view}>
      <Text> Chat </Text>
    </View>
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