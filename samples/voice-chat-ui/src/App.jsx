import React, { useState, useEffect, useRef } from 'react';
import './styles/App.css';
import VoiceChatInterface from './components/VoiceChatInterface';
import OmnichannelChatManager from './services/OmnichannelChatManager';

function App() {
  const [chatManager, setChatManager] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Initialize Omnichannel Chat Manager
        const omnichannelConfig = {
          orgUrl: process.env.REACT_APP_ORG_URL || '',
          orgId: process.env.REACT_APP_ORG_ID || '',
          widgetId: process.env.REACT_APP_WIDGET_ID || '',
          cpsBotId: process.env.REACT_APP_CPS_BOT_ID || ''
        };

        const manager = new OmnichannelChatManager(omnichannelConfig);
        await manager.initialize();
        setChatManager(manager);
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError(err.message);
      }
    };

    initializeChat();
  }, []);

  return (
    <div className="app-container">
      {error ? (
        <div className="error-message">
          <p>Failed to initialize chat service: {error}</p>
          <p>Please check your configuration in .env file</p>
        </div>
      ) : isInitialized && chatManager ? (
        <VoiceChatInterface chatManager={chatManager} />
      ) : (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Initializing chat service...</p>
        </div>
      )}
    </div>
  );
}

export default App;
