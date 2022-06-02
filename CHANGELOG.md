# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- Add `sendDefaultInitContext` optional parameter to `ChatSDK.startChat()` to automatically populate `browser`, `device`, `originurl` & `os` as default init context on web

## [1.1.0] - 2022-04-15
### Added
- Add `getPostChatSurveyContext` API method
- Add `GetPostChatSurveyContext` telemetry event
- Add `widgetId` & `clientMessageId` as metadata on sending message
- Update `ChatConfig` interface with `LiveChatVersion`, `allowedFileExtensions` & `maxUploadFileSize` properties
- Add ability to automatically detect locale from chat config
- Add `runtimeId` attribute in `OmnichannelChatSDK` & `ChatSDKRuntimeId` field in telemetry
- Add ability to automatically pass locale from chat config on calling `ChatSDK.emailLiveChatTranscript()`
- Bubble up `WidgetUseOutsideOperatingHour` exception
- Add `acs_webchat-chat-adapter` middleware to add default `channelData.tags` & `channelData.metadata`
- Update `ChatConfig` interface with `msdyn_enablemarkdown` property
- Throw exception on `ChatSDK.getVoiceVideoCalling()` if feature is disabled or platform is not supported
- Add `participantType` & `canRenderPostChat` as response of getConversationDetails() API
- Add support for separate bot post chat survey feature
- Pass `logger` to `acs_webchat-chat-adapter`

### Fix
- Add `acs_webchat-chat-adapter` middlewares to format `channelData.tags`
- Skip `session init` call on existing conversation
- Fix `chat reconnect` not ending the conversation on calling `ChatSDK.endChat()`
- Fix on messaging client not sending heartbeat on new conversations subsequent to the first conversation
- Fix `ChatSDK.getConversationDetails()` not passing `authenticatedUserToken`
- Fix `IC3Client.dispose()` called when `IC3Client` is `undefined`

### Changed
- README: added examples on usages of the post chat APIs.
- Uptake [@azure/communication-chat@1.1.1](https://www.npmjs.com/package/@azure/communication-chat/v/1.1.1)
- Uptake [acs_webchat-chat-adapter@0.0.35-beta.2](https://unpkg.com/acs_webchat-chat-adapter@0.0.35-beta.2/dist/chat-adapter.js)
- Update `locale` property in `ChatTranscriptBody` interface to be optional
- Uptake [acs_webchat-chat-adapter@0.0.35-beta.4](https://unpkg.com/acs_webchat-chat-adapter@0.0.35-beta.4/dist/chat-adapter.js)

## [1.0.0] - 2021-10-08
### Added
- Add `GetAuthToken` & `GetPreChatSurvey` telemetry events
- Add `Domain` telemetry base property
- Add `GetCurrentLiveChatContext`, `GetMessages`, `SendMessages`, `OnNewMessage` & `OnTypingEvent` telemetry events
- Live Chat V2 Support
- Add `PlatformDetails` telemetry event

### Changed
- Uptake [@microsoft/ocsdk@0.3.0](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.3.0)
- Uptake [@microsoft/omnichannel-ic3core@0.1.2](https://www.npmjs.com/package/@microsoft/omnichannel-ic3core/v/0.1.2)

### Fixed
- `onNewMessage` with `rehydrate` flag set to `true` crashing when `getMessages` returns `undefined`
- Fix `AriaTelemetry` unable to read property `logEvent` of undefined on `React Native`
- Fix `Escalation to Voice & Video` library not being imported properly

## [0.3.0] - 2021-09-03
### Added
- Persistent Chat Support
- Chat Reconnect Support
- Operating Hours Documentation

### Changed
- Uptake [@microsoft/ocsdk@0.2.0](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.2.0)
- Add `getCallingToken`
- Send `ChannelId-lcw` message tag
- Uptake [IC3Client@2021.08.14.1](https://comms.omnichannelengagementhub.com/release/2021.08.14.1/Scripts/SDK/SDK.min.js)
- Uptake [botframework-webchat-adapter-ic3@0.1.0-master.2dba07b](https://www.npmjs.com/package/botframework-webchat-adapter-ic3/v/0.1.0-master.2dba07b)
- Uptake [jest@27.1.0](https://www.npmjs.com/package/jest/v/27.1.0)
- Update [@types/jest@27.0.1](https://www.npmjs.com/package/@types/jest/v/27.0.1)
- Uptake [ts-jest@27.0.5](https://www.npmjs.com/package/ts-jest/v/27.0.5)

### Fixed
- `msdyn_enablechatreconnect` not being parsed properly
- Fix unable to start multiple conversations with same instance due to chat client being disposed
- Pass logger to adapter

## [0.2.0] - 2021-04-30
### Added
- React Native sample app using Omnichannel Chat SDK with [react-native-gifted-chat](https://github.com/FaridSafi/react-native-gifted-chat)
- Escalation to Voice & Video support (Web Only)
- React sample app using Omnichannel Chat SDK with [BotFramework-WebChat](https://github.com/microsoft/BotFramework-WebChat)
- Expose `sessiontInit`'s `initContext` on `startChat`'s optional paramaters
- Add ability to use custom `ic3Config` & `chatAdapterConfig`
- Add telemetry
- Add `rehydrate` flag for `onNewMessage` to rehydrate all messages of existing conversation
- Add `getConversationDetails`
- Add ability to pass custom `ariaTelemetryKey`

### Changed
- Uptake [@microsoft/ocsdk@0.1.1](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.1.1)
- Uptake [@microsoft/omnichannel-ic3core@0.1.1](https://www.npmjs.com/package/@microsoft/omnichannel-ic3core/v/0.1.1)
- Uptake [jest@26.6.3](https://www.npmjs.com/package/jest/v/26.6.3)
- Uptake [ts-jest@26.5.1](https://www.npmjs.com/package/ts-jest/v/26.5.1)
- Uptake [IC3Client@2021.03.02.1](https://comms.omnichannelengagementhub.com/release/2021.03.02.1/Scripts/SDK/SDK.min.js)
- Uptake [botframework-webchat-adapter-ic3@0.1.0-master.f4dfd7d](https://www.npmjs.com/package/botframework-webchat-adapter-ic3/v/0.1.0-master.f4dfd7d)

### Fixed
- onAgentEndSession triggered on accept voice & video call
- Fix multiple instances of IC3Client initialized
- `uploadFileAttachment` failing on Web

### Security
- Fix eslint errors

## [0.1.0] - 2020-10-26
### Added
- Initial release of Omnichannel Chat SDK v0.1.0