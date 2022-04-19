# Development Guide

## How To
**[Using Bot Framework Web Chat](#using-bot-framework-web-chat)**
1. [Render Adaptive Cards using Attachment Middleware](#render-adaptive-cards-using-attachment-middleware)

**[Using Omnichannel Chat SDK](#using-omnichannel-chat-sdk)**
1. [Render Adaptive Cards](#render-adaptive-cards)

## Using Bot Framework Web Chat

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

## Using Omnichannel Chat SDK

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

        adaptiveCard.onExecuteAction = async (action: Action) => { // Adaptive Card event handler
            // ...
        }

        const renderedCard = adaptiveCard.render(); // Renders as HTML element

        // Logic to add renderedCard in the DOM
    }
});
```