# Development Guide

## How To
**[Using Bot Framework Web Chat Control](#using-bot-framework-web-chat-control)**
1. [Render Adaptive Cards using Attachment Middleware](#render-adaptive-cards-using-attachment-middleware)
1. [Send Default Channel Message Tags using Store Middleware](#send-default-channel-message-tags-using-store-middleware)
1. [Data Masking using Store Middleware](#data-masking-using-store-middleware)

**[Using Custom Chat Control](#using-custom-chat-control)**
1. [Render Adaptive Cards](#render-adaptive-cards)

## Using Bot Framework Web Chat Control

### Render Adaptive Cards using Attachment Middleware

```js
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
import {createStore} from 'botframework-webchat';

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
```

### Data Masking using Store Middleware

```js
import {createStore} from 'botframework-webchat';

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