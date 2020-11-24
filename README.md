# Omnichannel Chat SDK

[![npm version](https://badge.fury.io/js/%40microsoft%2Fomnichannel-chat-sdk.svg)](https://badge.fury.io/js/%40microsoft%2Fomnichannel-chat-sdk)
![Release CI](https://github.com/microsoft/omnichannel-chat-sdk/workflows/Release%20CI/badge.svg)

Headless Chat SDK to build your own chat widget against Dynamics 365 Omnichannel Services.

## Installation

```
    npm install @microsoft/omnichannel-chat-sdk --save
```

## API

### High Level Overview

| Method | Description | Notes |
| ------ | ----------- | ----- |
| OmnichannelChatSDK.initialize() | Initializes ChatSDK internal data | |
| OmnichannelChatSDK.startChat() | Starts OC chat, handles prechat response | |
| OmnichannelChatSDK.endChat() | Ends OC chat | |
| OmnichannelChatSDK.getPreChatSurvey() | Adaptive card data of PreChat survey | |
| OmnichannelChatSDK.getLiveChatConfig() | Get live chat config | |
| OmnichannelChatSDK.getCurrentLiveChatContext() | Get current live chat context information to reconnect to the same chat | |
| OmnichannelChatSDK.getChatToken() | Get chat token | |
| OmnichannelChatSDK.getMessages() | Get all messages | |
| OmnichannelChatSDK.sendMessage() | Send message | |
| OmnichannelChatSDK.onNewMessage() | Handles system message, client/agent messages, adaptive cards, attachments to download | |
| OmnichannelChatSDK.onTypingEvent() | Handles agent typing event | |
| OmnichannelChatSDK.onAgentEndSession() | Handler when agent ends session | |
| OmnichannelChatSDK.sendTypingEvent() | Sends customer typing event | |
| OmnichannelChatSDK.emailLiveChatTranscript() | Email transcript | |
| OmnichannelChatSDK.getLiveChatTranscript() | Get transcript data (JSON) | |
| OmnichannelChatSDK.uploadFileAttachment() | Send file attachment | |
| OmnichannelChatSDK.downloadFileAttachment() | Download file attachment | |
| OmnichannelChatSDK.createChatAdapter() | Get IC3Adapter (Web only) | |

### Import
```ts
    import OmnichannelChatSDK from '@microsoft/omnichannel-chat-sdk';
```

### Initialization
```ts
    const omnichannelConfig = {
        orgUrl: "",
        orgId: "",
        widgetId: ""
    };

    const chatSDKConfig = { // Optional
        DataMasking: {
            disable: false,
            maskingCharacter: '#'
        }
    };

    const chatSDK = new OmnichannelChatSDK.OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
    await chatSDK.initialize();
```

### Get Current Live Chat Context
```ts
    const liveChatContext = await chatSDK.getCurrentLiveChatContext();
```

### Get Chat Token
```ts
    const chatToken = await chatSDK.getChatToken();
```

### Get Live Chat Config
```ts
    const liveChatConfig = await chatSDK.getLiveChatConfig();
```

### Get PreChat Survey
`Option 1`
```ts
    const preChatSurvey = await getPreChatSurvey(); // Adaptive Cards JSON payload data
```
`Option 2`
```ts
    const parseToJSON = false;
    const preChatSurvey = await getPreChatSurvey(parseToJSON); // Adaptive Cards payload data as string
```

### Start Chat
```ts
    const optionalParams = {
        preChatResponse: '', // PreChatSurvey response
        liveChatContext: {} // EXISTING chat context data
    };
    await chatSDK.startChat(optionalParams);
```

### End Chat
```ts
    await chatSDK.endChat();
```

### On New Message Handler
```ts
    chatSDK.onNewMessage((message) => {
      console.log(`[NewMessage] ${message.content}`); // IC3 protocol message data
      console.log(message);
    });
```

### On Agent End Session
```ts
    chatSDK.onAgentEndSession(() => {
      console.log("Session ended!");
    });
```

### On Typing Event
```ts
    chatSDK.onTypingEvent(() => {
      console.log("Agent is typing...");
    })
```

### Get Messages
```ts
    const messages = await chatSDK.getMessages();
```

### Send Message
```ts
    import {DeliveryMode, MessageContentType, MessageType, PersonType} from '@microsoft/omnichannel-chat-sdk';

    ...

    const displayName = "Contoso"
    const message = "Sample message from customer";
    const messageToSend = {
      content: message
    };

    await chatSDK.sendMessage(messageToSend);
```

### Send Typing
```ts
    await chatSDK.sendTypingEvent();
```

### Upload Attachment
```ts
    const fileInfo = {
        name: '',
        type: '',
        size: '',
        data: ''
    };
    await chatSDK.uploadFileAttachment(fileInfo);
```

### Download Attachment
```ts
    const blobResponse = await chatsdk.downloadFileAttachment(message.fileMetadata);

    ...

    // React Native implementation
    const fileReaderInstance = new FileReader();
    fileReaderInstance.readAsDataURL(blobResponse);
    fileReaderInstance.onload = () => {
        const base64data = fileReaderInstance.result;
        return <Image source={{uri: base64data}}/>
    }
```

### Get Live Chat Transcript

```ts
    await chatSDK.getLiveChatTranscript();
```

### Email Live Chat Transcript

```ts
    const body = {
        emailAddress: 'contoso@microsoft.com',
        attachmentMessage: 'Attachment Message',
        locale: 'en-us'
    };
    await chatSDK.emailLiveChatTranscript(body);
```

## Samples

### PreChatSurvey

```ts
    import * as AdaptiveCards, { Action } from "adaptivecards";

    ...

    const preChatSurvey = await chatSDK.getPreChatSurvey();

    ...

    // Web implementation
    const renderPreChatSurvey = () => {
        const adaptiveCard = new AdaptiveCards.AdaptiveCard();
        adaptiveCard.parse(preChatSurvey); // Parses Adaptive Card JSON data
        adaptiveCard.onExecuteAction = async (action: Action) => { // Adaptive Card event handler
            const preChatResponse = (action as any).data;
            const optionalParams: any = {};
            if (preChatResponse) {
                optionalParams.preChatResponse = preChatResponse;
            }
            await chatSDK.startChat(optionalParams);
        }

        const renderedCard = adaptiveCard.render(); // Renders as HTML element
        return <div ref={(n) => { // Returns React element
            n && n.firstChild && n.removeChild(n.firstChild); // Removes duplicates fix
            renderedCard && n && n.appendChild(renderedCard);
        }} />
    }

```

### Reconnect to existing Chat

```ts
    await chatSDK.startChat(); // Starts NEW chat

    const liveChatContext = await chatSDK.getCurrentLiveChatContext(); // Gets chat context

    cache.saveChatContext(liveChatContext); // Custom logic to save chat context to cache

    ...

    // Page/component reloads, ALL previous states are GONE

    ...

    const liveChatContext = cache.loadChatContext() // Custom logic to load chat context from cache

    const optionalParams = {};
    optionalParams.liveChatContext = liveChatContext;

    await chatSDK.startChat(optionalParams); // Reconnects to EXISTING chat

    ...

    const messages = await chatSDK.getMessages(); // Gets all messages from EXISTING chat
    messages.reverse().forEach((message: any) => renderMessage(message)); // Logic to render all messages to UI
```

### Authenticated Chat

```ts
    // add if using against an authenticated chat endpoint
    // see https://docs.microsoft.com/en-us/dynamics365/omnichannel/administrator/create-chat-auth-settings on how to set up an authenticated chat widget

    const chatSDKConfig = {
        getAuthToken: async () => {
            const response = await fetch("http://contosohelp.com/token");
            if (response.ok) {
                return await response.text();
            }
            else {
                return null
            }
        }
    }

    const chatSDK = new OmnichannelChatSDK.OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
    await chatSDK.initialize();

    // from this point, this acts like a regular chat widget
```

### Use [BotFramework-WebChat](https://github.com/microsoft/BotFramework-WebChat)

**NOTE**: Currently supported on web only
```ts
    import OmnichannelChatSDK from '@microsoft/omnichannel-chat-sdk';
    import ReactWebChat from 'botframework-webchat';

    ...

    const chatSDK = new OmnichannelChatSDK.OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
    await chatSDK.initialize();

    const optionalParams = {
        preChatResponse: '' // PreChatSurvey response
    };

    await chatSDK.startChat(optionalParams);
    const chatAdapter = await chatSDK.createChatAdapter();

    // Subscribes to incoming message (OPTION 1)
    chatSDK.onNewMessage((message) => {
      console.log(`[NewMessage] ${message.content}`); // IC3 protocol message data
      console.log(message);
    });

    // Subscribes to incoming message (OPTION 2)
    (chatAdapter as any).activity$.subscribe((activity: any) => {
        if (activity.type === "message") {
            console.log("[Message activity]");
            console.log(activity); // DirectLine protocol activity data
        }
    });

    ...

    <ReactWebChat
        userID="teamsvisitor"
        directLine={chatAdapter}
        sendTypingIndicator={true}
    />
```


## Feature Comparisons

### Web
| | Custom Control | WebChat Control |
| --- | --- | --- |
| **Features** | | |
| Chat Widget UI | Not provided | Basic chat client provided |
| Data Masking | Embedded | Requires `Attachment Middleware` implementation |
| Send Typing indicator | Embedded | Requires `sendTypingIndicator` flag set to `true` |
| PreChat Survey | Requires Adaptive Cards renderer | Requires Adaptive Cards renderer
| Display Attachments | Requires implementation | Provided & Customizable |
| Incoming messages handling | IC3 protocol message data | DirectLine activity data |

### React Native
| | Custom Control | Gifted Chat Control | WebChat Control |
| --- | --- | --- | --- |
| **Features** | | | Currently not supported |
| Chat Widget UI | Not provided | Basic chat client provided | X |
| Data Masking | Embedded | Embedded | X |
| Send Typing indicator | Embedded | WIP | X |
| PreChat Survey | Requires Adaptive Cards renderer | Requires Adaptive Cards renderer | X |
| Display Attachments | Requires implementation| Embedded | X |
| Incoming messages handling |IC3 protocol message data | IC3 protocol message data | X |


# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
