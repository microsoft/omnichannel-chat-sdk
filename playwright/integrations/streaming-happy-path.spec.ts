import { test, expect } from '@playwright/test';

/**
 * E2E: ACS streaming — happy path
 *
 * BLOCKED: requires a streaming-capable test bot in the test environment.
 * Provision a bot that uses ACS chat's send-streaming-message API
 * (see @azure/communication-chat 1.6.0+) before un-skipping.
 *
 * When un-skipping:
 * 1. Replace test.skip with test.
 * 2. Wire fetchOmnichannelConfig with a streaming-capable widget id.
 * 3. Implement the steps inside page.evaluate following the existing
 *    pattern at playwright/integrations/authenticated-chat-with-typing.spec.ts.
 */
test.describe.skip('ACS streaming — happy path', () => {
    test('receives full lifecycle (start + chunks + final) for a streaming bot response', async ({ page }) => {
        // 1. Initialize ChatSDK with V2 config and streaming-capable bot endpoint.
        // 2. await chatSDK.startChat()
        // 3. Register chatSDK.onStreamingMessage handler that records every fire
        //    (push to a window-scoped array so the assertion can read it).
        // 4. Send a message that triggers the bot's streaming response.
        // 5. await sleep(streamDuration) until "final" is observed.
        // 6. Assert: handler fired with streamingMessageType "start",
        //    N "streaming"/"informative", and exactly one "final" with
        //    streamEndReason "completed".
        // 7. Assert: assembled content from final chunk equals what
        //    getMessages() returns after the stream completes.
        expect(true).toBe(true);
    });
});
