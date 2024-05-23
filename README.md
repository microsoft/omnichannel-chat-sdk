# Omnichannel Chat SDK 💬

[![npm version](https://badge.fury.io/js/%40microsoft%2Fomnichannel-chat-sdk.svg)](https://badge.fury.io/js/%40microsoft%2Fomnichannel-chat-sdk)
[![install size](https://packagephobia.com/badge?p=@microsoft/omnichannel-chat-sdk)](https://packagephobia.com/result?p=@microsoft/omnichannel-chat-sdk)
![Release CI](https://github.com/microsoft/omnichannel-chat-sdk/workflows/Release%20CI/badge.svg)
![npm](https://img.shields.io/npm/dm/@microsoft/omnichannel-chat-sdk)

> ❗ We recommend using official release versions in production as listed [here](#releases). Support will be provided only on official versions.

> 📢 Try out our new React component library [omnichannel-chat-widget](https://github.com/microsoft/omnichannel-chat-widget) with Chat SDK

Headless Chat SDK to build your own chat widget against Dynamics 365 Omnichannel Services.

Please make sure you have a chat widget configured before using this package or you can follow this [link](https://docs.microsoft.com/en-us/dynamics365/customer-service/add-chat-widget)

## Table of Contents
- [Live Chat Widget vs. Chat SDK](#live-chat-widget-vs-chat-sdk)
- [Releases](#releases)
- [Installation](#installation)
- [Installation on React Native](#installation-on-react-native)
- [SDK Methods](#sdk-methods)
    - [Initialization](#initialization)
    - [Start Chat](#start-chat)
    - [End Chat](#end-chat)
    - [Get Pre-Chat Survey](#get-pre-chat-survey)
    - [Get Live Chat Config](#get-live-chat-config)
    - [Get Current Live Chat Context](#get-current-live-chat-context)
    - [Get Data Masking Rules](#get-data-masking-rules)
    - [Get Chat Reconnect Context](#get-chat-reconnect-context)
    - [Get Conversation Details](#get-conversation-details)
    - [Get Chat Token](#get-chat-token)
    - [Get Calling Token](#get-calling-token)
    - [Get Messages](#get-messages)
    - [Send Messages](#send-messages)
    - [On New Message](#on-new-message)
    - [On Typing Event](#on-typing-event)
    - [On Agent End Session](#on-agent-end-session)
    - [Send Typing Event](#send-typing-event)
    - [Email Live Chat Transcript](#email-live-chat-transcript)
    - [Get Live Chat Transcript](#get-live-chat-transcript)
    - [Upload File Attachment](#upload-file-attachment)
    - [Download File Attachment](#download-file-attachment)
    - [Create Chat Adapter](#create-chat-adapter)
    - [Get Voice & Video Calling](#get-voice--video-calling)
    - [Get Post Chat Survey Context](#get-post-chat-survey-context)
- [Common Scenarios](#common-scenarios)
    - [Using BotFramework-WebChat](#using-botframework-webchat)
    - [Escalation to Voice & Video](#escalation-to-voice--video)
    - [Pre-Chat Survey](#pre-chat-survey)
    - [Post-Chat Survey](#post-chat-survey)
    - [Reconnect to existing Chat](#reconnect-to-existing-chat)
    - [Authenticated Chat](#authenticated-chat)
    - [Persistent Chat](#persistent-chat)
    - [Chat Reconnect with Authenticated User](#chat-reconnect-with-authenticated-user)
    - [Chat Reconnect with Unauthenticated User](#chat-reconnect-with-unauthenticated-user)
    - [Operating Hours](#operating-hours)
    - [Single Sign-on for Bots](/docs/scenarios/SINGLE_SIGN_ON_FOR_BOTS.md)
- [Sample Apps](https://github.com/microsoft/omnichannel-chat-sdk-samples)
- [Feature Comparisons](#feature-comparisons)
- [Telemetry](#telemetry)
- [Development Guide](docs/DEVELOPMENT_GUIDE.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md)

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
| Escalation to Voice & Video | ✔ | ✔ | Only supported on Web |
| Co-browse | ✔ | 3rd party add-on | Only supported on Web |
| Screen Sharing | ✔ | 3rd party add-on | Only supported on Web |
| Authenticated Chat | ✔ | ✔ |
| Pre-chat Survey | ✔ | ✔ |
| Post-chat Survey | ✔ | ✔ |
| Download Transcript | ✔ | ✔ |
| Email Transcript | ✔ | ✔ |
| Data Masking | ✔ | ✔ |
| File Attachments | ✔ | ✔ |
| Custom Context | ✔ | ✔ |
| Proactive Chat | ✔ | BYOI **\*** |
| Persistent Chat | ✔ | ✔ |
| Chat Reconnect | ✔ | ✔ |
| Operating Hours | ✔ | ✔ |
| Get Agent Availability | ✔ | ✔ |
| Queue Position | ✔ | ✔ | No SDK method. Handled as *system message* |
| Average Wait Time | ✔ | ✔ | No SDK method. Handled as *system message* |

**\*** BYOI: Bring Your Own Implementation

## Releases

New releases are published on a regular basis to ensure the product quality.

| Version | Docs | Release Date | End of Support | Deprecated |
| -- | -- | -- | -- | -- |
| 1.9.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.9.0) | May 22nd 2024 | May 22nd 2025 | |
| 1.8.3 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.8.3) | May 15th 2024 | Mar 15th 2025 | |
| 1.8.2 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.8.2) | May 7th 2024 | May 7th 2025 | |
| 1.8.1 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.8.1) | Apr 24th 2024 | Apr 24th 2025 | |
| 1.8.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.8.0) | Mar 29th 2024 | Mar 29th 2025 | |
| 1.7.2 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.7.2) | Mar 20th 2024 | Mar 20th 2025 | |
| 1.7.1 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.7.1) | Mar 19th 2024 | Mar 19th 2025 | |
| 1.7.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.7.0) | Mar 7th 2024 | Mar 7th 2025 | |
| 1.6.3 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.6.3) | Jan 30th 2024 | Jan 30th 2025 | |
| 1.6.2 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.6.2) | Dec 12th 2023 | Dec 12th 2024 | |
| 1.6.1 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.6.1) | Dec 7th 2023 | Dec 7th 2024 | |
| 1.6.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.6.0) | Dec 4th 2023 | Dec 4th 2024 | |
| 1.5.7 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.5.7) | Nov 20th 2023 | Nov 20th 2024 | |
| 1.5.6 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.5.6) | Nov 11th 2023 | Nov 11th 2024 | |
| 1.5.5 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.5.5) | Oct 31st 2023 | Oct 31st 2024 | |
| 1.5.4 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.5.4) | Oct 20th 2023 | Oct 20th 2024 | |
| 1.5.3 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.5.3) | Oct 18th 2023 | Oct 18th 2024 | |
| 1.5.2 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.5.2) | Oct 14th 2023 | Oct 14th 2024 | |
| 1.5.1 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.5.1) | Oct 10th 2023 | Oct 10th 2024 | |
| 1.5.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.5.0) | Sep 29th 2023 | Sep 29th 2024 | |
| 1.4.7 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.4.7) | Sep 13th 2023 | Sep 13th 2024 | |
| 1.4.6 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.4.6) | Aug 15th 2023 | Aug 15th 2024 | |
| 1.4.5 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.4.5) | Aug 2nd 2023 | Aug 2nd 2024 | |
| 1.4.4 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.4.4) | Jul 19th 2023 | Jul 19th 2024 | |
| 1.4.3 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.4.3) | Jun 15th 2023 | Jun 15th 2024 | |
| 1.4.2 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.4.2) | May 19th 2023 | May 19th 2024 | ✔️ |
| 1.4.1 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.4.1) | May 5th 2023 | May 5th 2024 | ✔️ |
| 1.4.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.4.0) | May 2nd 2023 | May 2nd 2024 | ✔️ |
| 1.3.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.3.0) | Apr 5th 2023 | Apr 5th 2024 | ✔️ |
| 1.2.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.2.0) | Nov 11th 2022 | Nov 11th 2023 | ✔️ |
| 1.1.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.1.0) | Apr 15th 2021 | Apr 15th 2022 | ✔️ |
| 1.0.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.0.0) | Oct 8th 2021 | Oct 8th 2022 | ✔️ |
| 0.3.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v0.3.0) | Sep 3rd 2021 | Sep 3rd 2022 | ✔️ |
| 0.2.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v0.2.0) | Apr 30th 2021 | Apr 30th 2022 | ✔️ |
| 0.1.0 | [Release Notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v0.1.0) | Oct 26th 2020 | Oct 26th 2021 | ✔️ |

## Installation

```
npm install @microsoft/omnichannel-chat-sdk --save
```

## Installation on React Native

The following steps will be required to run Omnichannel Chat SDK on React Native:

1. Install `node-libs-react-native`
    ```
    npm install node-libs-react-native --save-dev
    ```

1. Install `react-native-randomBytes`
    ```
    npm install react-native-randombytes --save-dev
    ```

1. Install `react-native-get-random-values`
    ```
    npm install react-native-get-random-values --save-dev
    ```

1. Install `react-native-url-polyfill`
    ```
    npm install react-native-url-polyfill --save-dev
    ```

1. Install `@azure/core-asynciterator-polyfill`
    ```
    npm install @azure/core-asynciterator-polyfill --save-dev
    ```

1. Update *metro.config.js* to use React Native compatible Node Core modules
    ```ts
    module.exports = {
        // ...
        resolver: {
            extraNodeModules: {
                ...require('node-libs-react-native'),
                net: require.resolve('node-libs-react-native/mock/net'),
                tls: require.resolve('node-libs-react-native/mock/tls')
            }
        }
    };
    ```

1. Add following *import* on top of your entry point file
    ```ts
    import 'node-libs-react-native/globals';
    import 'react-native-get-random-values';
    import 'react-native-url-polyfill/auto';
    import '@azure/core-asynciterator-polyfill';
    ```

## SDK Methods

### Initialization

It handles the initialization of ChatSDK internal data.

```ts
import OmnichannelChatSDK from '@microsoft/omnichannel-chat-sdk';

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

const optionalParams = {
    getLiveChatConfigOptionalParams: {
        sendCacheHeaders: false // Whether to send Cache-Control HTTP header to GetChatConfig call
    }
};

await chatSDK.initialize(optionalParams);
```

### Start Chat

It starts an Omnichannel conversation.

```ts
const customContext = {
    'contextKey1': {'value': 'contextValue1', 'isDisplayable': true},
    'contextKey2': {'value': 12.34, 'isDisplayable': false},
    'contextKey3': {'value': true}
};

const optionalParams = {
    preChatResponse: '', // PreChatSurvey response
    liveChatContext: {}, // EXISTING chat context data
    customContext, // Custom Context
    sendDefaultInitContext: true // Send default init context ⚠️ Web only
};

await chatSDK.startChat(optionalParams);
```

### End Chat

It ends the current Omnichannel conversation.

```ts
await chatSDK.endChat();
```

### Get Pre-Chat Survey

It gets the Pre-Chat Survey from Live Chat Config. Pre-Chat Survey is in Adaptive Card format.

`Option 1`
```ts
const preChatSurvey = await getPreChatSurvey(); // Adaptive Cards JSON payload data
```
`Option 2`
```ts
const parseToJSON = false;
const preChatSurvey = await getPreChatSurvey(parseToJSON); // Adaptive Cards payload data as string
```

### Get Live Chat Config

It fetches the Live Chat Config.

```ts
const liveChatConfig = await chatSDK.getLiveChatConfig();
```

### Get Current Live Chat Context

It gets the current live chat context information to be used to reconnect to the same conversation.

```ts
const liveChatContext = await chatSDK.getCurrentLiveChatContext();
```

### Get Data Masking Rules

It gets the active data masking rules from Live Chat Config.

```ts
const dataMaskingRules = await chatSDK.getDataMaskingRules();
```

### Get Chat Reconnect Context

It gets the current reconnectable chat context information to connect to a previous existing chat session.

`Reconnection options` is required. See [documentation](https://docs.microsoft.com/en-us/dynamics365/customer-service/configure-reconnect-chat?tabs=customerserviceadmincenter#enable-reconnection-to-a-previous-chat-session)

```ts
const optionalParams = {
    reconnectId: '', // reconnect Id
};

const chatReconnectContext = await chatSDK.getChatReconnectContext(optionalParams);
```

### Get Conversation Details

It gets the details of the current conversation such as its state & when the agent joined the conversation.

```ts
const optionalParams = {
    liveChatContext: {}, // EXISTING chat context data
};

const conversationDetails = await chatSDK.getConversationDetails(optionalParams);
```

### Get chat Token

It gets the chat token used to initiates a chat with Omnichannel messaging client.

```ts
const chatToken = await chatSDK.getChatToken();
```

### Get Calling Token

It gets the calling token used to initiates a Voice & Video Call.

```ts
const callingToken = await chatSDK.getCallingToken();
```

### Get Messages

It gets all the messages of the current conversation.

```ts
const messages = await chatSDK.getMessages();
```

### Send Messages

It sends a message to Omnichannel.

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

### On New Message

It subscribes to new incoming messages of the current conversation such as system messages, client messages, agent messages, adaptive cards and attachments.

```ts
const optionalParams = {
    rehydrate: true, // Rehydrate all previous messages of existing conversation (false by default)
}

chatSDK.onNewMessage((message) => {
    console.log(`[NewMessage] ${message.content}`);
    console.log(message);
}, optionalParams);
```
### On Typing Event

It subscribes to agent typing event.

```ts
chatSDK.onTypingEvent(() => {
    console.log("Agent is typing...");
})
```

### On Agent End Session

It subscribes to agent ending the session of the conversation.

```ts
chatSDK.onAgentEndSession(() => {
    console.log("Session ended!");
});
```

### Send Typing Event

It sends a customer typing event.

```ts
await chatSDK.sendTypingEvent();
```

### Email Live Chat Transcript

It sends an email of the live chat transcript.

```ts
const body = {
    emailAddress: 'contoso@microsoft.com',
    attachmentMessage: 'Attachment Message'
};
await chatSDK.emailLiveChatTranscript(body);
```

### Get Live Chat Transcript

It fetches the current conversation transcript data in JSON.

```ts
const optionalParams = {
    liveChatContext: {}, // EXISTING chat context data
};

await chatSDK.getLiveChatTranscript(optionalParams);
```

### Upload File Attachment

It sends a file attachment to the current conversation.

```ts
const fileInfo = {
    name: '',
    type: '',
    size: '',
    data: ''
};
await chatSDK.uploadFileAttachment(fileInfo);
```

### Download File Attachment

It downloads the file attachment of the incoming message as a Blob response.

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

### Create Chat Adapter

> :warning: Currently supported on web only

It creates a chat adapter to use with [BotFramework-WebChat](https://github.com/microsoft/BotFramework-WebChat).

```ts
const chatAdapter = await chatSDK.createChatAdapter();
```

### Get Voice & Video Calling

> :warning: Currently supported on web only

> :warning: Please ensure voice & video call is stopped before leveraging endChat SDK method

It fetches the SDK for Escalation to Voice & Video.

```ts
try {
    const VoiceVideoCallingSDK = await chatSDK.getVoiceVideoCalling();
    console.log("VoiceVideoCalling loaded");
} catch (e) {
    console.log(`Failed to load VoiceVideoCalling: ${e}`);

    if (e.message === 'UnsupportedPlatform') {
        // Voice Video Calling feature is not supported on this platform
    }

    if (e.message === 'FeatureDisabled') {
        // Voice Video Calling feature is disabled on admin side
    }
}
```
### Get Post Chat Survey Context

It gets the participant type that should be used for the survey and both the default and bot survey details.

```ts
const postChatSurveyContext = await chatSDK.getPostChatSurveyContext();
```

### Get Agent Availability

It gets information on whether a queue is available, and whether there are agents available in that queue, as well as queue position and average wait time. This call only supports authenticated chat.

```ts
const agentAvailability = await chatSDK.getAgentAvailability();
```

## Common Scenarios

### Pre-Chat Survey

> See https://docs.microsoft.com/en-us/dynamics365/customer-service/configure-pre-chat-survey?tabs=customerserviceadmincenter on how to set up pre-conversation surveys

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

### Post-Chat Survey

> See https://docs.microsoft.com/en-us/dynamics365/customer-service/configure-post-conversation-survey?tabs=customerserviceadmincenter on how to set up post-conversation surveys

> ❗ `chatSDK.getPostChatSurveyContext()` needs to be called before `chatSDK.endChat()` is called

```ts
// 1. Start chat
await chatSDK.startChat();

// 2. Save post chat survey context before ending chat
try {
    const context = await chatSDK.getPostChatSurveyContext();
    if (context.participantJoined) { // participantJoined will be true if an agent has joined the conversation, or a bot has joined the conversation and the bot survey flag has been turned on on the admin side.
        // formsProLocale is the default language you have set on the CustomerVoice portal. You can override this url parameter with any locale that CustomerVoice supports.
        // If "&lang=" is not set on the url, the locale will be English.
        const link = context.participantType === "Bot" ? context.botSurveyInviteLink : context.surveyInviteLink;
        const locale = context.participantType === "Bot" ? context.botFormsProLocale : context.formsProLocale;
        const linkToSend = link + "&lang=" + locale;
        // This link is accessible and will redirect to the survey page. Use it as you see fit.
    }
} catch (ex) {
    // If the post chat should not be shown by any reason (e.g. post chat is not enabled), promise will be rejected.
}

// 3. End chat
await chatSDK.endChat();

// 4. Display Post Chat
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

> See https://docs.microsoft.com/en-us/dynamics365/customer-service/create-chat-auth-settings?tabs=customerserviceadmincenter#create-a-chat-authentication-setting-record on how to set up an authenticated chat

```ts
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

### Persistent Chat

> See https://docs.microsoft.com/en-us/dynamics365/customer-service/persistent-chat on how to set up persistent chat

```ts
const chatSDKConfig = {
    persistentChat: {
        disable: false,
        tokenUpdateTime: 21600000
    },
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

// from this point, this acts like a persistent chat
```
### Chat Reconnect with Authenticated User

> See https://docs.microsoft.com/en-us/dynamics365/customer-service/configure-reconnect-chat?tabs=customerserviceadmincenter#enable-reconnection-to-a-previous-chat-session on how to set up chat reconnect

```ts
const chatSDKConfig = {
    chatReconnect: {
        disable: false,
    },
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

...

const chatReconnectContext = await chatSDK.getChatReconnectContext();

if (chatReconnectContext.reconnectId) {
    // Add UX with options to reconnect to previous existing chat or start new chat
}

// Reconnect chat option
const optionalParams = {};
optionalParams.reconnectId = chatReconnectContext.reconnectId;
chatSDK.startChat(optionalParams);

// Start new chat option
chatSDK.startChat();
```

### Chat Reconnect with Unauthenticated User

> See https://docs.microsoft.com/en-us/dynamics365/customer-service/configure-reconnect-chat?tabs=customerserviceadmincenter#enable-reconnection-to-a-previous-chat-session on how to set up chat reconnect

```ts
const chatSDKConfig = {
    chatReconnect: {
        disable: false,
    },
}

const chatSDK = new OmnichannelChatSDK.OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
await chatSDK.initialize();

....

const optionalParams: any = {};

// Retrieve reconnect id from the URL
const urlParams = new URLSearchParams(window.location.search);
const reconnectId = urlParams.get('oc.reconnectid');

const params = {
    reconnectId
};

// Validate reconnect id
const chatReconnectContext = await chatSDK.getChatReconnectContext(params);

// If the reconnect id is invalid or expired, redirect URL if there is any URL set in the configuration
if (chatReconnectContext.redirectURL) {
    window.location.replace(chatReconnectContext.redirectURL);
}

// Valid reconnect id, reconnect to previous chat
if (chatReconnectContext.reconnectId) {
    await chatSDK.startChat({
        reconnectId: chatReconnectContext.reconnectId
    });
} else {  // Reconnect id from URL is not valid, start new chat session
    await chatSDK.startChat();
}
```

### Operating Hours

> See https://docs.microsoft.com/en-us/dynamics365/customer-service/create-operating-hours?tabs=customerserviceadmincenter on how to set up operating hours

```ts
const chatConfig = await chatSDK.getLiveChatConfig();
const {LiveWSAndLiveChatEngJoin: liveWSAndLiveChatEngJoin} = liveChatConfig;
const {OutOfOperatingHours: outOfOperatingHours} = liveWSAndLiveChatEngJoin;

if (outOfOperatingHours === "True") {
    // Handles UX on Out of Operating Hours
} else {
    await chatSDK.startChat();
    // Renders Custom Chat Widget
}
```

### Using [BotFramework-WebChat](https://github.com/microsoft/BotFramework-WebChat)
> :warning: Currently supported on web only

Minimum Requirement Checklist
1. [ ] Initialize ChatSDK
1. [ ] Start new conversation
1. [ ] Create Chat Adapter
1. [ ] Create WebChat store with default middlewares
    1. [ ] Send Default Channel Message Tags using Store Middleware (See [here](/docs//DEVELOPMENT_GUIDE.md#send-default-channel-message-tags-using-store-middleware)) ❗ Required
1. [ ] Render WebChat

```ts
import OmnichannelChatSDK from '@microsoft/omnichannel-chat-sdk';
import ReactWebChat, {createStore} from 'botframework-webchat';

// 1. ChatSDK Initialization
const chatSDK = new OmnichannelChatSDK.OmnichannelChatSDK(omnichannelConfig);
await chatSDK.initialize();

// 2. Start new conversation
await chatSDK.startChat();

// 3. Create chat adapter
const chatAdapter = await chatSDK.createChatAdapter();

// 4. Create WebChat store with middlewares
const store = createStore(
    {}, // initial state
    sendDefaultMessagingTagsMiddleware // ❗ Required
);

// 5. Render WebChat
<ReactWebChat
    store={store}
    userID="teamsvisitor"
    directLine={chatAdapter}
    sendTypingIndicator={true}
/>
```

### Escalation to Voice & Video
> :warning: Currently supported on web only

> See https://docs.microsoft.com/en-us/dynamics365/customer-service/call-options-visual-engagement on how to set up calling options

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

    if (e.message === 'UnsupportedPlatform') {
        // Voice Video Calling feature is not supported on this platform
    }

    if (e.message === 'FeatureDisabled') {
        // Voice Video Calling feature is disabled on admin side
    }
}

await chatSDK.startChat();

const chatToken: any = await chatSDK.getChatToken();

// Initialize only if VoiceVideoCallingSDK is defined
if (VoiceVideoCallingSDK) {
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
}
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
