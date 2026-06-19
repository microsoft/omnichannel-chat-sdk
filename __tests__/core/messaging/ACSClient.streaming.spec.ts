/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import ACSClient from "../../../src/core/messaging/ACSClient";

jest.mock('@azure/communication-common');
jest.mock('@azure/communication-chat');

describe('ACSClient - Streaming', () => {
    const createConversation = async () => {
        const client: any = new ACSClient();
        const config = { token: 'token', environmentUrl: 'url' };
        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({ value: 'value', done: jest.fn() })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({ value: 'value', done: jest.fn() })),
        }));

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();
        client.chatClient.on = jest.fn();

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        return { client, conversation };
    };

    describe('registerOnStreamingMessage', () => {
        it('should subscribe to streamingChatMessageStarted and streamingChatMessageChunkReceived events', async () => {
            const { client, conversation } = await createConversation();

            await conversation.registerOnStreamingMessage(() => {});

            expect(client.chatClient.on).toHaveBeenCalledTimes(2);
            expect(client.chatClient.on.mock.calls[0][0]).toEqual('streamingChatMessageStarted');
            expect(client.chatClient.on.mock.calls[1][0]).toEqual('streamingChatMessageChunkReceived');
        });

        it('should store the callback reference for streaming final routing', async () => {
            const { conversation } = await createConversation();
            const callback = jest.fn();

            await conversation.registerOnStreamingMessage(callback);

            expect(conversation['streamingMessageCallback']).toBe(callback);
        });

        it('should invoke callback when a start event fires', async () => {
            const { client, conversation } = await createConversation();
            const callback = jest.fn();

            await conversation.registerOnStreamingMessage(callback);

            // Get the onStart handler that was registered
            const onStart = client.chatClient.on.mock.calls[0][1];

            const fakeStartEvent = {
                id: 'msg-1',
                message: 'Hello',
                sender: { communicationUserId: 'bot', kind: 'communicationUser' },
                senderDisplayName: 'Bot',
                createdOn: new Date(),
                editedOn: new Date(),
                threadId: 'thread-1',
                recipient: { communicationUserId: 'user', kind: 'communicationUser' },
                type: 'text',
                version: '1',
                metadata: {},
                streamingMetadata: {
                    streamingMessageType: 'streaming', // ACS sends 'streaming' even for start
                    streamingSequenceNumber: 1,
                },
            };

            onStart(fakeStartEvent);

            expect(callback).toHaveBeenCalledTimes(1);
            const msg = callback.mock.calls[0][0];
            expect(msg.streamingMetadata.streamingMessageType).toBe('start');
            expect(msg.content).toBe('Hello');
        });

        it('should invoke callback when a chunk event fires', async () => {
            const { client, conversation } = await createConversation();
            const callback = jest.fn();

            await conversation.registerOnStreamingMessage(callback);

            const onChunk = client.chatClient.on.mock.calls[1][1];

            const fakeChunkEvent = {
                id: 'msg-1',
                message: 'Hello world',
                sender: { communicationUserId: 'bot', kind: 'communicationUser' },
                senderDisplayName: 'Bot',
                createdOn: new Date(),
                editedOn: new Date(),
                threadId: 'thread-1',
                recipient: { communicationUserId: 'user', kind: 'communicationUser' },
                type: 'text',
                version: '1',
                metadata: {},
                streamingMetadata: {
                    streamingMessageType: 'streaming',
                    streamingSequenceNumber: 2,
                },
            };

            onChunk(fakeChunkEvent);

            expect(callback).toHaveBeenCalledTimes(1);
            const msg = callback.mock.calls[0][0];
            expect(msg.streamingMetadata.streamingMessageType).toBe('streaming');
        });

        it('should fire-through to chatMessageReceived listeners on final', async () => {
            const { client, conversation } = await createConversation();
            const streamCallback = jest.fn();
            const newMessageCallback = jest.fn();

            // Register onNewMessage first (which subscribes to chatMessageReceived)
            conversation.keepPolling = true;
            jest.spyOn(conversation, 'getMessages').mockResolvedValue([{ id: 'id', sender: { displayName: 'name' } }]);
            (global as any).setTimeout = jest.fn();
            await conversation.registerOnNewMessage(newMessageCallback);

            // Now register streaming
            await conversation.registerOnStreamingMessage(streamCallback);

            const onChunk = client.chatClient.on.mock.calls.find(
                (call: any) => call[0] === 'streamingChatMessageChunkReceived'
            )[1];

            const fakeFinalEvent = {
                id: 'msg-final',
                message: 'Complete message',
                sender: { communicationUserId: 'bot', kind: 'communicationUser' },
                senderDisplayName: 'Bot',
                createdOn: new Date(),
                editedOn: new Date(),
                threadId: 'thread-1',
                recipient: { communicationUserId: 'user', kind: 'communicationUser' },
                type: 'text',
                version: '1',
                metadata: {},
                streamingMetadata: {
                    streamingMessageType: 'final',
                    streamEndReason: 'completed',
                    streamingSequenceNumber: 5,
                },
            };

            onChunk(fakeFinalEvent);

            // Streaming callback should be called
            expect(streamCallback).toHaveBeenCalledTimes(1);
            expect(streamCallback.mock.calls[0][0].streamingMetadata.streamingMessageType).toBe('final');

            // Fire-through: newMessageCallback should also be called
            expect(newMessageCallback).toHaveBeenCalledWith(fakeFinalEvent);
        });

        it('should not crash when callback throws synchronously', async () => {
            const { client, conversation } = await createConversation();
            const throwingCallback = jest.fn(() => { throw new Error('consumer error'); });

            await conversation.registerOnStreamingMessage(throwingCallback);

            const onStart = client.chatClient.on.mock.calls[0][1];

            const fakeEvent = {
                id: 'msg-1',
                message: 'Hello',
                sender: { communicationUserId: 'bot', kind: 'communicationUser' },
                senderDisplayName: 'Bot',
                createdOn: new Date(),
                editedOn: new Date(),
                threadId: 'thread-1',
                recipient: { communicationUserId: 'user', kind: 'communicationUser' },
                type: 'text',
                version: '1',
                metadata: {},
                streamingMetadata: { streamingMessageType: 'streaming', streamingSequenceNumber: 1 },
            };

            // Should not throw — error is caught internally
            expect(() => onStart(fakeEvent)).not.toThrow();
        });

        it('should deduplicate finals arriving on both chunk and chatMessageReceived', async () => {
            const { client, conversation } = await createConversation();
            const streamCallback = jest.fn();

            // Register new message first
            conversation.keepPolling = true;
            jest.spyOn(conversation, 'getMessages').mockResolvedValue([{ id: 'id', sender: { displayName: 'name' } }]);
            (global as any).setTimeout = jest.fn();
            await conversation.registerOnNewMessage(() => {});

            // Register streaming
            await conversation.registerOnStreamingMessage(streamCallback);

            const onChunk = client.chatClient.on.mock.calls.find(
                (call: any) => call[0] === 'streamingChatMessageChunkReceived'
            )[1];

            const fakeFinalEvent = {
                id: 'msg-dedup',
                message: 'Final',
                sender: { communicationUserId: 'bot', kind: 'communicationUser' },
                senderDisplayName: 'Bot',
                createdOn: new Date(),
                editedOn: new Date(),
                threadId: 'thread-1',
                recipient: { communicationUserId: 'user', kind: 'communicationUser' },
                type: 'text',
                version: '1',
                metadata: {},
                streamingMetadata: { streamingMessageType: 'final', streamEndReason: 'completed', streamingSequenceNumber: 5 },
            };

            // First final via chunk event
            onChunk(fakeFinalEvent);
            expect(streamCallback).toHaveBeenCalledTimes(1);

            // Second final via chatMessageReceived (simulate)
            // The chatMessageReceived handler checks finalizedMessageIds
            const chatMsgHandler = client.chatClient.on.mock.calls.find(
                (call: any) => call[0] === 'chatMessageReceived'
            )[1];

            // Simulate the same message arriving on chatMessageReceived with streaming final metadata
            chatMsgHandler(fakeFinalEvent);

            // Should still only have been called once via the streaming path (duplicate detected)
            expect(streamCallback).toHaveBeenCalledTimes(1);
        });

        it('should remove previous listeners when registerOnStreamingMessage is called twice', async () => {
            const { client, conversation } = await createConversation();
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            // First registration
            await conversation.registerOnStreamingMessage(callback1);
            expect(client.chatClient.on).toHaveBeenCalledTimes(2);

            // Mock chatClient.off to track unsubscriptions
            client.chatClient.off = jest.fn();

            // Second registration — should clean up first
            await conversation.registerOnStreamingMessage(callback2);

            // Old listeners should have been removed
            expect(client.chatClient.off).toHaveBeenCalledWith('streamingChatMessageStarted', expect.any(Function));
            expect(client.chatClient.off).toHaveBeenCalledWith('streamingChatMessageChunkReceived', expect.any(Function));

            // Callback reference should be updated to cb2
            expect(conversation['streamingMessageCallback']).toBe(callback2);
        });

        it('should log telemetry when replacing streaming registration', async () => {
            const { client, conversation } = await createConversation();
            client.chatClient.off = jest.fn();
            const logger = { startScenario: jest.fn(), completeScenario: jest.fn(), failScenario: jest.fn(), recordIndividualEvent: jest.fn() };
            conversation['logger'] = logger;

            await conversation.registerOnStreamingMessage(jest.fn());
            await conversation.registerOnStreamingMessage(jest.fn());

            expect(logger.recordIndividualEvent).toHaveBeenCalledWith(
                'StreamingRegistrationReplaced',
                expect.any(String),
                expect.objectContaining({ reason: expect.stringContaining('already registered') })
            );
        });
    });

    describe('disconnect - streaming cleanup', () => {
        it('should clear streaming state on disconnect', async () => {
            const { client, conversation } = await createConversation();
            const callback = jest.fn();

            await conversation.registerOnStreamingMessage(callback);

            // Simulate some streaming state
            conversation['streamSequenceCounters'].set('msg-1', 5);
            conversation['finalizedMessageIds'].add('msg-2');
            expect(conversation['streamingMessageCallback']).toBe(callback);

            // Mock off for disconnect listener cleanup
            client.chatClient.off = jest.fn();
            await conversation.disconnect();

            expect(conversation['streamSequenceCounters'].size).toBe(0);
            expect(conversation['finalizedMessageIds'].size).toBe(0);
            expect(conversation['streamingMessageCallback']).toBeNull();
        });
    });
});
