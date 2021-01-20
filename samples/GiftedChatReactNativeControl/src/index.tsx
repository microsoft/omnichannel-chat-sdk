
import React from 'react';
import { Navigation } from 'react-native-navigation';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import { StateProvider } from './context';

const registerScreens = () => {
  Navigation.registerComponent('Home', () => HomeScreen);
  Navigation.registerComponent(
    'Chat',
    () => (props) => (
      <StateProvider>
        <ChatScreen {...props}/>
      </StateProvider>
    ),
    () => ChatScreen
  );
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
    },
    bottomTab: {
      fontSize: 14,
      selectedFontSize: 16
    }
  });
}

const setRoot = () => {
  Navigation.setRoot({
    root: {
      bottomTabs: {
        children: [
          {
            stack: {
              children: [
                {
                  component: {
                    id: 'HOME',
                    name: 'Home'
                  }
                }
              ],
              options: {
                bottomTab: {
                  text: 'Home',
                  icon: require('./assets/img/home.png'),
                  selectedIcon: require('./assets/img/home-solid.png')
                }
              }
            }
          },
          {
            stack: {
              children: [
                {
                  component: {
                    id: 'CHAT',
                    name: 'Chat'
                  }
                }
              ],
              options: {
                bottomTab: {
                  text: 'Chat',
                  icon: require('./assets/img/chat.png'),
                  selectedIcon: require('./assets/img/chat-solid.png')
                }
              }
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