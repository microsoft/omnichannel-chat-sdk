# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed

- Fix conversation cleanup when MessagingClientConversationJoinFailure occurs to prevent orphaned conversations

### Changed

- Clean up `ChatSDK.sendTypingEvent()` unused code path
- Add `HttpRequestResponseTime` property to OCSDKLogData and OCSDKContract Interfaces for HTTP request duration tracking
- Uptake [@microsoft/ocsdk@0.5.18](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.18)
- Update `regionBasedSupportedUrls` to include GCC

## [1.11.2] - 2025-06-24

### Changed

- Enable Region Based Attachment Client Support
- Uptake [@microsoft/botframework-webchat-adapter-azure-communication-chat@0.0.1-beta.4](https://www.npmjs.com/package/@microsoft/botframework-webchat-adapter-azure-communication-chat/v/0.0.1-beta.4)
- Uptake [@microsoft/ocsdk@0.5.17](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.17)

## [1.11.1] - 2025-06-05

### Changed

- Uptake [@microsoft/omnichannel-amsclient@0.1.10](https://www.npmjs.com/package/@microsoft/omnichannel-amsclient/v/0.1.10)
- Attachment client performance load improvements on whitelisted urls & region based url

## [1.11.0] - 2025-05-27

### Fixed

- added failure exception details to initialize parallel
- Uptake new oc sdk with changes  to requestId
- Added Finally to solve cleanup issues while closing chat
- Update new OC sdk for correlation id implementation

### Added

- Mapped id to OriginalMessage ID for backward compatibility once the bridging is removed
- Added additions details to endChat ExceptionDetails
- Splited sessionInit promize to its own to avoid ACS initialize

### Changed

- Uptake [@microsoft/omnichannel-amsclient@0.1.9](https://www.npmjs.com/package/@microsoft/omnichannel-amsclient/v/0.1.9)

## [1.10.19] - 2025-05-02

### Added

- Turned on new conversation api by default
- Added additional details from underlying component for sendMessage failure
- Added "role" attribute for received messages

## [1.10.18] 2025-04-09

### Added

- Uptake [@microsoft/ocsdk@0.5.14](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.14)
- Support for multibot

## [1.10.17] 2025-04-07

### Added

- Load AMS based on config.

### Fixed

- Fix for methods receiving exceptionDetails , but not logging it in telemetry
- Fix to prevent double load of AMS
- Fix to prevent startchat to finish before AMS client loads. (latency detected, future work to be part of AMS client enhancements)

## [1.10.16] - 2025-03-27

### Added

- Added exception details for telemetry for SendMessage
- Expose `OriginalMessageId` to `ChatSDK.onNewMessage()` to handle message ordering
- Update `ChatSDK.sendMessage()` to return `OmnichannelMessage`

### Changed

- Uptake [@microsoft/ocsdk@0.5.13](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.13)

## [1.10.15] - 2025-03-11

### Security

- Uptake [@microsoft/ocsdk@0.5.12](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.12)
- Uptake [@microsoft/omnichannel-ic3core@0.1.5](https://www.npmjs.com/package/@microsoft/omnichannel-ic3core/v/0.1.5)

### Added

- Added support for createConversation api which eleminates need for 2 api's when starting a conversation.
- Adding telemetry around receive message mechanisms, Rest, Websocket and Polling

### Fixed

- Additional types for stored timer Id.

## [1.10.14] - 2025-03-06

### Changed

- Updated getLivechatTranscript livechatcontect check for persistent chat

### Added

- Add check for getConversation details before call onAgentEndSession call back since participant removed is not reliable

## [1.10.13] - 2025-03-04

### Added

- Add `disablePolling` flag for `onNewMessage` to stop polling

### Changed

- Updake [@microsoft/botframework-webchat-adapter-azure-communication-chat@0.0.1-beta.2](https://www.npmjs.com/package/@microsoft/botframework-webchat-adapter-azure-communication-chat/v/0.0.1-beta.2)

### Fixed

- Update `ACSAdapterVersion` to reflect the correct version

## [1.10.12] - 2025-02-21

### Added

- Enabling LongPolling to continue after websocket is set, to prevent messages lost. Polling will stop when conversation ends.
- Added stopPolling method to stop the long polling when ending the chat.

## [1.10.11] - 2025-02-20

### Added

- Reduce polling interval with exponential backoff

## [1.10.10] - 2025-02-18

### Changed

- Uptake [@microsoft/omnichannel-amsclient@0.1.8](https://www.npmjs.com/package/@microsoft/omnichannel-amsclient/v/0.1.8)

## [1.10.9] - 2025-02-06

### Changed

- migrate [acs_webchat-chat-adapter@0.0.35-beta.30.1](https://www.npmjs.com/package/acs_webchat-chat-adapter/v/0.0.35-beta.30.1) to [@microsoft/botframework-webchat-adapter-azure-communication-chat@0.0.1-beta.1](https://www.npmjs.com/package/@microsoft/botframework-webchat-adapter-azure-communication-chat/v/0.0.1-beta.1)

## [1.10.8] - 2025-02-05

### Fixed

- Fix `ChatSDK.onNewMessages()` calling `createOmnichannelMessages()` twice during polling

### Changed

- Uptake [@microsoft/omnichannel-amsclient@0.1.7](https://www.npmjs.com/package/@microsoft/omnichannel-amsclient/v/0.1.7)

## [1.10.7] - 2025-01-30

### Added

- Added push notification properties to session init optional params

## [1.10.6] - 2025-01-28

### Added

- Fix for ACS client preventing new messages from being populated in the new message callback.
- Updated chat adapter dependecy ,also created new logic for PI data scrubbing

## [1.10.5] - 2025-16-01

### Added

- Update of missing telemetry events for exposed API's
- Adding exception details for telemetry for Email Transcript
- Adding exception details for telemetry for GetMessages / SendMessages
- Adding validation to exposed API's to require validations before to be executed.

## Changed

- Uptake [@microsoft/ocsdk@0.5.10](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.10)

## [1.10.4] - 2024-12-19

### Fixed

- types not included in external exports.

## [1.10.3] - 2024-12-19

### Fixed

- Missing type definitions for public API's responses, removing any as response type
- Defining explicit response types for void functions.
- Defining a type for MaskingRules
- Restructure for ChatConfig initialization and build of entities around it.

## [1.10.2] - 2024-12-06

### Added

- Adding optional params for end chat to allow decide internally when to call close session backend.

### Fixed

- Added console log when the given widget id is no longer found in the system

### Changed

- uptake [azure/communication-chat@1.5.0](https://www.npmjs.com/package/@azure/communication-chat/v/1.5.0)
- uptake [azure/communication-common@2.3.1](https://www.npmjs.com/package/@azure/communication-common/v/2.3.1)
- uptake [acs_webchat-chat-adapter@0.0.35-beta.30](https://www.npmjs.com/package/acs_webchat-chat-adapter/v/0.0.35-beta.30)
- Uptake [@microsoft/ocsdk@0.5.9](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.9)

## [1.10.1] - 2024-11-11

### Fixed

- Add `requestId` to `OCClient.getReconnectableChats()` parameters
- Load ACS Chat adapter as npm dependency, instead of download it from unpkg host.

## [1.10.0] - 2024-10-31

### Changed

- Uptake [@microsoft/ocsdk@0.5.8](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.8)

## [1.9.10] - 2024-10-25

### Changed

- Uptake [@microsoft/ocsdk@0.5.7](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.7)

## [1.9.9] - 2024-10-21

### Fixed

- Fix `CoreServices` orgUrl conversion for `crm9` orgs

## [1.9.8] - 2024-10-18

### Changed

- Updating dev libraries and unit tests

## [1.9.7] - 2024-10-16

### Changed

- Added to new versioned path to callingbundle.js

## [1.9.6] - 2024-09-19

### Added

- Adding mechanism to initialize SDK using parallel threads for a faster load, still supporting sequential load

### Changed

- core service url regex to include crmtest
- Uptake [@microsoft/ocsdk@0.5.6](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.6)

## [1.9.5] - 2024-08-30

### Security

- Uptake [@microsoft/ocsdk@0.5.5](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.5)
- Uptake [@microsoft/omnichannel-ic3core@0.1.4](https://www.npmjs.com/package/@microsoft/omnichannel-ic3core/v/0.1.4)

## [1.9.3] - 2024-07-12

### Added

- Add `crm9` as part of `CoreServicesGeoNamesMapping`

### Changed

- Log `error` object on failures on sending message and send typing
- Update `retrieveCollectorUri()` to detect `GCCDomainPatterns` to return `GCCCollectorUri`

## [1.9.2] - 2024-06-25

### Fixed

- Remove internal overrides of the original message contracts to add `content` property with `Object.assign()` causing side effects on ChatAdapter

## [1.9.1] - 2024-06-20

### Changed

- Uptake [@microsoft/ocsdk@0.5.3](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.5.3)

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
