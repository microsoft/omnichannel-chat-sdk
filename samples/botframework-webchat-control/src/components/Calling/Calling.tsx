import React, { useCallback, useEffect, useState, useContext } from 'react';
import './Calling.css';

interface CallingProps {
  VoiceVideoCallingSDK: any;
  OCClient: any;
  chatToken: any;
}

function Calling(props: CallingProps) {
  const [incomingCall, setIncomingCall] = useState(false);

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
        (VoiceVideoCallingSDK as any).acceptCall({
          withVideo: true
        })

        // Fix height
        const webChatTranscriptContainer = document.getElementsByClassName('webchat__basic-transcript__scrollable')[0] as HTMLElement;
        const remoteVideoContainer = document.getElementById('remoteVideo') as HTMLElement;

        const heightGap = webChatTranscriptContainer.clientHeight - remoteVideoContainer.clientHeight;
        webChatTranscriptContainer.style.marginTop = `${remoteVideoContainer.clientHeight}px`;
        webChatTranscriptContainer.style.height = `${heightGap}px`;
        setIncomingCall(true);
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

  return (
    <div className="calling">
      <div className="container">
        <div id="remoteVideo"></div>
        <div id="selfVideo"></div>
      </div>
    </div>
  )
}

export default Calling;