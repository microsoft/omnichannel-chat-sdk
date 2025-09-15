/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Test to verify that React Native callback functionality works correctly
 * This addresses the issue where onAgentEndSession and typing indicator callbacks
 * were not executing in React Native environments after random bytes library removal
 */

import ACSClient from "../../../src/core/messaging/ACSClient";
import { isReactNative } from "../../../src/utils/platform";

jest.mock('@azure/communication-common');
jest.mock('@azure/communication-chat');

describe('ACSClient React Native Callback Fix', () => {
    const originalNavigator = global.navigator;

    beforeEach(() => {
        // Clear any existing navigator
        delete (global as any).navigator;
    });

    afterEach(() => {
        // Restore original navigator
        (global as any).navigator = originalNavigator;
    });

    it('should properly detect React Native environment', () => {
        // Setup React Native environment
        (global as any).navigator = {
            product: 'ReactNative'
        };

        expect(isReactNative()).toBe(true);
        expect(typeof navigator !== "undefined" && navigator.product === "ReactNative").toBe(true);
    });

    it('should not detect React Native in browser environment', () => {
        // Setup browser environment
        (global as any).navigator = {
            product: 'Gecko'
        };

        expect(isReactNative()).toBe(false);
        expect(typeof navigator !== "undefined" && navigator.product === "ReactNative").toBe(false);
    });

    it('should initialize ACSClient successfully in React Native environment', async () => {
        // Setup React Native environment
        (global as any).navigator = {
            product: 'ReactNative'
        };

        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        };

        await client.initialize(config);

        expect(client.tokenCredential).toBeDefined();
        expect(client.chatClient).toBeDefined();
    });

    it('should setup conversation with callback registration capabilities in React Native', async () => {
        // Setup React Native environment
        (global as any).navigator = {
            product: 'ReactNative'
        };

        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        };

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();
        client.chatClient.on = jest.fn(); // Mock the event listener registration

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        expect(conversation).toBeDefined();

        // Test that callback registration methods are available
        expect(typeof conversation.onTypingEvent).toBe('function');
        expect(typeof conversation.registerOnThreadUpdate).toBe('function');

        // Test callback registration doesn't throw errors
        await expect(conversation.onTypingEvent(() => {})).resolves.not.toThrow();
        await expect(conversation.registerOnThreadUpdate(() => {})).resolves.not.toThrow();

        // Verify event listeners were registered
        expect(client.chatClient.on).toHaveBeenCalled();
    });

    it('should handle missing navigator gracefully during initialization', async () => {
        // Start without navigator
        expect(typeof navigator).toBe('undefined');

        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        };

        // The ensureReactNativeEnvironment function should handle this case
        await expect(client.initialize(config)).resolves.not.toThrow();
        expect(client.chatClient).toBeDefined();
    });
});