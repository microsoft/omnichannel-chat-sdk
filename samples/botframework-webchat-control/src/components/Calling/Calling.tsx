import React, { useCallback, useEffect, useState } from 'react';
import { Mic, PhoneOff, Video } from 'react-feather';
import './Calling.css';

interface CallingProps {
  VoiceVideoCallingSDK: any;
  OCClient: any;
  chatToken: any;
}

const adjustWebChatHeightInVideoCall = () => {
  console.log(`[WebChat][adjustWebChatHeightInVideoCall]`);
  const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript')[0] as HTMLElement;
  const remoteVideoContainer = document.getElementById('remoteVideo') as HTMLElement;

  const newHeight = webChatTranscriptContainer.clientHeight - remoteVideoContainer.clientHeight;
  webChatTranscriptContainer.style.marginTop = `${remoteVideoContainer.clientHeight}px`;
  webChatTranscriptContainer.style.height = `${newHeight}px`;
}

const adjustWebChatHeightIncomingCall = () => {
  console.log(`[WebChat][adjustWebChatHeightIncomingCall]`);
  const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript')[0] as HTMLElement;
  const incomingCallContainer = document.getElementsByClassName('incoming-call-pop-up')[0] as HTMLElement;

  const newHeight = webChatTranscriptContainer.clientHeight - incomingCallContainer.clientHeight;
  webChatTranscriptContainer.style.height = `${newHeight}px`;
}

const adjustWebChatHeightNoCall = () => {
  console.log(`[WebChat][adjustWebChatHeightNoCall]`);
  const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript')[0] as HTMLElement;
  webChatTranscriptContainer.style.marginTop = '';
  webChatTranscriptContainer.style.height = '';
}

function Calling(props: CallingProps) {
  const [incomingCall, setIncomingCall] = useState(false);
  const [inVideoCall, setInVideoCall] = useState(false);

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
        adjustWebChatHeightIncomingCall();
      });

      VoiceVideoCallingSDK.onCallDisconnected(() => {
        console.log('[WebChat][Calling][CallDisconnected]');
        // Clean up
        const remoteVideoElement = document.getElementById('remoteVideo');
        while (remoteVideoElement?.firstChild) {
          console.log('[WebChat][Calling][RemoteVideo][Clean Up]');
          remoteVideoElement.firstChild.remove();
        }

        adjustWebChatHeightNoCall();

        setIncomingCall(false);
        setInVideoCall(false);
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
  }, [props]);

  const acceptVoiceCall = useCallback(async() => {
    console.log(`[WebChat][Calling][Accept][Voice]`);
    const {VoiceVideoCallingSDK} = props;

    VoiceVideoCallingSDK.acceptCall({
      withVideo: false
    });

    setIncomingCall(false);
    setInVideoCall(false);

    // adjustWebChatHeightInVideoCall();
  }, [props]);

  const acceptVideoCall = useCallback(async() => {
    console.log(`[WebChat][Calling][Accept][Video]`);
    const {VoiceVideoCallingSDK} = props;

    await VoiceVideoCallingSDK.acceptCall({
      withVideo: true
    });

    setIncomingCall(false);
    setInVideoCall(true);

    adjustWebChatHeightInVideoCall();
  }, [props]);

  const rejectCall = useCallback(async() => {
    console.log(`[WebChat][Calling][Reject]`);
    const {VoiceVideoCallingSDK} = props;

    await VoiceVideoCallingSDK.rejectCall();

    setIncomingCall(false);
  }, [props]);

  return (
    <>
      {
        inVideoCall && <div className={`calling ${inVideoCall? 'active': ''}`}>
          <div className="container">
            <div id="remoteVideo"></div>
            <div id="selfVideo"></div>
          </div>
        </div>
      }
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