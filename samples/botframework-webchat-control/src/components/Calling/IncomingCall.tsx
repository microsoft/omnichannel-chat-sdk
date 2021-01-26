import React from "react";
import { PhoneOff, Video, Phone } from "react-feather";
import './IncomingCall.css';

interface IncomingCallProps {
  rejectCall: (event: React.MouseEvent<SVGAElement, MouseEvent>) => void;
  acceptVideoCall: (event: React.MouseEvent<SVGAElement, MouseEvent>) => void;
  acceptVoiceCall: (event: React.MouseEvent<SVGAElement, MouseEvent>) => void;
}

function IncomingCall(props: IncomingCallProps) {
  return (
    <div className="incoming-call-pop-up">
      <span> Incoming call </span>
      <div>
        <PhoneOff className="reject-call-button" onClick={props.rejectCall}/>
        <Video className="accept-video-call-button" onClick={props.acceptVideoCall} />
        <Phone className="accept-voice-call-button" onClick={props.acceptVoiceCall}/>
      </div>
    </div>
  )
}

export default IncomingCall;