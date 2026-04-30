/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import ACSClient from "../../../src/core/messaging/ACSClient";

jest.mock('@azure/communication-common');
jest.mock('@azure/communication-chat');

describe('ACSClient', () => {
    it('ACSClient.initialize() should create ChatClient', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        expect(client.tokenCredential).toBeDefined();
        expect(client.chatClient).toBeDefined();
    });

    it('ACSClient.joinConversation() should return ACSConversation', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

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

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        expect(conversation).toBeDefined();
        expect(conversation.sessionInfo).toBeDefined();
    });

    it('ACSClient.initialize() with ChatClient.getChatThreadClient() failure show throw an error', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => Promise.reject());
        client.chatClient.startRealtimeNotifications = jest.fn();

        try {
            await client.joinConversation({
                id: 'id',
                threadId: 'threadId',
                pollingInterval: 1000,
            });
        } catch (error : any ) {
            expect(error.message).toContain('ChatClientGetChatThreadClientFailure');
        }
    });

    it('ACSClient.initialize() with ChatClient.startRealtimeNotifications() failure show throw an error', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

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
        client.chatClient.startRealtimeNotifications = jest.fn(() => Promise.reject());

        try {
            await client.joinConversation({
                id: 'id',
                threadId: 'threadId',
                pollingInterval: 1000,
            });
        } catch (error : any ) {
            expect(error.message).toContain('StartRealtimeNotificationsFailed');
        }
    });

    it('ACSClient.conversation.getMessages() should call ChatThreadClient.listMessages()', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        const messages = await conversation.getMessages();

        expect(chatThreadClient.listMessages).toHaveBeenCalledTimes(1);
        expect(messages).toBeDefined();
    });

    it('ACSClient.conversation.registerOnNewMessage() should call ChatThreadClient.getMessages() & register to "chatMessageReceived" and "chatMessageEdited" events', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
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

        conversation.keepPolling = true;
        jest.spyOn(conversation, 'getMessages').mockResolvedValue([{id: 'id', sender: {displayName: 'name'}}]);

        (global as any).setTimeout = jest.fn();
        await conversation.registerOnNewMessage(() => {});

        const chatMessageReceivedEvent = "chatMessageReceived";
        const chatMessageEditedEvent = "chatMessageEdited";
        expect(conversation.getMessages).toHaveBeenCalledTimes(1);
        expect(client.chatClient.on).toHaveBeenCalledTimes(2);
        expect(client.chatClient.on.mock.calls[0][0]).toEqual(chatMessageReceivedEvent);
        expect(client.chatClient.on.mock.calls[1][0]).toEqual(chatMessageEditedEvent);
    });

    it('ACSClient.conversation.registerOnNewMessage() with disablePolling set as \'true\' should NOT call ChatThreadClient.getMessages()', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
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

        conversation.keepPolling = true;
        jest.spyOn(conversation, 'getMessages').mockResolvedValue([{id: 'id', sender: {displayName: 'name'}}]);

        (global as any).setTimeout = jest.fn();
        await conversation.registerOnNewMessage(() => {}, {disablePolling: true});

        expect(conversation.getMessages).toHaveBeenCalledTimes(0);
    });

    it('ACSClient.conversation.registerOnThreadUpdate() should register to "participantsRemoved" event', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
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

        jest.spyOn(conversation, 'getMessages');

        await conversation.registerOnThreadUpdate(() => {});

        const event = "participantsRemoved";
        expect(client.chatClient.on).toHaveBeenCalledTimes(1);
        expect(client.chatClient.on.mock.calls[0][0]).toEqual(event);
    });

    it('ACSClient.conversation.onTypingEvent() should register to "typingIndicatorReceived" event', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
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

        jest.spyOn(conversation, 'getMessages');

        await conversation.onTypingEvent(() => {});

        const event = "typingIndicatorReceived";
        expect(client.chatClient.on).toHaveBeenCalledTimes(1);
        expect(client.chatClient.on.mock.calls[0][0]).toEqual(event);
    });

    it('ACSClient.sendMessage() should call ChatThreadClient.sendMessage()', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        const sendMessageResponse = {id: '0'};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.sendMessage = jest.fn(() => sendMessageResponse);

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        const content = 'message';
        const chatMessage = await conversation.sendMessage({
            content
        });

        expect(chatThreadClient.sendMessage).toHaveBeenCalledTimes(1);
        expect(chatMessage).toBeDefined();
        expect(chatMessage.id).toBe(sendMessageResponse.id);
        expect(chatMessage.content).toBe(content);
        expect(chatMessage.tags.includes('FromCustomer')).toBe(true);
        expect(chatMessage.tags.includes('ChannelId-lcw')).toBe(true);
        expect(chatMessage.properties.tags.includes('FromCustomer')).toBe(true);
        expect(chatMessage.properties.tags.includes('ChannelId-lcw')).toBe(true);
        expect(chatMessage.timestamp).toBeDefined();
    });

    it('ACSClient.sendMessage() failure should throw an error', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.sendMessage = jest.fn(() => Promise.reject(new Error('SendMessageFailed')));

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        try {
            await conversation.sendMessage({
                content: 'message',
            });
        } catch (error : any ) {
            expect(error.message).toBe('SendMessageFailed');
        }
    });

    it('ACSClient.conversation.sendTyping() should call ChatThreadClient.sendTypingNotification()', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.sendTypingNotification = jest.fn();

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        await conversation.sendTyping();

        expect(chatThreadClient.sendTypingNotification).toHaveBeenCalledTimes(1);
    });

    it('ACSClient.conversation.sendTyping() should throw an error if chatThreadClient.sendTypingNotification() fails', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.sendTypingNotification = jest.fn(() => Promise.reject());

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        try {
            await conversation.sendTyping();
        } catch (error : any ) {
            expect(error.message).toBe('SendTypingFailed');
        }

        expect(chatThreadClient.sendTypingNotification).toHaveBeenCalledTimes(1);
    });

    it('ACSClient.conversation.sendFileMessage() should be mocked', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        const response = await conversation.sendFileMessage();

        expect(response).not.toBeDefined();
    });

    it('ACSClient.conversation.sendFileData() should be mocked', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        const response = await conversation.sendFileData();

        expect(response).not.toBeDefined();
    });

    it('ACSClient.conversation.uploadFile() should be mocked', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        const response = await conversation.uploadFile();

        expect(response).not.toBeDefined();
    });

    it('ACSClient.conversation.downloadFile() should be mocked', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        const response = await conversation.downloadFile();

        expect(response).not.toBeDefined();
    });

    it('ACSClient.conversation.disconnect() should be mocked', async () => {
        const client: any = new ACSClient();
        const config = {
            token: 'token',
            environmentUrl: 'url'
        }

        await client.initialize(config);

        const chatThreadClient: any = {};
        chatThreadClient.listParticipants = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));
        chatThreadClient.listMessages = jest.fn(() => ({
            next: jest.fn(() => ({
                value: 'value',
                done: jest.fn()
            })),
        }));

        client.chatClient = {};
        client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
        client.chatClient.startRealtimeNotifications = jest.fn();

        const conversation = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        const response = await conversation.disconnect();

        expect(response).not.toBeDefined();
    });

    describe('registerOnStreamingMessage', () => {
        async function setupConversation() {
            const client: any = new ACSClient();
            const config = { token: 'token', environmentUrl: 'url' };
            await client.initialize(config);

            const chatThreadClient: any = {};
            chatThreadClient.listParticipants = jest.fn(() => ({
                next: jest.fn(() => ({ value: 'value', done: jest.fn() })),
            }));

            const onMock = jest.fn();
            const offMock = jest.fn();
            client.chatClient = {};
            client.chatClient.getChatThreadClient = jest.fn(() => chatThreadClient);
            client.chatClient.startRealtimeNotifications = jest.fn();
            client.chatClient.on = onMock;
            client.chatClient.off = offMock;

            const conversation = await client.joinConversation({
                id: 'id',
                threadId: 'threadId',
                pollingInterval: 1000,
            });
            return { conversation, onMock, offMock, client };
        }

        it('attaches listeners for streamingChatMessageStarted and streamingChatMessageChunkReceived', async () => {
            const { conversation, onMock } = await setupConversation();

            await conversation.registerOnStreamingMessage(jest.fn());

            const eventNames = onMock.mock.calls.map((c: any[]) => c[0]);
            expect(eventNames).toContain('streamingChatMessageStarted');
            expect(eventNames).toContain('streamingChatMessageChunkReceived');
        });

        it('records start/complete scenario telemetry on successful registration', async () => {
            const { conversation } = await setupConversation();
            // Inject a mock logger directly to verify scenario calls.
            const mockLogger = {
                startScenario: jest.fn(),
                completeScenario: jest.fn(),
                failScenario: jest.fn(),
                recordIndividualEvent: jest.fn(),
            };
            (conversation as any).logger = mockLogger;

            await conversation.registerOnStreamingMessage(jest.fn());

            expect(mockLogger.startScenario).toHaveBeenCalledWith('RegisterOnStreamingMessage');
            expect(mockLogger.completeScenario).toHaveBeenCalledWith('RegisterOnStreamingMessage');
            expect(mockLogger.failScenario).not.toHaveBeenCalled();
        });

        it('throws and logs failScenario when chatClient.on throws', async () => {
            const { conversation, client } = await setupConversation();
            client.chatClient.on = jest.fn(() => { throw new Error('subscribe failed'); });

            await expect(conversation.registerOnStreamingMessage(jest.fn())).rejects.toThrow('RegisterOnStreamingMessage');
        });

        it('fires the consumer callback with an OmnichannelStreamingMessage for start events', async () => {
            const { conversation, onMock } = await setupConversation();
            const callback = jest.fn();
            await conversation.registerOnStreamingMessage(callback);

            const startListener = onMock.mock.calls.find((c: any[]) => c[0] === 'streamingChatMessageStarted')[1];
            const startEvent = {
                id: 'm1',
                message: '',
                threadId: 't',
                sender: { kind: 'communicationUser', communicationUserId: 'b' },
                senderDisplayName: 'Bot',
                recipient: { kind: 'communicationUser', communicationUserId: 'u' },
                type: 'Text',
                version: '1',
                createdOn: new Date(),
                metadata: {},
                streamingMetadata: { streamingMessageType: 'start', streamingSequenceNumber: 0 },
            };
            startListener(startEvent);

            expect(callback).toHaveBeenCalledTimes(1);
            const delivered = callback.mock.calls[0][0];
            expect(delivered.id).toBe('m1');
            expect(delivered.streamingMetadata.streamingMessageType).toBe('start');
        });

        it('does not propagate errors when consumer callback throws synchronously', async () => {
            const { conversation, onMock } = await setupConversation();
            const callback = jest.fn(() => { throw new Error('consumer bug'); });
            await conversation.registerOnStreamingMessage(callback);

            const startListener = onMock.mock.calls.find((c: any[]) => c[0] === 'streamingChatMessageStarted')[1];
            const event = {
                id: 'm1',
                message: '',
                threadId: 't',
                sender: { kind: 'communicationUser', communicationUserId: 'b' },
                senderDisplayName: 'Bot',
                recipient: { kind: 'communicationUser', communicationUserId: 'u' },
                type: 'Text',
                version: '1',
                createdOn: new Date(),
                metadata: {},
                streamingMetadata: { streamingMessageType: 'start', streamingSequenceNumber: 0 },
            };

            expect(() => startListener(event)).not.toThrow();
        });

        it('removes streaming listeners via existing eventListeners cleanup on disconnect', async () => {
            const { conversation, offMock } = await setupConversation();
            await conversation.registerOnStreamingMessage(jest.fn());
            await conversation.disconnect();

            const offEventNames = offMock.mock.calls.map((c: any[]) => c[0]);
            expect(offEventNames).toContain('streamingChatMessageStarted');
            expect(offEventNames).toContain('streamingChatMessageChunkReceived');
        });

        // Backwards-compat fire-through: when streaming "final" arrives, the SDK
        // also invokes the registered chatMessageReceived listeners so consumers
        // who only use onNewMessage still see the assembled message once at the
        // end. This protects them from silent message loss when bots upgrade to
        // streaming responses.
        describe('backwards-compat fire-through to onNewMessage', () => {
            const finalChunkEvent = (id = 'm1', content = 'Hello world') => ({
                id,
                message: content,
                threadId: 't',
                sender: { kind: 'communicationUser', communicationUserId: 'b' },
                senderDisplayName: 'Bot',
                recipient: { kind: 'communicationUser', communicationUserId: 'u' },
                type: 'Text',
                version: '1',
                createdOn: new Date(),
                editedOn: new Date(),
                metadata: {},
                streamingMetadata: {
                    streamingMessageType: 'final',
                    streamingSequenceNumber: 5,
                    streamEndReason: 'completed',
                },
            });

            const nonFinalChunkEvent = (id = 'm1', content = 'partial') => ({
                ...finalChunkEvent(id, content),
                streamingMetadata: {
                    streamingMessageType: 'streaming',
                    streamingSequenceNumber: 2,
                },
            });

            it('"final" chunk fires through to chatMessageReceived listeners', async () => {
                const { conversation, onMock } = await setupConversation();

                // Register a fake chatMessageReceived listener (simulating what
                // registerOnNewMessage would do — pushed via trackListener).
                const newMessageListener = jest.fn();
                (conversation as any).eventListeners['chatMessageReceived'] = [newMessageListener];

                // Register streaming
                await conversation.registerOnStreamingMessage(jest.fn());

                // Simulate ACS firing a "final" chunk
                const chunkListener = onMock.mock.calls.find((c: any[]) => c[0] === 'streamingChatMessageChunkReceived')[1];
                const event = finalChunkEvent();
                chunkListener(event);

                // The chatMessageReceived listener should have been invoked with the chunk event
                expect(newMessageListener).toHaveBeenCalledTimes(1);
                expect(newMessageListener).toHaveBeenCalledWith(event);
            });

            it('non-final chunks do NOT fire through to chatMessageReceived listeners', async () => {
                const { conversation, onMock } = await setupConversation();

                const newMessageListener = jest.fn();
                (conversation as any).eventListeners['chatMessageReceived'] = [newMessageListener];

                await conversation.registerOnStreamingMessage(jest.fn());

                const chunkListener = onMock.mock.calls.find((c: any[]) => c[0] === 'streamingChatMessageChunkReceived')[1];
                chunkListener(nonFinalChunkEvent());

                expect(newMessageListener).not.toHaveBeenCalled();
            });

            it('fire-through still happens when consumer registers onlystreaming, no chatMessageReceived listeners', async () => {
                const { conversation, onMock } = await setupConversation();
                // No chatMessageReceived listeners registered.
                const streamingCallback = jest.fn();
                await conversation.registerOnStreamingMessage(streamingCallback);

                const chunkListener = onMock.mock.calls.find((c: any[]) => c[0] === 'streamingChatMessageChunkReceived')[1];
                expect(() => chunkListener(finalChunkEvent())).not.toThrow();

                // Streaming callback still fires
                expect(streamingCallback).toHaveBeenCalledTimes(1);
            });

            it('exception in chatMessageReceived listener does not break streaming delivery', async () => {
                const { conversation, onMock } = await setupConversation();

                const buggyListener = jest.fn(() => { throw new Error('newMessage handler bug'); });
                (conversation as any).eventListeners['chatMessageReceived'] = [buggyListener];
                const streamingCallback = jest.fn();
                await conversation.registerOnStreamingMessage(streamingCallback);

                const chunkListener = onMock.mock.calls.find((c: any[]) => c[0] === 'streamingChatMessageChunkReceived')[1];
                expect(() => chunkListener(finalChunkEvent())).not.toThrow();

                // Buggy listener was attempted
                expect(buggyListener).toHaveBeenCalledTimes(1);
                // Streaming callback still fired
                expect(streamingCallback).toHaveBeenCalledTimes(1);
            });
        });
    });
});