import React from "react";
import { X } from "react-feather";
import './ChatHeader.css';

interface ChatHeaderProps {
  title: string;
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

function ChatHeader(props: ChatHeaderProps) {
  return (
    <div className="chat-header">
    <span> {props.title} </span>
      <div onClick={props.onClick}>
        <X />
      </div>
    </div>
  );
}

export default ChatHeader;