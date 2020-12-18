import React, { useEffect } from "react"
import {
  StyleSheet,
  View,
  Text
} from 'react-native';
import { Navigation } from "react-native-navigation";

const ChatScreen = () => {
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