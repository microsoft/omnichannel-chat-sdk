import React, { useCallback, useEffect, useState } from 'react';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'react-feather';
import IncomingCall from './IncomingCall';
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
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [isRemoteVideoEnabled, setIsRemoteVideoEnabled] = useState(false);
  const [isLocalVideoEnabled, setIsLocalVideoEnabled] = useState(false);

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

        adjustWebChatHeightNoCall();

        setIncomingCall(false);
        setInVideoCall(false);
        setInVoiceCall(false);
      });

      VoiceVideoCallingSDK.onLocalVideoStreamAdded(() => {
        console.log('[WebChat][Calling][LocalVideoStreamAdded]');

        const isMicrophoneMuted = VoiceVideoCallingSDK.isMicrophoneMuted();
        setIsMicrophoneMuted(isMicrophoneMuted);

        const isRemoteVideoEnabled = VoiceVideoCallingSDK.isRemoteVideoEnabled();
        setIsRemoteVideoEnabled(isRemoteVideoEnabled);

        const isLocalVideoEnabled = VoiceVideoCallingSDK.isLocalVideoEnabled();
        setIsLocalVideoEnabled(isLocalVideoEnabled);

        // No video stream available at this point, voice call
        if (!isLocalVideoEnabled && !isRemoteVideoEnabled) {
          setIncomingCall(false);
          setInVideoCall(false);
          setInVoiceCall(true);
        } else {
          setIncomingCall(false);
          setInVideoCall(true);
          setInVoiceCall(false);
        }
      });

      VoiceVideoCallingSDK.onLocalVideoStreamRemoved(() => {
        console.log('[WebChat][Calling][LocalVideoStreamRemoved]');

        const isMicrophoneMuted = VoiceVideoCallingSDK.isMicrophoneMuted();
        setIsMicrophoneMuted(isMicrophoneMuted);

        const isRemoteVideoEnabled = VoiceVideoCallingSDK.isRemoteVideoEnabled();
        setIsRemoteVideoEnabled(isRemoteVideoEnabled);

        const isLocalVideoEnabled = VoiceVideoCallingSDK.isLocalVideoEnabled();
        setIsLocalVideoEnabled(isLocalVideoEnabled);

        // No video stream available at this point, voice call
        if (!isLocalVideoEnabled && !isRemoteVideoEnabled) {
          setIncomingCall(false);
          setInVideoCall(false);
          setInVoiceCall(true);
        } else {
          setIncomingCall(false);
          setInVideoCall(true);
          setInVoiceCall(false);
        }
      });

      VoiceVideoCallingSDK.onRemoteVideoStreamAdded(() => {
        console.log('[WebChat][Calling][RemoteVideoStreamAdded]');

        const isMicrophoneMuted = VoiceVideoCallingSDK.isMicrophoneMuted();
        setIsMicrophoneMuted(isMicrophoneMuted);

        const isRemoteVideoEnabled = VoiceVideoCallingSDK.isRemoteVideoEnabled();
        setIsRemoteVideoEnabled(isRemoteVideoEnabled);

        const isLocalVideoEnabled = VoiceVideoCallingSDK.isLocalVideoEnabled();
        setIsLocalVideoEnabled(isLocalVideoEnabled);

        // No video stream available at this point, voice call
        if (!isLocalVideoEnabled && !isRemoteVideoEnabled) {
          setIncomingCall(false);
          setInVideoCall(false);
          setInVoiceCall(true);
        } else {
          setIncomingCall(false);
          setInVideoCall(true);
          setInVoiceCall(false);
        }
      });

      VoiceVideoCallingSDK.onRemoteVideoStreamRemoved(() => {
        console.log('[WebChat][Calling][RemoteVideoStreamRemoved]');

        const isMicrophoneMuted = VoiceVideoCallingSDK.isMicrophoneMuted();
        setIsMicrophoneMuted(isMicrophoneMuted);

        const isRemoteVideoEnabled = VoiceVideoCallingSDK.isRemoteVideoEnabled();
        setIsRemoteVideoEnabled(isRemoteVideoEnabled);

        const isLocalVideoEnabled = VoiceVideoCallingSDK.isLocalVideoEnabled();
        setIsLocalVideoEnabled(isLocalVideoEnabled);

        // No video stream available at this point, voice call
        if (!isLocalVideoEnabled && !isRemoteVideoEnabled) {
          setIncomingCall(false);
          setInVideoCall(false);
          setInVoiceCall(true);
        } else {
          setIncomingCall(false);
          setInVideoCall(true);
          setInVoiceCall(false);
        }
      });
    }

    init();
  }, [props]);

  const acceptVoiceCall = useCallback(async () => {
    console.log(`[WebChat][Calling][Accept][Voice]`);
    const {VoiceVideoCallingSDK} = props;

    await VoiceVideoCallingSDK.acceptCall({
      withVideo: false
    });

    setIncomingCall(false);
    setInVideoCall(false);
    setInVoiceCall(true);

    adjustWebChatHeightInVoiceCall();

    const isMicrophoneMuted = VoiceVideoCallingSDK.isMicrophoneMuted();
    setIsMicrophoneMuted(isMicrophoneMuted);

    const isRemoteVideoEnabled = VoiceVideoCallingSDK.isRemoteVideoEnabled();
    setIsRemoteVideoEnabled(isRemoteVideoEnabled);

    const isLocalVideoEnabled = VoiceVideoCallingSDK.isLocalVideoEnabled();
    setIsLocalVideoEnabled(isLocalVideoEnabled);
  }, [props]);

  const acceptVideoCall = useCallback(async () => {
    console.log(`[WebChat][Calling][Accept][Video]`);
    const {VoiceVideoCallingSDK} = props;

    await VoiceVideoCallingSDK.acceptCall({
      withVideo: true
    });

    setIncomingCall(false);
    setInVideoCall(true);
    setInVoiceCall(false);

    adjustWebChatHeightInVideoCall();

    const isMicrophoneMuted = VoiceVideoCallingSDK.isMicrophoneMuted();
    setIsMicrophoneMuted(isMicrophoneMuted);

    const isRemoteVideoEnabled = VoiceVideoCallingSDK.isRemoteVideoEnabled();
    setIsRemoteVideoEnabled(isRemoteVideoEnabled);

    const isLocalVideoEnabled = VoiceVideoCallingSDK.isLocalVideoEnabled();
    setIsLocalVideoEnabled(isLocalVideoEnabled);
  }, [props]);

  const rejectCall = useCallback(async () => {
    console.log(`[WebChat][Calling][Reject]`);
    const {VoiceVideoCallingSDK} = props;
    await VoiceVideoCallingSDK.rejectCall();

    setIncomingCall(false);
    setInVideoCall(false);
    setInVoiceCall(false);
  }, [props]);

  const toggleVideoButton = useCallback(async () => {
    console.log(`[WebChat][Calling][toggleLocalVideo]`);
    const {VoiceVideoCallingSDK} = props;
    await VoiceVideoCallingSDK.toggleLocalVideo();

    const isMicrophoneMuted = VoiceVideoCallingSDK.isMicrophoneMuted();
    setIsMicrophoneMuted(isMicrophoneMuted);

    const isRemoteVideoEnabled = VoiceVideoCallingSDK.isRemoteVideoEnabled();
    setIsRemoteVideoEnabled(isRemoteVideoEnabled);

    const isLocalVideoEnabled = VoiceVideoCallingSDK.isLocalVideoEnabled();
    setIsLocalVideoEnabled(isLocalVideoEnabled);

    // No video stream available at this point, voice call
    if (!isLocalVideoEnabled && !isRemoteVideoEnabled) {
      setIncomingCall(false);
      setInVideoCall(false);
      setInVoiceCall(true);
    } else {
      setIncomingCall(false);
      setInVideoCall(true);
      setInVoiceCall(false);
    }
  }, [props]);

  const toggleMuteButton = useCallback(async () => {
    console.log(`[WebChat][Calling][toggleMute]`);
    const {VoiceVideoCallingSDK} = props;
    await VoiceVideoCallingSDK.toggleMute();

    const isMicrophoneMuted = VoiceVideoCallingSDK.isMicrophoneMuted();
    setIsMicrophoneMuted(isMicrophoneMuted);

    const isRemoteVideoEnabled = VoiceVideoCallingSDK.isRemoteVideoEnabled();
    setIsRemoteVideoEnabled(isRemoteVideoEnabled);

    const isLocalVideoEnabled = VoiceVideoCallingSDK.isLocalVideoEnabled();
    setIsLocalVideoEnabled(isLocalVideoEnabled);

    // No video stream available at this point, voice call
    if (!isLocalVideoEnabled && !isRemoteVideoEnabled) {
      setIncomingCall(false);
      setInVideoCall(false);
      setInVoiceCall(true);
    } else {
      setIncomingCall(false);
      setInVideoCall(true);
      setInVoiceCall(false);
    }
  }, [props]);

  const stopCallButton = useCallback(async () => {
    console.log(`[WebChat][Calling][stopCall]`);
    const {VoiceVideoCallingSDK} = props;
    await VoiceVideoCallingSDK.stopCall();
  }, [props]);

  const renderToggleVideoButton = () => {
    if (!isLocalVideoEnabled) {
      return <VideoOff className="toggle-video-button" onClick={toggleVideoButton}/>
    }
    return <Video className="toggle-video-button" onClick={toggleVideoButton}/>
  }

  const renderToggleMuteButton = () => {
    if (isMicrophoneMuted) {
      return <MicOff className="toggle-mute-button" onClick={toggleMuteButton}/>
    }
    return <Mic className="toggle-mute-button" onClick={toggleMuteButton}/>
  }

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
                {renderToggleVideoButton()}
                {renderToggleMuteButton()}
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