import React from "react"
import {
  StyleSheet,
  View,
  Text
} from 'react-native';

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
  bottomTab: {
    text: 'Chat'
  }
}

export default ChatScreen;