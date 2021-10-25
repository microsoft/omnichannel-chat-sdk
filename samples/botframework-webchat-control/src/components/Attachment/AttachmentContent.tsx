import React from "react";

const AttachmentContent = (props: React.PropsWithChildren<any>) => {
    const style = {
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center'
    }

    return (
        <div style={style}>
            {props.children}
        </div>
    )
};

export default AttachmentContent;