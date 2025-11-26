import React from 'react';
import '../styles/VoiceControls.css';

function VoiceControls({ 
  isRecording, 
  isLoading, 
  isSpeaking, 
  onVoiceInput, 
  onCall,
  transcript 
}) {
  return (
    <div className="voice-controls">
      <div className="controls-container">
        <button
          className={`control-btn refresh-btn ${isLoading ? 'disabled' : ''}`}
          title="Refresh session"
          disabled={isLoading}
        >
          ↻
        </button>

        <button
          className={`control-btn voice-btn ${isRecording ? 'recording' : ''} ${isLoading ? 'disabled' : ''}`}
          onClick={onVoiceInput}
          disabled={isLoading}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <span className="recording-indicator">⏹</span>
          ) : (
            '🎤'
          )}
        </button>

        <button
          className={`control-btn send-btn ${isLoading ? 'disabled' : ''}`}
          title="Send message"
          disabled={isLoading}
        >
          ⬆
        </button>

        <button
          className={`control-btn call-btn ${isLoading ? 'disabled' : ''}`}
          onClick={onCall}
          disabled={isLoading}
          title="Initiate voice/video call"
        >
          ☎
        </button>
      </div>

      {isRecording && (
        <div className="recording-indicator-bar">
          <div className="recording-pulse"></div>
          <span>Recording...</span>
        </div>
      )}
    </div>
  );
}

export default VoiceControls;
