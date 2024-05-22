# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.9.0] - 2024-05-22

### Added

- Enable the ability to use `CoreServices` orgUrl dynamically at runtime

### Changed

- Uptake [@microsoft/ocsdk@0.5.2](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.2)

## [1.8.3] - 2024-05-15

### Added
- Add `RequestHeaders` telemetry base property to `OCSDKContract`
- Add ability to send `ocUserAgent`

### Changed

- Uptake [@microsoft/ocsdk@0.5.1](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.1)

## [1.8.2] - 2024-05-07

### Fixed

- Fix path for util function uuidv4 that was causing conflicts with pipeline

## [1.8.1] - 2024-04-24

### Added

- Adding new externalRuntimeId, allows to pass external runtimeId to ChatSDK and keep in sync sessions for telemetry.
- Add ability to use `CoreServices` orgUrl dynamically at runtime

## [1.8.0] - 2024-03-29

### Changed

- Updated `OCClient.getSurveyInviteLink` request payload to support Copilot Survey

## [1.7.2] - 2024-03-20

### Fixed

- Remove override block for follow-redirect, which was causing conflicts with ACS libs in LCW

## [1.7.1] - 2024-03-18

### Changed

- Fix ChatSDK.getPostConversationContext() to reject promise when conversation is not found

## [1.7.0] - 2024-03-07

### Added

- Add ability to use `ChatSDK.emailLiveChatTranscript()` to email live chat transcript from `liveChatContext`
- Handling the lifecycle of `sessionId` if it exists

### Changed

- Throw exception when `ChatSDK.startChat()` fails with `ChatSDKConfig.getAuthToken()` failures
- Uptake [@microsoft/ocsdk@0.4.3](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.4.3)

## [1.6.3] - 2024-01-30

### Changed

- Reduce number of `config` calls on loading `Escalation to Voice & Video` library by retrieving the config from runtime cache

## [1.6.2] - 2023-12-12

### Fixed

- Add `supportedImagesMimeTypes` to support `MIME` types `image/heic` & `image/webp` as images

## [1.6.1] - 2023-12-07

### Added

- Exported `ChatSDKErrorName` and `ChatSDKError` for downstream component to use

### Fixed

- Subscribe to `chatMessageEdited` events within `onNewMessage()` for queue position message updates

### Changed

- Uptake [@microsoft/ocsdk@0.4.2](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.4.2)

## [1.6.0] - 2023-12-04

### Changed

- Added "httpResponseStatusCode" attribute in the error object thrown

## [1.5.7] - 2023-11-20

### Changed

- Uptake [@microsoft/omnichannel-amsclient@0.1.6](https://www.npmjs.com/package/@microsoft/omnichannel-amsclient/v/0.1.6)

## [1.5.6] - 2023-11-13

### Added

- Add `RequestPayload`, `RequestPath`, `RequestMethod`, `ResponseStatusCode` telemetry base property to `OCSDKContract`
- Update Jest configuration and tests to support new libraries

### Security

- Uptake [@microsoft/omnichannel-ic3core@0.1.3](https://www.npmjs.com/package/@microsoft/omnichannel-ic3core/v/0.1.3)
- Uptake [@microsoft/ocsdk@0.4.1](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.4.1)

### Changed

- Use `parseLowerCaseString()` on chat config properties to protect text case change

## [1.5.5] - 2023-10-31

### Added

- Add ability to pass custom `ariaCollectorUri`

### Fixed

- Add missing `PACS` URL for `EUDomainNames`
- Fixed an issue where startChat failed due to optionalParam being null

## [1.5.4] - 2023-10-20

### Fixed

- Fix `AriaTelemetry._configuration` not being passed to `AriaTelemetry._logger`

## [1.5.3] - 2023-10-18

### Fixed

- Fix `ChatSDK.emailLiveChatTranscript()` calling `OCClient.emailTranscript()` without waiting until its completion
- Fix `EU` orgs telemetry to flow to the proper `EU` location

## [1.5.2] - 2023-10-14

### Changed

- Disable `tokenRefresher` temporarily

## [1.5.1] - 2023-10-11

### Fixed

- Modify `getChatReconnectContext` to return redirection URL when reconnection ID is not longer Valid for Auth Chats.

## [1.5.0] - 2023-09-29

### Added

- Add `Attachment File Scan` to `ChatSDK.createChatAdapter()`

## [1.4.7] - 2023-09-13

### Changed

- Supporting getAgentAvailable SDK method for unauthenticated chat widget

## [1.4.6] - 2023-08-15

### Fixed

- Fix `tokenRefresher` to update `chatToken` properly on expiry through reinitialization of AMSClient

## [1.4.5] - 2023-08-02

### Changed

- Upgraded ACSAdapter to version beta.20

## [1.4.4] - 2023-07-19

### Added

- Add `tokenRefresher` mechanism to retrieve chat token on expiry

### Changed

- Add `ocSDKConfiguration` to reduce `chatToken` retries to 2
- Uptake [@microsoft/ocsdk@0.4.0](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.4.0)
- Remove redundant call to create of `participantsMapping`

### Fixed

- Set `enableSenderDisplayNameInTypingNotification` to true to include display name on sending typing notification
- Add `async` to `ChatSDK.getLiveChatTranscript()` internal call

## [1.4.3] - 2023-06-15

### Fixed

- [Perf] Make sessionInit, AcsClientInit/Ic3ClientInit and AmsClientInit calls in parallel

## [1.4.2] - 2023-05-19

### Fixed

- Fixed null check on startChat failure

## [1.4.1] - 2023-05-05

### Fixed

- Skipped empty string or null context variables (parity with v1)

## [1.4.0] - 2023-05-02

### Added

- Add ability to use `ChatSDK.getLiveChatTranscript()` to fetch live chat transcript from `liveChatContext`
- Add ability to use `ChatSDK.getConversationDetails()` to fetch conversation details from `liveChatContext`
- Add `AuthContactIdNotFoundFailure` to `ExceptionThrower`

### Changed

- Update `ChatSDKErrors` to include standard ChatSDK errors to be more predictable

## [1.3.0] - 2023-04-05

### Added

- Add ability to use `ChatSDK.createChatAdapter()` for `DirectLine` protocol
- Add `CreateACSAdapter` telemetry event
- Improve `ChatSDK.createChatAdapter()` with retries using exponential backoff & additional details on failures
- Add `GetAgentAvailability` SDK method for auth chat
- Pass `logger` to AMSClient
- Add `portalContactId` in `StartChatOptionalParams` and `GetAgentAvailabilityOptionalParams`
- Added exception on initialization failure
- Upgraded ACSAdapter to version beta.17
- Added `botSurveyInviteLink` and `botFormsProLocale` the `getPostChatSurveyContext()` response

### Fixed

- Fix `ChatAdapterOptionalParams.ACSAdapter.options.egressMiddleware` being used as `ingressMiddleware`
- Fix `ChatSDK.onTypingEvent()` being triggered on current user typing
- Update `ChatSDK.liveChatVersion` to be `V2` by default

### Changed

- Uptake [@microsoft/omnichannel-amsclient@0.1.4](https://www.npmjs.com/package/@microsoft/omnichannel-amsclient/v/0.1.4)
- Uptake [acs_webchat-chat-adapter@0.0.35-beta.17](https://unpkg.com/acs_webchat-chat-adapter@0.0.35-beta.17/dist/chat-adapter.js)
- Uptake [@microsoft/ocsdk@0.3.4](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.3.4)

## [1.2.0] - 2022-11-11

### Added

- Add `sendDefaultInitContext` optional parameter to `ChatSDK.startChat()` to automatically populate `browser`, `device`, `originurl` & `os` as default init context on web
- Add `sendCacheHeaders` as optional paramater to `ChatSDK.initialize()` and `ChatSDK.getLiveChatConfig()`
- Add `validateAuthChatRecord` call on `ChatSDK.startChat()` with `liveChatContext` for all authenticated chat scenarios
- Pass `ChatClient` during `ACSAdapter` initialization
- Pass `multiClient` to `AMSClient` on initialization to support `ChatSDK` multi-client

### Fixed

- Prevent `AMSFileManager.getFileIds()` & `AMSFileManager.getFileMetadata()` to be triggered on all activities with null checks
- Add `LiveChatVersion` check on `ChatSDK.updateChatToken()`
- Use `amsreferences` property instead of `amsReferences` by default
- Fix attachment download to use MIME types instead of file extensions
- Remove `fileMetadata` property on messages not containing any attachment

### Changed

- Uptake [@microsoft/ocsdk@0.3.1](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.3.1)
- Uptake [acs_webchat-chat-adapter@0.0.35-beta.8](https://unpkg.com/acs_webchat-chat-adapter@0.0.35-beta.8/dist/chat-adapter.js)
- Uptake [acs_webchat-chat-adapter@0.0.35-beta.9](https://unpkg.com/acs_webchat-chat-adapter@0.0.35-beta.9/dist/chat-adapter.js)
- Uptake [acs_webchat-chat-adapter@0.0.35-beta.12](https://unpkg.com/acs_webchat-chat-adapter@0.0.35-beta.12/dist/chat-adapter.js)
- Uptake [@microsoft/omnichannel-amsclient@0.1.2](https://www.npmjs.com/package/@microsoft/omnichannel-amsclient/v/0.1.2)
- Uptake [@microsoft/ocsdk@0.3.2](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.3.2)

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

### Fixed

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
