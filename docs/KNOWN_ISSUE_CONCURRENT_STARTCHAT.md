# Known issue: concurrent `startChat()` calls in versions before 1.11.6

> **Fixed in Chat SDK `1.11.6`, released on August 8, 2025.** The fix ([pull request #506](https://github.com/microsoft/omnichannel-chat-sdk/pull/506)) was merged on August 5, 2025. If your application uses a Chat SDK version that is earlier than `1.11.6`, upgrade now.

## Summary

In Chat SDK versions before `1.11.6`, `startChat()` has no lock. If an application calls `startChat()` again before the previous call is complete, each call starts a separate conversation on the service.

Only one of these conversations goes to the queue and to an agent. The customer can stay on a different conversation. In that case, the customer sends messages, but no agent ever receives them.

Version `1.11.6`, released on August 8, 2025, corrects this error. Upgrade to `1.11.6` or later. We recommend the latest release.

## Affected versions

| Version | Release date | Status |
| -- | -- | -- |
| Earlier than `1.11.6` | Before August 8, 2025 | Affected. Concurrent `startChat()` calls are not serialized. |
| `1.11.6` and later, including `2.0.0` | August 8, 2025 and later (`2.0.0`: August 13, 2026) | Corrected. `startChat()` and `endChat()` run one at a time in each `OmnichannelChatSDK` instance. |

The fix is in [pull request #506](https://github.com/microsoft/omnichannel-chat-sdk/pull/506) (merged on August 5, 2025) and in the [1.11.6 release notes](https://github.com/microsoft/omnichannel-chat-sdk/releases/tag/v1.11.6) (August 8, 2025).

Versions `1.11.0` to `1.11.4` are also past their end-of-support date. See the [Releases](../README.md#releases) section of the README.

## Symptoms

The application sees one of these symptoms:

- A customer starts a chat, but no agent joins it. The customer sends messages, and the chat stays without an agent until the customer leaves.
- The same chat session creates two or more conversations in Dynamics 365 Contact Center.
- The service reports more conversations than the number of chats that customers started.

The error occurs when two or more `startChat()` calls for the same `OmnichannelChatSDK` instance overlap. Possible causes are:

- A button handler that does not stop a second click while the first `startChat()` call runs.
- A component that calls `startChat()` each time it renders or mounts, for example in React strict mode.
- Application code that calls `startChat()` again on a timer or a retry without a wait for the first call.

## How to correct the error

1. Find the installed version of the Chat SDK. See [Determine the version of ChatSDK installed](TROUBLESHOOTING_GUIDE.md#determine-the-version-of-chatsdk-installed).
2. If the version is earlier than `1.11.6`, upgrade the Chat SDK.

   For the latest 1.x release:

   ```bash
   npm install @microsoft/omnichannel-chat-sdk@1.11.8 --save-exact
   ```

   For version 2.0.0, read the [2.0 migration guide](MIGRATION_2.0.md) first. Version `2.0.0` requires Node.js `>=22.12.0`.

   ```bash
   npm install @microsoft/omnichannel-chat-sdk@2.0.0 --save-exact
   ```

3. Regenerate the lockfile of the application. Then build and test the application.
4. Make sure that the application calls `startChat()` one time for each chat. Wait for the returned promise to resolve or reject before you call `startChat()` again.

## Recommended application pattern

Keep one `OmnichannelChatSDK` instance for each chat. Do not start a second `startChat()` call while one is in progress. This pattern is correct for all versions:

```ts
let startChatPromise: Promise<void> | null = null;

async function startChatOnce(chatSDK: OmnichannelChatSDK, optionalParams = {}): Promise<void> {
    if (!startChatPromise) {
        startChatPromise = chatSDK.startChat(optionalParams).finally(() => {
            startChatPromise = null;
        });
    }
    return startChatPromise;
}
```

If you cannot upgrade immediately, use this pattern as a workaround in versions earlier than `1.11.6`.

## Notes

The lock in `1.11.6` applies to one `OmnichannelChatSDK` instance. It does not prevent two separate instances from starting two chats.
