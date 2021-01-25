import React from "react";
import { Download, Mail } from "react-feather";
import './ActionBar.css';

interface ActionBarProps {
  onDownloadClick: (event: React.MouseEvent<SVGAElement, MouseEvent>) => void
  onEmailTranscriptClick: (event: React.MouseEvent<SVGAElement, MouseEvent>) => void
}

function ActionBar (props: ActionBarProps) {
    return (
      <div className="action-bar">
        <Download
          size={'16'}
          color='rgb(22, 27, 34)'
          className='download-button'
          onClick={props.onDownloadClick}
        />
        <Mail
          size={'16'}
          color='rgb(22, 27, 34)'
          className='email-button'
          onClick={props.onEmailTranscriptClick}
        />
      </div>
    );
}

export default ActionBar;