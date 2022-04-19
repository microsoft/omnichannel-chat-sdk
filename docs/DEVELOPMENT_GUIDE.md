# Development Guide

### How To
**[Using Bot Framework Web Chat](#using-bot-framework-web-chat)**
1. [Render Adaptive Cards using Attachment Middleware](#render-adaptive-cards-using-attachment-middleware)

## Using Bot Framework Web Chat

#### Render Adaptive Cards using Attachment Middleware

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

