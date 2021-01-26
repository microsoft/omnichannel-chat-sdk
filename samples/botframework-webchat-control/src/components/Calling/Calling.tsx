import React, { useCallback, useEffect, useState } from 'react';
import { Mic, PhoneOff, Video } from 'react-feather';
import './Calling.css';
import IncomingCall from './IncomingCall';

interface CallingProps {
  VoiceVideoCallingSDK: any;
  OCClient: any;
  chatToken: any;
}

const adjustWebChatHeightInVideoCall = () => {
  console.log(`[WebChat][adjustWebChatHeightInVideoCall]`);
  const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript')[0] as HTMLElement;
  const remoteVideoContainer = document.getElementById('remoteVideo') as HTMLElement;
  const currentCallActionBar = document.getElementsByClassName('current-call-action-bar')[0] as HTMLElement;

  const newHeight = webChatTranscriptContainer.clientHeight - remoteVideoContainer.clientHeight - currentCallActionBar.clientHeight;
  webChatTranscriptContainer.style.marginTop = `${remoteVideoContainer.clientHeight + currentCallActionBar.clientHeight}px`;
  webChatTranscriptContainer.style.height = `${newHeight}px`;
}

const adjustWebChatHeightIncomingCall = () => {
  console.log(`[WebChat][adjustWebChatHeightIncomingCall]`);
  const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript')[0] as HTMLElement;
  const incomingCallContainer = document.getElementsByClassName('incoming-call-pop-up')[0] as HTMLElement;

  const newHeight = webChatTranscriptContainer.clientHeight - incomingCallContainer.clientHeight;
  webChatTranscriptContainer.style.height = `${newHeight}px`;
}

const adjustWebChatHeightInVoiceCall = () => {
  console.log(`[WebChat][adjustWebChatHeightInVoiceCall]`);
  const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript')[0] as HTMLElement;
  const currentCallActionBar = document.getElementsByClassName('current-call-action-bar')[0] as HTMLElement;

  const newHeight = webChatTranscriptContainer.clientHeight - currentCallActionBar.clientHeight;
  webChatTranscriptContainer.style.marginTop = `${currentCallActionBar.clientHeight}px`;
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
  const [inVoiceCall, setInVoiceCall] = useState(false);

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
        setInVoiceCall(false);
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

    await VoiceVideoCallingSDK.acceptCall({
      withVideo: false
    });

    setIncomingCall(false);
    setInVideoCall(false);
    setInVoiceCall(true);

    adjustWebChatHeightInVoiceCall();
  }, [props]);

  const acceptVideoCall = useCallback(async() => {
    console.log(`[WebChat][Calling][Accept][Video]`);
    const {VoiceVideoCallingSDK} = props;

    await VoiceVideoCallingSDK.acceptCall({
      withVideo: true
    });

    setIncomingCall(false);
    setInVideoCall(true);
    setInVoiceCall(false);

    adjustWebChatHeightInVideoCall();
  }, [props]);

  const rejectCall = useCallback(async() => {
    console.log(`[WebChat][Calling][Reject]`);
    const {VoiceVideoCallingSDK} = props;
    await VoiceVideoCallingSDK.rejectCall();
    setIncomingCall(false);
  }, [props]);

  const toggleVideoButton = useCallback(async () => {
    console.log(`[WebChat][Calling][toggleLocalVideo]`);
    const {VoiceVideoCallingSDK} = props;
    await VoiceVideoCallingSDK.toggleLocalVideo();
  }, [props]);

  const toggleMuteButton = useCallback(async () => {
    console.log(`[WebChat][Calling][toggleMute]`);
    const {VoiceVideoCallingSDK} = props;
    await VoiceVideoCallingSDK.toggleMute();
  }, [props]);

  const stopCallButton = useCallback(async () => {
    console.log(`[WebChat][Calling][stopCall]`);
    const {VoiceVideoCallingSDK} = props;
    await VoiceVideoCallingSDK.stopCall();
  }, [props]);

  return (
    <>
      {
        incomingCall && <IncomingCall
          rejectCall={rejectCall}
          acceptVideoCall={acceptVideoCall}
          acceptVoiceCall={acceptVoiceCall}
        />
      }
      {
        <div className={`calling ${inVideoCall || inVoiceCall? 'active': ''}`}>
          <div className={`video-container ${inVideoCall? 'active': ''}`}>
            <div id="remoteVideo"></div>
            <div id="selfVideo"></div>
          </div>
          <div>
            {
              (inVideoCall || inVoiceCall) && <div className="current-call-action-bar">
                <Video className="toggle-video-button" onClick={toggleVideoButton} />
                <Mic className="toggle-mute-button" onClick={toggleMuteButton}/>
                <PhoneOff className="stop-call-button" onClick={stopCallButton}/>
              </div>
            }
          </div>
        </div>
      }
    </>
  )
}

export default Calling;