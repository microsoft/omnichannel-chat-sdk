# Omnichannel Chat SDK

[![npm version](https://badge.fury.io/js/%40microsoft%2Fomnichannel-chat-sdk.svg)](https://badge.fury.io/js/%40microsoft%2Fomnichannel-chat-sdk)
![Release CI](https://github.com/microsoft/omnichannel-chat-sdk/workflows/Release%20CI/badge.svg)

Headless Chat SDK to build your own chat widget against Dynamics 365 Omnichannel Services.

Please make sure you have a chat widget configured before using this package or you can follow this [link](https://docs.microsoft.com/en-us/dynamics365/customer-service/configure-live-chat)

## Table of Contents
- [Live Chat Widget vs. Chat SDK](#live-chat-widget-vs-chat-sdk)
- [Installation](#installation)
- [API Reference](#api-reference)
- [API Examples](#api-examples)
- [Sample Apps](samples/)
- [Common Scenarios](#common-scenarios)
- [Feature Comparisons](#feature-comparisons)
- [Telemetry](#telemetry)

## Live Chat Widget vs. Chat SDK

Omnichannel offers an live chat widget (LCW) by default. You can use the Chat SDK to build your custom chat widget if:
- You want to fully customize the user interface of the chat widget to conform with your branding.
- You want to integrate Omnichannel in your mobile app using React Native.
- You want to integrate additional functionalities that LCW does not offer.
- Some other cool ideas. Please share with us on what you've achieved with the Chat SDK! 🙂

### Feature Comparisons

| Feature | Live Chat Widget | Chat SDK | Notes |
| -----  | ----- | ----- | ----- |
| Bring Your Own Widget | ❌ | ✔ | |
| Web Support | ✔ | ✔ |
| React Native Support | ❌ | ✔ |
| Escalation to Voice & Video | ✔ | Web Only |
| Co-browse | ✔ | Web Only |
| Screen Sharing | ✔ | Web Only |
| Authenticated Chat | ✔ | ✔ |
| Pre-chat Survey | ✔ | ✔ |
| Post-chat Survey | ✔ | ❌ |
| Queue Position | ✔ | ✔ |
| Average Wait Time | ✔ | ✔ |
| Download Transcript | ✔ | ✔ |
| Email Transcript | ✔ | ✔ |
| Data Masking | ✔ | ✔ |
| File Attachments | ✔ | ✔ |
| Custom Context | ✔ | ✔ |
| Proactive Chat | ✔ | BYOI **\*** |

**\*** BYOI: Bring Your Own Implementation

## Installation

```
    npm install @microsoft/omnichannel-chat-sdk --save
```

## API Reference

| Method | Description | Notes |
| ------ | ----------- | ----- |
| OmnichannelChatSDK.initialize() | Initializes ChatSDK internal data | |
| OmnichannelChatSDK.startChat() | Starts OC chat, handles prechat response | |
| OmnichannelChatSDK.endChat() | Ends OC chat | |
| OmnichannelChatSDK.getPreChatSurvey() | Adaptive card data of PreChat survey | |
| OmnichannelChatSDK.getLiveChatConfig() | Get live chat config | |
| OmnichannelChatSDK.getDataMaskingRules() | Get active data masking rules | |
| OmnichannelChatSDK.getCurrentLiveChatContext() | Get current live chat context information to reconnect to the same chat | |
| OmnichannelChatSDK.getConversationDetails() | Get details of the current conversation such as its state & when the agent joined the conversation | |
| OmnichannelChatSDK.getChatToken() | Get chat token | |
| OmnichannelChatSDK.getCallingToken() | Get calling token | |
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
| OmnichannelChatSDK.createChatAdapter() | Get IC3Adapter | **Web only** |
| OmnichannelChatSDK.getVoiceVideoCalling() | Get VoiceVideoCall SDK for Escalation to Voice & Video| **Web only** |

## API examples

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
        dataMasking: {
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

### Get Conversation Details
```ts
    const conversationDetails = await chatSDK.getConversationDetails();
```

### Get Chat Token
```ts
    const chatToken = await chatSDK.getChatToken();
```

### Get Calling Token
```ts
    const callingToken = await chatSDK.getCallingToken();
```

### Get Live Chat Config
```ts
    const liveChatConfig = await chatSDK.getLiveChatConfig();
```

### Get Data Masking Rules
```ts
    const dataMaskingRules = await chatSDK.getDataMaskingRules();
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
    const customContext = {
        'contextKey1': {'value': 'contextValue1', 'isDisplayable': true},
        'contextKey2': {'value': 12.34, 'isDisplayable': false},
        'contextKey3': {'value': true}
    };

    const optionalParams = {
        preChatResponse: '', // PreChatSurvey response
        liveChatContext: {}, // EXISTING chat context data
        customContext // Custom Context
    };
    await chatSDK.startChat(optionalParams);
```

### End Chat
```ts
    await chatSDK.endChat();
```

### On New Message Handler
```ts
    const optionalParams = {
        rehydrate: true, // Rehydrate all previous messages of existing conversation (false by default)
    }

    chatSDK.onNewMessage((message) => {
      console.log(`[NewMessage] ${message.content}`); // IC3 protocol message data
      console.log(message);
    }, optionalParams);
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

## Common Scenarios

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

### Escalation to Voice & Video
**NOTE**: Currently supported on web only
```ts
    import OmnichannelChatSDK from '@microsoft/omnichannel-chat-sdk';

    ...

    const chatSDK = new OmnichannelChatSDK.OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
    await chatSDK.initialize();

    let VoiceVideoCallingSDK;
    try {
        VoiceVideoCallingSDK = await chatSDK.getVoiceVideoCalling();
        console.log("VoiceVideoCalling loaded");
    } catch (e) {
        console.log(`Failed to load VoiceVideoCalling: ${e}`);
    }

    await chatSDK.startChat();

    const chatToken: any = await chatSDK.getChatToken();

    try {
        await VoiceVideoCallingSDK.initialize({
            chatToken,
            selfVideoHTMLElementId: 'selfVideo', // HTML element id where video stream of the agent will be rendered
            remoteVideoHTMLElementId: 'remoteVideo', // HTML element id where video stream of the customer will be rendered
            OCClient: chatSDK.OCClient
        });
    } catch (e) {
        console.error("Failed to initialize VoiceVideoCalling!");
    }

    // Triggered when there's an incoming call
    VoiceVideoCallingSDK.onCallAdded(() => {
        ...
    });

    // Triggered when local video stream is available (e.g.: Local video added succesfully in selfVideoHTMLElement)
    VoiceVideoCallingSDK.onLocalVideoStreamAdded(() => {
        ...
    });

    // Triggered when local video stream is unavailable (e.g.: Customer turning off local video)
    VoiceVideoCallingSDK.onLocalVideoStreamRemoved(() => {
        ...
    });

    // Triggered when remote video stream is available (e.g.: Remote video added succesfully in remoteVideoHTMLElement)
    VoiceVideoCallingSDK.onRemoteVideoStreamAdded(() => {
        ...
    });

    // Triggered when remote video stream is unavailable (e.g.: Agent turning off remote video)
    VoiceVideoCallingSDK.onRemoteVideoStreamRemoved(() => {
        ...
    });

    // Triggered when current call has ended or disconnected regardless the party
    VoiceVideoCalling.onCallDisconnected(() => {
        ...
    });

    // Check if microphone is muted
    const isMicrophoneMuted = VoiceVideoCallingSDK.isMicrophoneMuted();

    // Check if remote video is available
    const isRemoteVideoEnabled = VoiceVideoCallingSDK.isRemoteVideoEnabled();

    // Check if local video is available
    const isLocalVideoEnabled = VoiceVideoCallingSDK.isLocalVideoEnabled();

    // Accepts incoming call
    const acceptCallConfig = {
        withVideo: true // Accept call with/without video stream
    };
    await VoiceVideoCallingSDK.acceptCall(acceptCallConfig);

    // Rejects incoming call
    await VoiceVideoCallingSDK.rejectCall();

    // Ends/Stops current call
    await VoiceVideoCallingSDK.stopCall();

    // Mute/Unmute current call
    await VoiceVideoCallingSDK.toggleMute()

    // Display/Hide local video of current call
    await VoiceVideoCallingSDK.toggleLocalVideo()

    // Clean up VoiceVideoCallingSDK (e.g.: Usually called when customer ends chat session)
    VoiceVideoCallingSDK.close();
```

## Feature Comparisons

### Web
| | Custom Control | WebChat Control |
| --- | --- | --- |
| **Features** | | |
| Chat Widget UI | Not provided | Basic chat client provided |
| Data Masking | Embedded | Requires `Data Masking Middleware` implementation |
| Send Typing indicator | Embedded | Requires `sendTypingIndicator` flag set to `true` |
| PreChat Survey | Requires Adaptive Cards renderer | Requires Adaptive Cards renderer
| Display Attachments | Requires implementation | Basic interface provided & Customizable |
| Incoming messages handling | IC3 protocol message data | DirectLine activity data |

### React Native
| | Custom Control | Gifted Chat Control | WebChat Control |
| --- | --- | --- | --- |
| **Features** | | | Currently not supported |
| Chat Widget UI | Not provided | Basic chat client provided | X |
| Data Masking | Embedded | Embedded | X |
| Send Typing indicator | Embedded | Requires Implementation | X |
| PreChat Survey | Requires Adaptive Cards renderer | Requires Adaptive Cards renderer | X |
| Display Attachments | Requires implementation| Embedded | X |
| Incoming messages handling |IC3 protocol message data | IC3 protocol message data | X |

## Telemetry

Omnichannel Chat SDK collects telemetry by default to improve the feature’s capabilities, reliability, and performance over time by helping Microsoft understand usage patterns, plan new features, and troubleshoot and fix problem areas.

Some of the data being collected are the following:

| Field | Sample |
| --- | --- |
| Organization Id | `e00e67ee-a60e-4b49-b28c-9d279bf42547` |
| Organization Url | `org60082947.crm.oc.crmlivetie.com` |
| Widget Id | `1893e4ae-2859-4ac4-9cf5-97cffbb9c01b` |
| Browser Name | `Edge` |
| Os Name | `Windows` |
| Anonymized IP Address (last octet redacted) | `19.207.000.000` |

If your organization is concerned about the data collected by the Chat SDK, you have the option to turn off automatic data collection by adding a flag in the `ChatSDKConfig`.

```ts
    const omnichannelConfig = {
        orgUrl: "",
        orgId: "",
        widgetId: ""
    };

    const chatSDKConfig = {
        telemetry: {
            disable: true // Disable telemetry
        }
    };

    const chatSDK = new OmnichannelChatSDK.OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
    await chatSDK.initialize();
```

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
