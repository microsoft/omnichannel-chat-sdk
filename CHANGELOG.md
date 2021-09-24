# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- Uptake [@microsoft/ocsdk@0.3.0](https://www.npmjs.com/package/@microsoft/ocsdk/v/0.3.0)
- Use `lockfileVersion: 2` in `package-lock.json` via npm v7

### Fixed
- `onNewMessage` with `rehydrate` flag set to `true` crashing when `getMessages` returns `undefined`
- Fix `AriaTelemetry` unable to read property `logEvent` of undefined on `React Native`

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
- Escalation to Voice & View support (Web Only)
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