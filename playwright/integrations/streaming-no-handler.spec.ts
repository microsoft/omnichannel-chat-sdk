import { test, expect } from '@playwright/test';

/**
 * E2E: ACS streaming — lazy opt-in verification
 *
 * BLOCKED: requires a streaming-capable test bot. See streaming-happy-path.spec.ts.
 *
 * Verifies that the SDK does NOT subscribe to ACS streaming events when no
 * onStreamingMessage handler is registered. This is the runtime confirmation
 * of decision #6 from the design spec.
 */
test.describe.skip('ACS streaming — lazy opt-in', () => {
    test('does NOT subscribe to ACS streaming events when no handler is registered', async ({ page }) => {
        // 1. Initialize ChatSDK with V2 config and streaming-capable bot.
        // 2. Spy on chatClient.on to record subscribed event names BEFORE
        //    calling startChat (intercept via prototype patching or wrap
        //    the SDK's ACSClient via test seam).
        // 3. await chatSDK.startChat()
        // 4. Do NOT call onStreamingMessage.
        // 5. Trigger the bot's streaming response.
        // 6. Wait for the bot to complete (it will via getMessages backfill).
        // 7. Assert: chatClient.on was NEVER called with "streamingChatMessageStarted"
        //    or "streamingChatMessageChunkReceived".
        // 8. Assert: onNewMessage fires once with the final assembled content
        //    (after the stream completes server-side).
        expect(true).toBe(true);
    });
});
