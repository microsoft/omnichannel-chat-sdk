import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Typing from "./Typing"

const TypingIndicator = (props: any) => {
  return (
    <View style={styles.container}>
      <Typing transformation='omnichannel' />
      <Text style={styles.text}>
       {props.name || 'Agent'} is typing  ...
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection:'row',
    flexWrap:'wrap',
    alignItems: 'center'
  },
  text: {
    color: '#605e5c'
  }
});

export default TypingIndicator;