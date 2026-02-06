# Fix: `onAgentEndSession` callback firing during customer-initiated `endChat()`

## Problem

The `onAgentEndSession` callback was incorrectly triggered when the **customer** ended the conversation via `chatSDK.endChat()`. According to the [documented behavior](https://github.com/microsoft/omnichannel-chat-sdk?tab=readme-ov-file#on-agent-end-session), this callback should only fire when the **agent** ends the session from the Omnichannel panel.

### Root Cause

`onAgentEndSession` relies on the ACS `participantsRemoved` WebSocket event. When it fires, the handler calls `getConversationDetails()` and triggers the callback if the conversation state is `WrapUp` or `Closed`.

The problem is that `endChat()` performs two steps in sequence:

1. `closeChat()` calls `OCClient.sessionClose()`, which transitions the conversation to `Closed` on the backend
2. `conversation.disconnect()` tears down the ACS connection, which fires a `participantsRemoved` event

By the time the `participantsRemoved` handler checks the conversation state, it is already `Closed` (because `sessionClose()` already ran), so the check passes and the callback fires incorrectly.

```
Customer calls endChat()
  -> closeChat() -> sessionClose() -> backend state = Closed
  -> conversation.disconnect()
     -> ACS fires participantsRemoved
        -> handler calls getConversationDetails()
        -> state == Closed -> callback fires (INCORRECT)
```

The `getConversationDetails()` check cannot distinguish **who** initiated the close — it only sees the resulting state.

### Impact

- **GitHub issue**: [microsoft/omnichannel-chat-sdk#521](https://github.com/microsoft/omnichannel-chat-sdk/issues/521)
- SDK version affected: v1.11.6+
- Customer-built widgets using `onAgentEndSession` receive false positives when the customer closes the chat

## Solution

Added a `private isEndingChat` boolean flag to `OmnichannelChatSDK` that acts as a guard in the `onAgentEndSession` event handler.

### Changes in `src/OmnichannelChatSDK.ts`

**1. Flag declaration (class property)**

```typescript
private isEndingChat = false;
```

**2. Flag set in `internalEndChat()` before any cleanup runs**

```typescript
private async internalEndChat(endChatOptionalParams: EndChatOptionalParams = {}): Promise<void> {
    // ...
    this.isEndingChat = true;

    try {
        try {
            await this.closeChat(endChatOptionalParams);
        } finally {
            this.conversation?.disconnect();
            // ... cleanup
        }
        // ...
    } catch (error) {
        // ... error handling
    } finally {
        this.isEndingChat = false;
    }
}
```

**3. Guard check in `onAgentEndSession` handler**

```typescript
(this.conversation as ACSConversation).registerOnThreadUpdate(async (event: ParticipantsRemovedEvent) => {
    if (this.isEndingChat) {
        return;
    }
    const liveWorkItemDetails = await this.getConversationDetails();
    if (Object.keys(liveWorkItemDetails).length === 0
        || liveWorkItemDetails.state == LiveWorkItemState.WrapUp
        || liveWorkItemDetails.state == LiveWorkItemState.Closed) {
        onAgentEndSessionCallback(event);
        this.stopPolling();
    }
});
```

### How It Works

| Scenario | `isEndingChat` | Callback fires? |
|---|---|---|
| Customer calls `endChat()` | `true` (set before `closeChat`/`disconnect`) | No — handler returns early |
| Agent closes from OC panel | `false` (`endChat` not called) | Yes — normal flow proceeds |
| New chat after previous `endChat()` | `false` (reset in `finally`) | Yes — flag does not leak |

### Why `finally`?

The flag is reset in the outermost `finally` block to guarantee cleanup even if `closeChat()` or `disconnect()` throws. This prevents the flag from becoming stuck and permanently suppressing the callback in subsequent sessions.

## Known Limitation

This fix addresses **Bug 1** (false positive during customer close). There is a separate known issue (**Bug 2**) where `onAgentEndSession` does not always fire when the agent closes the conversation. This is caused by the ACS `participantsRemoved` event being unreliable for agent-initiated closes — the SDK's own changelog acknowledges this:

> "Add check for getConversation details before call onAgentEndSession call back since participant removed is not reliable"

The most reliable signal for agent-initiated closes remains the system message with the `agentendconversation` tag, which the widget layer intercepts via `conversationEndMiddleware`.

## Test Plan

- [ ] Start a chat, customer closes via `endChat()` — verify `onAgentEndSession` does **not** fire
- [ ] Start a chat, agent closes from OC panel — verify `onAgentEndSession` fires (when ACS delivers the event)
- [ ] Start a chat, customer closes, start a new chat — verify `onAgentEndSession` still works for the new session
- [ ] Verify existing unit tests pass (`OmnichannelChatSDK.spec.ts`, `OmnichannelChatSDKParallel.spec.ts`)
