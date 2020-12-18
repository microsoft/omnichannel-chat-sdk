
import { Navigation } from 'react-native-navigation';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';

const registerScreens = () => {
  Navigation.registerComponent('Home', () => HomeScreen);
  Navigation.registerComponent('Chat', () => ChatScreen);
};

const setDefaultOptions = () => {
  Navigation.setDefaultOptions({
    statusBar: {
      backgroundColor: '#4d089a'
    },
    topBar: {
      title: {
        color: 'white'
      },
      backButton: {
        color: 'white'
      },
      background: {
        color: '#4d089a'
      }
    }
  });
}

const setRoot = () => {
  Navigation.setRoot({
    root: {
      bottomTabs: {
        children: [
          {
            component: {
              name: 'Home'
            }
          },
          {
            component: {
              name: 'Chat'
            }
          }
        ]
      }
    }
  });
};

registerScreens();

Navigation.events().registerAppLaunchedListener(async () => {
  setDefaultOptions();
  setRoot();
});