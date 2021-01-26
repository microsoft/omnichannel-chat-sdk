import React, { useCallback, useEffect, useState, useContext } from 'react';
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
      console.log(`[Calling][chatToken]`);
      const {VoiceVideoCallingSDK, OCClient, chatToken} = props;

      try {
        await (VoiceVideoCallingSDK as any).initialize({
          chatToken,
          selfVideoHTMLElementId: 'selfVideo',
          remoteVideoHTMLElementId: 'remoteVideo',
          environment: 'test',
          OCClient: OCClient
        });
        console.log("VoiceVideoCallingProxy initialized!");
        console.log(VoiceVideoCallingSDK);
      } catch (e) {
        console.error("Failed to initialize VoiceVideoCalling!");
        console.error(e);
      }

      (VoiceVideoCallingSDK as any).onCallAdded(() => {
        console.log('[WebChat][CallAdded]');
        setIncomingCall(true);
        adjustWebChatHeightIncomingCall();
      });

      (VoiceVideoCallingSDK as any).onCallDisconnected(() => {
        console.log('[WebChat][CallDisconnected]');
        // Clean up
        const remoteVideoElement = document.getElementById('remoteVideo');
        while (remoteVideoElement?.firstChild) {
          console.log('[RemoteVideo][Clean Up]');
          remoteVideoElement.firstChild.remove();
        }

        const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript__scrollable')[0] as HTMLElement;
        webChatTranscriptContainer.style.marginTop = '';
        webChatTranscriptContainer.style.height = '';

        setIncomingCall(false);
        setInACall(false);
      });

      (VoiceVideoCallingSDK as any).onLocalVideoStreamAdded(() => {
        console.log('[WebChat][LocalVideoStreamAdded]');
      });

      (VoiceVideoCallingSDK as any).onLocalVideoStreamRemoved(() => {
        console.log('[WebChat][LocalVideoStreamRemoved]');
      });

      (VoiceVideoCallingSDK as any).onRemoteVideoStreamAdded(() => {
        console.log('[WebChat][RemoteVideoStreamAdded]');
      });

      (VoiceVideoCallingSDK as any).onRemoteVideoStreamRemoved(() => {
        console.log('[WebChat][RemoteVideoStreamRemoved]');
      });
    }

    init();
  }, []);

  const acceptVoiceCall = useCallback(async() => {
    console.log(`[Calling][Accept][Voice]`);
    const {VoiceVideoCallingSDK} = props;

    (VoiceVideoCallingSDK as any).acceptCall({
      withVideo: false
    });

    setIncomingCall(false);
    setInACall(true);

    adjustWebChatHeightInACall();
  }, [props.VoiceVideoCallingSDK, incomingCall]);

  const acceptVideoCall = useCallback(async() => {
    console.log(`[Calling][Accept][Video]`);
    const {VoiceVideoCallingSDK} = props;

    await (VoiceVideoCallingSDK as any).acceptCall({
      withVideo: true
    });

    setIncomingCall(false);
    setInACall(true);

    adjustWebChatHeightInACall();
  }, [props.VoiceVideoCallingSDK, incomingCall]);

  const rejectCall = useCallback(async() => {
    console.log(`[Calling][Reject]`);
    const {VoiceVideoCallingSDK} = props;

    await (VoiceVideoCallingSDK as any).rejectCall();

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