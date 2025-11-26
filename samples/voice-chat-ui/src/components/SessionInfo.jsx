import React from 'react';
import '../styles/SessionInfo.css';

function SessionInfo({ sessionId, isAgentConnected }) {
  return (
    <div className="session-info">
      <div className="session-item">
        <span className="session-label">Active Session</span>
        <span className="session-value">
          {sessionId ? sessionId.substring(0, 24) + '...' : 'Initializing...'}
        </span>
      </div>
      <div className="agent-status">
        <span className={`status-indicator ${isAgentConnected ? 'connected' : 'disconnected'}`}></span>
        <span className="status-label">
          {isAgentConnected ? 'Agent Connected' : 'Bot Mode'}
        </span>
      </div>
    </div>
  );
}

export default SessionInfo;
