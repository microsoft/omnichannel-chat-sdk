import React from "react";
import { MessageCircle } from "react-feather";
import './ChatButton.css';

interface ChatButtonProps {
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

function ChatButton(props: ChatButtonProps) {
  return (
    <div className="chat-button" onClick={props.onClick}>
      <MessageCircle color='white' />
    </div>
  );
}

export default ChatButton;