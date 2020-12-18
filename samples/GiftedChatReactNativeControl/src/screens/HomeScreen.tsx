import React from "react"
import {
  StyleSheet,
  View,
  Text
} from 'react-native';
import { Navigation } from "react-native-navigation";

const HomeScreen = () => {
  return (
    <View style={styles.view}>
      <Text> Home </Text>
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

HomeScreen.options = {
  topBar: {
    title: {
      text: 'Home'
    }
  }
}

export default HomeScreen;