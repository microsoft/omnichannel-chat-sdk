# Migrate to Omnichannel Chat SDK 2.0

## Scope

This guide applies to applications that upgrade from Chat SDK 1.x to `@microsoft/omnichannel-chat-sdk@2.0.0`.

## Runtime Requirement

Version `2.0.0` requires Node.js `>=22.12.0`. Update local development, build agents, test agents, and production Node.js hosts.

The package also uses these official dependencies:

- `@microsoft/ocsdk@0.6.0`
- `@microsoft/omnichannel-amsclient@0.2.0`

## Install the Official Version

The npm `latest` dist-tag can point to an automatic `main` prerelease. Pin the official version in production.

```bash
npm install @microsoft/omnichannel-chat-sdk@2.0.0 --save-exact
```

Commit the regenerated lockfile. Make sure that it resolves Chat SDK `2.0.0`, OC SDK `0.6.0`, and AMS client `0.2.0`.

## Upgrade Procedure

1. Update all build and runtime environments to Node.js `22.12.0` or later.
2. Install the exact Chat SDK version.
3. Regenerate and commit the application lockfile.
4. Run the application build, unit tests, and integration tests.
5. Test chat start, message send, message receive, attachments, reconnect, and authenticated chat.
6. Deploy to a test environment before production.
7. Monitor SDK error telemetry after deployment.

## Progressive Bot-Message Streaming

Streaming is opt-in. Existing applications continue to receive final messages through `onNewMessage`.

Set `supportsLcwStreaming: true` only when the application can render progressive updates. Register `onStreamingMessage` after `startChat` completes.

See [On Streaming Message](../README.md#on-streaming-message) for the API contract and example.

## Read State APIs

Version `2.0.0` adds these APIs:

- `sendReadReceipt(messageId)` marks a message and earlier messages as read.
- `getUnreadMessageCount()` returns unread-message data for an authenticated user. An active chat session is not required.

Authenticated read receipts use Messaging Runtime. Unauthenticated read receipts use ACS.

See [Send Read Receipt](../README.md#send-read-receipt) and [Get Unread Message Count](../README.md#get-unread-message-count).

## Release Integrity

The `v2.0.0` GitHub Release contains the same `.tgz` file that the workflow publishes to npm.

The npm package includes a provenance statement from GitHub Actions. Use the exact version and committed lockfile for repeatable installations.

## Rollback

If the application cannot use Node.js 22, restore the last approved 1.x version and its lockfile.

Do not change the npm `latest` dist-tag or the Git tag as an application rollback method.
