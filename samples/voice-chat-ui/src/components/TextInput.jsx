import React, { useRef } from 'react';
import '../styles/TextInput.css';

function TextInput({ onSendMessage, disabled, placeholder }) {
  const inputRef = useRef(null);

  const handleSend = () => {
    const text = inputRef.current.value.trim();
    if (text) {
      onSendMessage(text);
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="text-input-container">
      <input
        ref={inputRef}
        type="text"
        className="text-input"
        placeholder={placeholder}
        disabled={disabled}
        onKeyPress={handleKeyPress}
      />
      <button
        className="send-btn-inline"
        onClick={handleSend}
        disabled={disabled}
      >
        Send
      </button>
    </div>
  );
}

export default TextInput;
