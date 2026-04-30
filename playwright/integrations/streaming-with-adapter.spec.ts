import { test, expect } from '@playwright/test';

/**
 * E2E: ACS streaming — dual-subscription with adapter
 *
 * BLOCKED: requires a streaming-capable test bot. See streaming-happy-path.spec.ts.
 *
 * Verifies the design spec decision #4: SDK onStreamingMessage and the
 * adapter's WebChat activities both fire independently for the same chunks
 * (pragmatic dual-subscription on shared ChatClient).
 */
test.describe.skip('ACS streaming — dual subscription with adapter', () => {
    test('SDK onStreamingMessage and adapter activities both fire for same chunks', async ({ page }) => {
        // 1. Initialize ChatSDK with V2 config and adapter (createChatAdapter).
        // 2. Register both:
        //    a. chatSDK.onStreamingMessage SDK-side handler that records each fire.
        //    b. WebChat activity listener on the adapter that records each activity.
        // 3. await chatSDK.startChat()
        // 4. Trigger streaming bot response.
        // 5. Wait for the stream to complete.
        // 6. Assert: SDK handler received chunks for the bot's message id.
        // 7. Assert: WebChat adapter produced activities for the same message id
        //    with channelData.streamType set to lifecycle phase
        //    (matches SDK's streamingMessageType for each chunk).
        // 8. Assert: total chunk counts on both paths match.
        expect(true).toBe(true);
    });
});
