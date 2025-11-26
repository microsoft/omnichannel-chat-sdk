import React, { useState, useEffect, useRef } from 'react';
import '../styles/VoiceChatInterface.css';
import MessageDisplay from './MessageDisplay';
import VoiceControls from './VoiceControls';
import TextInput from './TextInput';
import SessionInfo from './SessionInfo';
import VoiceRecorder from '../services/VoiceRecorder';
import SpeechToText from '../services/SpeechToText';

function VoiceChatInterface({ chatManager }) {
  const [messages, setMessages] = useState([]);
  const [isRecording, isSetRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  const voiceRecorderRef = useRef(null);
  const speechToTextRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize voice services
    voiceRecorderRef.current = new VoiceRecorder();
    speechToTextRef.current = new SpeechToText();

    // Subscribe to chat events
    subscribeToMessages();
    subscribeToAgentEvents();

    // Start chat session
    startChatSession();

    return () => {
      if (voiceRecorderRef.current) {
        voiceRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChatSession = async () => {
    try {
      setIsLoading(true);
      const response = await chatManager.startChat();
      setSessionId(response.sessionId);
      
      // Add welcome message
      setMessages([{
        id: 'welcome',
        content: 'Hello! I\'m ARTAgent. You can speak to me or type your message. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }]);
    } catch (err) {
      console.error('Failed to start chat:', err);
      setError('Failed to start chat session');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (chatManager && chatManager.chatSDK) {
      chatManager.chatSDK.onNewMessage((message) => {
        addMessage({
          id: message.id || Date.now().toString(),
          content: message.content,
          sender: message.sender === 'customer' ? 'user' : 'bot',
          timestamp: new Date(message.timestamp || Date.now()),
          type: message.type || 'text'
        });
      });
    }
  };

  const subscribeToAgentEvents = () => {
    if (chatManager && chatManager.chatSDK) {
      // Listen for agent joining
      chatManager.chatSDK.onNewMessage((message) => {
        if (message.type === 'PartyJoined' && message.sender !== 'customer') {
          setIsAgentConnected(true);
          addMessage({
            id: 'agent-joined',
            content: 'An agent has joined the conversation',
            sender: 'system',
            timestamp: new Date(),
            type: 'system'
          });
        }
      });

      // Listen for agent ending session
      chatManager.chatSDK.onAgentEndSession?.(() => {
        setIsAgentConnected(false);
        addMessage({
          id: 'agent-left',
          content: 'The agent has ended the session',
          sender: 'system',
          timestamp: new Date(),
          type: 'system'
        });
      });
    }
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleVoiceInput = async () => {
    try {
      setError(null);
      
      if (isRecording) {
        // Stop recording
        isSetRecording(false);
        setIsLoading(true);
        
        const audioBlob = await voiceRecorderRef.current.stop();
        
        // Convert speech to text
        const text = await speechToTextRef.current.transcribe(audioBlob);
        setTranscript(text);

        // Send message
        await sendMessage(text, 'voice');
      } else {
        // Start recording
        isSetRecording(true);
        setTranscript('');
        await voiceRecorderRef.current.start();
      }
    } catch (err) {
      console.error('Voice input error:', err);
      setError('Failed to process voice input');
      isSetRecording(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextInput = async (text) => {
    if (!text.trim()) return;
    
    try {
      setError(null);
      await sendMessage(text, 'text');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  };

  const sendMessage = async (content, inputType) => {
    try {
      setIsLoading(true);

      // Add user message to display
      addMessage({
        id: Date.now().toString(),
        content: content,
        sender: 'user',
        timestamp: new Date(),
        type: inputType,
        inputMethod: inputType === 'voice' ? 'voice' : 'text'
      });

      // Send via chat SDK
      await chatManager.sendMessage(content);

      // If voice input, also speak the response
      if (inputType === 'voice') {
        // Get bot response (will be added via onNewMessage subscription)
        // Play audio response if available
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = async () => {
    try {
      // Initiate voice/video call escalation
      const voiceVideoSDK = await chatManager.initiateVoiceVideoCall();
      if (voiceVideoSDK) {
        addMessage({
          id: 'call-initiated',
          content: 'Initiating voice call with agent...',
          sender: 'system',
          timestamp: new Date(),
          type: 'system'
        });
      }
    } catch (err) {
      console.error('Failed to initiate call:', err);
      setError('Failed to initiate call');
    }
  };

  return (
    <div className="voice-chat-interface">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="header-content">
            <div className="header-title">
              <h1>🎤 ARTAgent</h1>
              <p>Transforming customer interactions with real-time, intelligent voice experiences.</p>
            </div>
            <SessionInfo 
              sessionId={sessionId} 
              isAgentConnected={isAgentConnected}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Messages Display */}
        <MessageDisplay 
          messages={messages}
          isLoading={isLoading}
          transcript={transcript}
        />
        <div ref={messagesEndRef} />

        {/* Text Input */}
        <TextInput 
          onSendMessage={handleTextInput}
          disabled={isLoading || isRecording}
          placeholder="Type your message or click the microphone to speak..."
        />

        {/* Voice Controls */}
        <VoiceControls 
          isRecording={isRecording}
          isLoading={isLoading}
          isSpeaking={isSpeaking}
          onVoiceInput={handleVoiceInput}
          onCall={handleCall}
          transcript={transcript}
        />
      </div>
    </div>
  );
}

export default VoiceChatInterface;
