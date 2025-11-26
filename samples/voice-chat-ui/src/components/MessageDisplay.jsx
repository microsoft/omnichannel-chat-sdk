import React from 'react';
import '../styles/MessageDisplay.css';

function MessageDisplay({ messages, isLoading, transcript }) {
  return (
    <div className="message-display">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message message-${message.sender} message-type-${message.type}`}
          >
            <div className="message-content">
              <div className="message-text">
                {message.content}
              </div>
              {message.inputMethod && (
                <div className="message-badge">
                  {message.inputMethod === 'voice' ? '🎤' : '⌨️'}
                </div>
              )}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message message-bot message-type-text">
            <div className="message-content">
              <div className="message-text">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {transcript && (
          <div className="transcript-preview">
            <div className="transcript-label">You (transcribed):</div>
            <div className="transcript-text">{transcript}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageDisplay;
