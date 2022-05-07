# Development Guide

## How To
**[Using Bot Framework Web Chat Control](#using-bot-framework-web-chat-control)**
1. [Render Adaptive Cards using Attachment Middleware](#render-adaptive-cards-using-attachment-middleware)
1. [Send Default Channel Message Tags using Store Middleware](#send-default-channel-message-tags-using-store-middleware)
1. [Data Masking using Store Middleware](#data-masking-using-store-middleware)
1. [Send Typing using Web Chat Props](#send-typing-using-web-chat-props)
1. [Set Upload File Button Visibility](#set-upload-file-button-visibility)
1. [Upload File Validation Middleware using Store Middleware](#upload-file-validation-middleware-using-store-middleware)
1. [Render Multiple Files Upload Middleware using Store Middleware](#render-multiple-files-upload-middleware-using-store-middleware)

**[Using Custom Chat Control](#using-custom-chat-control)**
1. [Render Adaptive Cards](#render-adaptive-cards)
1. [Upload File Validation](#upload-file-validation)

## Using Bot Framework Web Chat Control

### Render Adaptive Cards using Attachment Middleware

```js
import ReactWebChat from 'botframework-webchat';

const supportedAdaptiveCardContentTypes = [
    "application/vnd.microsoft.card.adaptive",
    "application/vnd.microsoft.card.audio",
    "application/vnd.microsoft.card.hero",
    "application/vnd.microsoft.card.receipt",
    "application/vnd.microsoft.card.thumbnail",
    "application/vnd.microsoft.card.signin",
    "application/vnd.microsoft.card.oauth",
];

const adaptiveCardKeyValuePairs = `"type": "AdaptiveCard"`;

const attachmentMiddleware = () => (next) => (card) => {
    const { activity: { attachments }, attachment } = card;

    // No attachment
    if (!attachments || !attachments.length || !attachment) {
        return next(card);
    }

    let { content, contentType } = attachment || { content: "", contentType: "" };
    let { type } = content || { type: "" };

    if (supportedAdaptiveCardContentTypes.includes(contentType) || type === 'AdaptiveCard') {
        // Parse adaptive card content in JSON string format
        if (content && typeof content === 'string' && content.includes(adaptiveCardKeyValuePairs)) {
            try {
                content = JSON.parse(content);
                type = content.type;
                card.attachment.content = content;
            } catch {
                // Ignore parsing failures to keep chat flowing
            }
        }

        return next(card);
    }

    // ...Additional customizations
};

// ...

return <ReactWebChat
    {...props}
    attachmentMiddleware={attachmentMiddleware}
/>
```

### Send Default Channel Message Tags using Store Middleware

```js
import ReactWebChat, {createStore} from 'botframework-webchat';

const channelIdTag = `ChannelId-lcw`;
const customerMessageTag = `FromCustomer`;

const sendDefaultMessagingTagsMiddleware = () => (next) => (action) => {
    const condition = action.type === "DIRECT_LINE/POST_ACTIVITY_PENDING"
    && action.payload
    && action.payload.activity
    && action.payload.activity.channelData;

    if (condition) {
        // Add `tags` property if not set
        if (!action.payload.activity.channelData.tags) {
            action.payload.activity.channelData.tags = [];
        }

        // Add `ChannelId-lcw` tag if not set
        if (!action.payload.activity.channelData.tags.includes(channelIdTag)) {
            action.payload.activity.channelData.tags.push(channelIdTag);
        }

        // Add `FromCustomer` tag if not set
        if (!action.payload.activity.channelData.tags.includes(customerMessageTag)) {
            action.payload.activity.channelData.tags.push(customerMessageTag);
        }
    }

    return next(action);
};

const store = createStore(
  {}, // initial state
  sendDefaultMessagingTagsMiddleware
);

// ...

return <ReactWebChat
    {...props}
    store={store}
/>
```

### Data Masking using Store Middleware

```js
import ReactWebChat, {createStore} from 'botframework-webchat';

// Fetch masking rules
const maskingRules = chatSDK.getDataMaskingRules();

const maskingCharacter = '#';
const applyMasking = (text, maskingCharacter) => {
    // Skip masking on invalid text or masking rules
    if (!text || !maskingRules || !Object.keys(maskingRules).length) {
        return text;
    }

    for (const maskingRule of Object.values(maskingRules)) {
        const regex = new RegExp(maskingRule, 'g');
        // Masks data
        let result;
        while (result = regex.exec(text)) {
            const replaceStr = result[0].replace(/./g, maskingCharacter);
            text = text.replace(result[0], replaceStr);
        }
    }

    return text; // Returns masked data
}

const dataMaskingMiddleware = () => (next) => (action) => {
    const condition = action.type === "WEB_CHAT/SEND_MESSAGE"
    && action.payload
    && action.payload.text
    && Object.keys(maskingRules).length > 0;

    if (condition) {
        action.payload.text = applyMasking(action.payload.text, maskingCharacter);
    }

    return next(action);
}

const store = createStore(
  {}, // initial state
  dataMaskingMiddleware
);

// ...

return <ReactWebChat
    {...props}
    store={store}
/>
```


### Send Typing using Web Chat Props

```js
import ReactWebChat from 'botframework-webchat';

// ...

return <ReactWebChat
    {...props}
    sendTypingIndicator={true}
/>
```

### Set Upload File Button Visibility

```js
import ReactWebChat from 'botframework-webchat';

const liveChatConfig = await chatSDK.getLiveChatConfig();
const {LiveWSAndLiveChatEngJoin: liveWSAndLiveChatEngJoin} = liveChatConfig;
const {msdyn_enablefileattachmentsforcustomers} = liveWSAndLiveChatEngJoin;

const canUploadAttachment = msdyn_enablefileattachmentsforcustomers === "true" || false;

const styleOptions = {
    hideUploadButton: !canUploadAttachment
};

// ...

return <ReactWebChat
    {...props}
    styleOptions={styleOptions}
/>
```

### Upload File Validation Middleware using Store Middleware

```js
import ReactWebChat, {createStore} from 'botframework-webchat';

const liveChatConfig = await chatSDK.getLiveChatConfig();
const {allowedFileExtensions, maxUploadFileSize, LiveWSAndLiveChatEngJoin: liveWSAndLiveChatEngJoin} = liveChatConfig; // maxUploadFileSize in MB
const {msdyn_enablefileattachmentsforcustomers} = liveWSAndLiveChatEngJoin;

const canUploadAttachment = msdyn_enablefileattachmentsforcustomers === "true" || false;

const dispatchAttachmentErrorNotification = (dispatch, message) => {
    dispatch({
        type: "WEB_CHAT/SET_NOTIFICATION",
        payload: {
            id: 'attachment',
            level: 'error',
            message
        }
    });
}

const removeAttachment = (attachments, attachmentSizes, index) => {
    attachments.splice(index, 1);
    attachmentSizes.splice(index, 1);
}

const isValidAttachmentFileSize = (fileSizeLimit, attachmentSize) => {
    return parseInt(fileSizeLimit) * 1024 * 1024 > parseInt(attachmentSize);
}

const extractFileExtension = (fileName) => {
    const index = fileName.toLowerCase().lastIndexOf('.');
    if (index < 0) {
        return '';
    }

    return fileName.substring(index);
}

const isValidAttachmentFileExtension = (supportedFileExtensions, fileExtension) => {
    return supportedFileExtensions.includes(fileExtension);
}

const uploadFileValidationMiddleware = ({ dispatch }) => (next) => (action) => {
    const condition = action.type === "DIRECT_LINE/POST_ACTIVITY"
    && action.payload
    && action.payload.activity
    && action.payload.activity.attachments
    && action.payload.activity.channelData
    && action.payload.activity.channelData.attachmentSizes
    && action.payload.activity.attachments.length === action.payload.activity.channelData.attachmentSizes.length;

    if (condition) {
        const {payload: {activity: {attachments, channelData: {attachmentSizes}}}} = action;

        // Attachment upload capability disabled on admin config
        if (!canUploadAttachment) {
            action.payload.activity.attachments = [];
            action.payload.activity.channelData.attachmentSizes = [];
            return next(action);
        }

        attachments.forEach((attachment: any, i: number) => {
            const fileExtension = extractFileExtension(attachment.name);
            const supportedFileExtensions = allowedFileExtensions.toLowerCase().split(',');
            const isFileEmpty = parseInt(attachmentSizes[i]) === 0;
            const validFileSize = isValidAttachmentFileSize(maxUploadFileSize, attachmentSizes[i]);
            const validFileExtension = isValidAttachmentFileExtension(supportedFileExtensions, fileExtension);

            if (!attachment.name) {
                const message = `There was an error uploading the file, please try again.`;
                dispatchAttachmentErrorNotification(dispatch, message);
                removeAttachment(attachments, attachmentSizes, i);
                return next(action);
            }

            if (!validFileSize && !validFileExtension) {
                if (!fileExtension) {
                    const message = `File exceeds the allowed limit of  ${maxUploadFileSize} MB and please upload the file with an appropriate file extension.`;
                    dispatchAttachmentErrorNotification(dispatch, message);
                } else {
                    const message = `File exceeds the allowed limit of ${maxUploadFileSize} MB and ${fileExtension} files are not supported.`;
                    dispatchAttachmentErrorNotification(dispatch, message);
                }

                removeAttachment(attachments, attachmentSizes, i);
                return next(action);
            }

            if (isFileEmpty) {
                const message = `This file can't be attached because it's empty. Please try again with a different file.`;
                dispatchAttachmentErrorNotification(dispatch, message);
                removeAttachment(attachments, attachmentSizes, i);
                return next(action);
            }

            if (!validFileSize) {
                const message = `File exceeds the allowed limit of ${maxUploadFileSize} MB`;
                dispatchAttachmentErrorNotification(dispatch, message);
                removeAttachment(attachments, attachmentSizes, i);
                return next(action);
            }

            if (!validFileExtension) {
                if (!fileExtension) {
                    const message = `File upload error. Please upload the file with an appropriate file extension.`;
                    dispatchAttachmentErrorNotification(dispatch, message);
                } else {
                    const message = `${fileExtension} files are not supported.`;
                    dispatchAttachmentErrorNotification(dispatch, message);
                }

                removeAttachment(attachments, attachmentSizes, i);
                return next(action);
            }
        });
    }

    return next(action);
}

const store = createStore(
  {}, // initial state
  uploadFileValidationMiddleware
);

// ...

return <ReactWebChat
    {...props}
    store={store}
/>
```

### Render Multiple Files Upload Middleware using Store Middleware

```js
import ReactWebChat, {createStore} from 'botframework-webchat';

const createSendFileAction = (files) => ({
    type: "WEB_CHAT/SEND_FILES",
    payload: {
        files
    }
});

const renderMultipleFilesUploadMiddleware = ({ dispatch }) => (next) => (action) => {
    const condition = action.type === "WEB_CHAT/SEND_FILES"
    && action.payload
    && action.payload.files
    && action.payload.files.length > 0

    if (condition) {
        const {payload: {files}} = action;

        if (files.length === 1) {
            return next(action);
        }

        // Dispatch 'WEB_CHAT/SEND_FILES' action on every file to render all attachments
        const dispatchAction = createSendFileAction(files.slice(0, files.length - 1));
        const nextAction = createSendFileAction([files[files.length - 1]]);

        dispatch(dispatchAction);

        return next(nextAction);
    }

    return next(action);
}

const store = createStore(
  {}, // initial state
  renderMultipleFilesUploadMiddleware
);

// ...

return <ReactWebChat
    {...props}
    store={store}
/>
```

## Using Custom Chat Control

### Render Adaptive Cards

```js
import * as AdaptiveCards, { Action } from "adaptivecards";

// ...

ChatSDK.onNewMessage((message: any) => {
    const {content} = message;

    // Adaptive Cards
    if (content && content.includes('URIObject')) {
        const parser = DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');

        if (xmlDoc.getElementsByTagName(HTMLConstants.tagParseError).length > 0) {
            console.warn(`[AdaptiveCard] Unable to parse XML`);
            return;
        }

        if (xmlDoc.documentElement.nodeName !== 'URIObject') {
            console.warn(`[AdaptiveCard] Wrong XML schema`);
            return;
        }

        const swiftElement = xmlDoc.getElementsByTagName('Swift')[0];
        const base64Data: any = swiftElement.getAttribute('b64');
        const data = this.b64DecodeUnicode(base64Data);

        if (!data) {
            console.warn(`[AdaptiveCard] Data is empty`);
            return;
        }

        const jsonData = JSON.parse(data);
        const { type } = jsonData;

        // Check if it's adaptive card
        if (!type.includes('message/card')) {
            return;
        }

        const adaptiveCard = new AdaptiveCards.AdaptiveCard();
        adaptiveCard.parse(jsonData);

        adaptiveCard.onExecuteAction = async (action) => { // Adaptive Card event handler
            // ...
        }

        const renderedCard = adaptiveCard.render(); // Renders as HTML element

        // Logic to add renderedCard in the DOM
    }
});
```

### Upload File Validation

```js
const liveChatConfig = await chatSDK.getLiveChatConfig();
const {allowedFileExtensions, maxUploadFileSize} = liveChatConfig; // maxUploadFileSize in MB

const isValidAttachmentFileSize = (fileSizeLimit, attachmentSize) => {
    return parseInt(fileSizeLimit) * 1024 * 1024 > parseInt(attachmentSize);
}

const extractFileExtension = (fileName) => {
    const index = fileName.toLowerCase().lastIndexOf('.');
    if (index < 0) {
        return '';
    }

    return fileName.substring(index);
}

const isValidAttachmentFileExtension = (supportedFileExtensions, fileExtension) => {
    return supportedFileExtensions.includes(fileExtension);
}

const fileSelector = document.createElement('input');
fileSelector.setAttribute('type', 'file');
fileSelector.setAttribute('multiple', 'true'); // Allow multiple file inputs (optional)
fileSelector.click();

fileSelector.onchange = async (event) => {
    [...event.target.files].forEach((file) => {
        const fileExtension = extractFileExtension(file.name);
        const supportedFileExtensions = allowedFileExtensions.toLowerCase().split(',');
        const isFileEmpty = parseInt(file.size) === 0;
        const validFileSize = isValidAttachmentFileSize(maxUploadFileSize, file.size);
        const validFileExtension = isValidAttachmentFileExtension(supportedFileExtensions, fileExtension);

        if (!isFileEmpty && validFileSize && validFileExtension) {
            chatSDK?.uploadFileAttachment(file);
        }

        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onloadend = () => {
            // Display Attachment
        }
    });
}
```