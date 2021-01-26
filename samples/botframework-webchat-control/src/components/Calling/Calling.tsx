import React, { useCallback, useEffect, useState } from 'react';
import { Mic, PhoneOff, Video } from 'react-feather';
import './Calling.css';

interface CallingProps {
  VoiceVideoCallingSDK: any;
  OCClient: any;
  chatToken: any;
}

const adjustWebChatHeightInACall = () => {
  // Adjust height
  const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript__scrollable')[0] as HTMLElement;
  const remoteVideoContainer = document.getElementById('remoteVideo') as HTMLElement;

  const heightGap = webChatTranscriptContainer.clientHeight - remoteVideoContainer.clientHeight;
  webChatTranscriptContainer.style.marginTop = `${remoteVideoContainer.clientHeight}px`;
  webChatTranscriptContainer.style.height = `${heightGap}px`;
}

const adjustWebChatHeightIncomingCall = () => {
    // Adjust height
    const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript__scrollable')[0] as HTMLElement;
    const incomingCallContainer = document.getElementsByClassName('incoming-call-pop-up')[0] as HTMLElement;

    const heightGap = webChatTranscriptContainer.clientHeight - incomingCallContainer.clientHeight;
    webChatTranscriptContainer.style.marginTop = `${incomingCallContainer.clientHeight}px`;
    webChatTranscriptContainer.style.height = `${heightGap}px`;
}

function Calling(props: CallingProps) {
  const [incomingCall, setIncomingCall] = useState(false);
  const [inACall, setInACall] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {VoiceVideoCallingSDK, OCClient, chatToken} = props;

      try {
        await VoiceVideoCallingSDK.initialize({
          chatToken,
          selfVideoHTMLElementId: 'selfVideo',
          remoteVideoHTMLElementId: 'remoteVideo',
          environment: 'test',
          OCClient: OCClient
        });
        console.log("[WebChat][Calling] VoiceVideoCallingProxy initialized!");
        console.log(VoiceVideoCallingSDK);
      } catch (e) {
        console.error("[WebChat][Calling] Failed to initialize VoiceVideoCalling!");
        console.error(e);
      }

      VoiceVideoCallingSDK.onCallAdded(() => {
        console.log('[WebChat][Calling][CallAdded]');
        setIncomingCall(true);
        // adjustWebChatHeightIncomingCall();
      });

      VoiceVideoCallingSDK.onCallDisconnected(() => {
        console.log('[WebChat][Calling][CallDisconnected]');
        // Clean up
        const remoteVideoElement = document.getElementById('remoteVideo');
        while (remoteVideoElement?.firstChild) {
          console.log('[WebChat][Calling][RemoteVideo][Clean Up]');
          remoteVideoElement.firstChild.remove();
        }

        const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript__scrollable')[0] as HTMLElement;
        webChatTranscriptContainer.style.marginTop = '';
        webChatTranscriptContainer.style.height = '';

        setIncomingCall(false);
        setInACall(false);
      });

      VoiceVideoCallingSDK.onLocalVideoStreamAdded(() => {
        console.log('[WebChat][Calling][LocalVideoStreamAdded]');
      });

      VoiceVideoCallingSDK.onLocalVideoStreamRemoved(() => {
        console.log('[WebChat][Calling][LocalVideoStreamRemoved]');
      });

      VoiceVideoCallingSDK.onRemoteVideoStreamAdded(() => {
        console.log('[WebChat][Calling][RemoteVideoStreamAdded]');
      });

      VoiceVideoCallingSDK.onRemoteVideoStreamRemoved(() => {
        console.log('[WebChat][Calling][RemoteVideoStreamRemoved]');
      });
    }

    init();
  }, []);

  const acceptVoiceCall = useCallback(async() => {
    console.log(`[WebChat][Calling][Accept][Voice]`);
    const {VoiceVideoCallingSDK} = props;

    VoiceVideoCallingSDK.acceptCall({
      withVideo: false
    });

    setIncomingCall(false);
    setInACall(true);

    // adjustWebChatHeightInACall();
  }, [props.VoiceVideoCallingSDK, incomingCall]);

  const acceptVideoCall = useCallback(async() => {
    console.log(`[WebChat][Calling][Accept][Video]`);
    const {VoiceVideoCallingSDK} = props;

    await VoiceVideoCallingSDK.acceptCall({
      withVideo: true
    });

    setIncomingCall(false);
    setInACall(true);

    // adjustWebChatHeightInACall();
  }, [props.VoiceVideoCallingSDK, incomingCall]);

  const rejectCall = useCallback(async() => {
    console.log(`[WebChat][Calling][Reject]`);
    const {VoiceVideoCallingSDK} = props;

    await VoiceVideoCallingSDK.rejectCall();

    setIncomingCall(false);
  }, [props.VoiceVideoCallingSDK, incomingCall]);

  return (
    <>
    <div className={`calling ${inACall? 'active': ''}`}>
      {
        inACall && <div className="container">
          <div id="remoteVideo"></div>
          <div id="selfVideo"></div>
        </div>
      }
    </div>
    {
      incomingCall && <div className="incoming-call-pop-up">
        <Video className="accept-video-call-button" onClick={acceptVideoCall} />
        <Mic className="accept-voice-call-button" onClick={acceptVoiceCall}/>
        <PhoneOff className="reject-call-button" onClick={rejectCall}/>
      </div>
    }
    </>
  )
}

export default Calling;