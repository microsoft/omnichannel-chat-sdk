import React, { useCallback, useState } from "react";
import { Download, Mail } from "react-feather";
import './ActionBar.css';

interface ActionBarProps {
  onDownloadClick: (event: React.MouseEvent<SVGAElement, MouseEvent>) => void
  onEmailTranscriptClick: (event: React.MouseEvent<SVGAElement, MouseEvent>) => void
}

function ActionBar (props: ActionBarProps) {
  const [isDownloadFocused, setIsDownloadFocused] = useState(false);
  const [isEmailTranscriptFocused, setIsEmailTranscriptFocused] = useState(false);

  const onMouseEnterDownload = useCallback(() => {
    setIsDownloadFocused(true);
  }, []);

  const onMouseLeaveDownload = useCallback(() => {
    setIsDownloadFocused(false);
  }, []);

  const onMouseEnterEmailTranscript = useCallback(() => {
    setIsEmailTranscriptFocused(true);
  }, []);

  const onMouseLeaveEmailTranscript = useCallback(() => {
    setIsEmailTranscriptFocused(false);
  }, []);

  return (
    <div className="action-bar">
      <Download
        size={'16'}
        color={isDownloadFocused? 'rgb(22, 27, 34)': 'rgb(22, 27, 34, 0.5)'}
        className='download-button'
        onClick={props.onDownloadClick}
        onMouseEnter={onMouseEnterDownload}
        onMouseLeave={onMouseLeaveDownload}
      />
      <Mail
        size={'16'}
        color={isEmailTranscriptFocused? 'rgb(22, 27, 34)': 'rgb(22, 27, 34, 0.5)'}
        className='email-button'
        onClick={props.onEmailTranscriptClick}
        onMouseEnter={onMouseEnterEmailTranscript}
        onMouseLeave={onMouseLeaveEmailTranscript}
      />
    </div>
  );
}

export default ActionBar;