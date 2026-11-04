/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import ACSClient from "../../../src/core/messaging/ACSClient";
import { ChatTokenUnauthorizedRecoveryCredential, chatTokenUnauthorizedRecoveryPolicyName, createChatTokenUnauthorizedRecovery } from "../../../src/utils/chatTokenUnauthorizedRecovery";

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

    describe('tokenRefresher', () => {
        const getTokenRefresher = async (config: any): Promise<() => Promise<string>> => {
            const { AzureCommunicationTokenCredential } = jest.requireMock('@azure/communication-common');
            (AzureCommunicationTokenCredential as jest.Mock).mockClear();

            const client: any = new ACSClient();
            await client.initialize(config);

            return (AzureCommunicationTokenCredential as jest.Mock).mock.calls[0][0].tokenRefresher;
        };

        it('should return the original token when no refresher is configured', async () => {
            const tokenRefresher = await getTokenRefresher({ token: 'token', environmentUrl: 'url' });

            await expect(tokenRefresher()).resolves.toBe('token');
        });

        it('should return the token from the configured refresher', async () => {
            const tokenRefresher = await getTokenRefresher({ token: 'token', environmentUrl: 'url', tokenRefresher: async () => 'renewed' });

            await expect(tokenRefresher()).resolves.toBe('renewed');
        });

        it('should fall back to the original token when the configured refresher throws', async () => {
            const tokenRefresher = await getTokenRefresher({ token: 'token', environmentUrl: 'url', tokenRefresher: async () => { throw new Error('failure'); } });

            await expect(tokenRefresher()).resolves.toBe('token');
        });

        it('should fall back to the original token when the configured refresher returns an empty token', async () => {
            const tokenRefresher = await getTokenRefresher({ token: 'token', environmentUrl: 'url', tokenRefresher: async () => '' });

            await expect(tokenRefresher()).resolves.toBe('token');
        });

        it('should give a renewed token to the 401 recovery', async () => {
            const unauthorizedRecovery = { selectToken: jest.fn(), observeToken: jest.fn(), recover: jest.fn() };
            const tokenRefresher = await getTokenRefresher({ token: 'token', environmentUrl: 'url', tokenRefresher: async () => 'renewed', unauthorizedRecovery });

            await tokenRefresher();

            expect(unauthorizedRecovery.observeToken).toHaveBeenCalledWith('renewed');
        });
    });

    describe('401 recovery', () => {
        const createChatClient = async (config: any) => {
            const { ChatClient } = jest.requireMock('@azure/communication-chat');
            (ChatClient as jest.Mock).mockClear();

            const client: any = new ACSClient();
            await client.initialize(config);

            return { client, args: (ChatClient as jest.Mock).mock.calls[0] };
        };

        it('should create ChatClient without changes when recovery is not configured', async () => {
            const { client, args } = await createChatClient({ token: 'token', environmentUrl: 'url' });

            expect(args).toEqual(['url', client.tokenCredential]);
        });

        it('should create ChatClient with the recovery credential and policy when recovery is configured', async () => {
            const unauthorizedRecovery = { selectToken: jest.fn(), observeToken: jest.fn(), recover: jest.fn() };
            const { args } = await createChatClient({ token: 'token', environmentUrl: 'url', unauthorizedRecovery });

            expect(args[0]).toBe('url');
            expect(args[1]).toBeInstanceOf(ChatTokenUnauthorizedRecoveryCredential);
            expect(args[2].additionalPolicies).toEqual([expect.objectContaining({ position: 'perRetry', policy: expect.objectContaining({ name: chatTokenUnauthorizedRecoveryPolicyName }) })]);
            expect(args[2].signalingClientOptions.additionalPolicies).toEqual(args[2].additionalPolicies);
        });

        const createJwt = (seconds: number) => `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + seconds })).toString('base64')}.signature`;

        it('recovers simultaneous signaling and REST 401s with one shared renewal', async () => {
            const initialToken = createJwt(3600);
            const renewedToken = createJwt(86400);
            const refreshToken = jest.fn().mockResolvedValue(renewedToken);
            const unauthorizedRecovery = createChatTokenUnauthorizedRecovery({ initialToken, refreshToken });
            const { args } = await createChatClient({ token: initialToken, environmentUrl: 'https://example.invalid', unauthorizedRecovery });
            const request = () => {
                const headers = new Map([['Authorization', `Bearer ${initialToken}`]]);
                return { headers: { get: (name: string) => headers.get(name), set: (name: string, value: string) => headers.set(name, value) } };
            };
            const restNext = jest.fn(async (req: any) => ({ status: req.headers.get('Authorization') === `Bearer ${renewedToken}` ? 200 : 401 }));
            const signalingNext = jest.fn(restNext.getMockImplementation());

            const results = await Promise.all([
                args[2].additionalPolicies[0].policy.sendRequest(request(), restNext),
                args[2].signalingClientOptions?.additionalPolicies[0].policy.sendRequest(request(), signalingNext)
            ]);

            expect(results.map(result => result?.status)).toEqual([200, 200]);
            expect(refreshToken).toHaveBeenCalledTimes(1);
            expect(restNext).toHaveBeenCalledTimes(2);
            expect(signalingNext).toHaveBeenCalledTimes(2);
        });

        it('bounds signaling replay and failed renewal without changing the original 401', async () => {
            const initialToken = createJwt(3600);
            const refreshToken = jest.fn().mockResolvedValue(initialToken);
            const unauthorizedRecovery = createChatTokenUnauthorizedRecovery({ initialToken, refreshToken });
            const { args } = await createChatClient({ token: initialToken, environmentUrl: 'https://example.invalid', unauthorizedRecovery });
            const policy = args[2].signalingClientOptions?.additionalPolicies[0].policy;
            expect(policy).toBeDefined();
            const response = { status: 401 };
            const next = jest.fn().mockResolvedValue(response);
            const request = { headers: { get: () => `Bearer ${initialToken}`, set: jest.fn() } };

            await expect(policy.sendRequest(request, next)).resolves.toBe(response);
            await expect(policy.sendRequest(request, next)).resolves.toBe(response);
            expect(next).toHaveBeenCalledTimes(2);
            expect(refreshToken).toHaveBeenCalledTimes(1);
        });

        it.each([true, false])('runs the installed Azure signaling configuration pipeline with recovery %s', async enabled => {
            const initialToken = createJwt(3600);
            const renewedToken = createJwt(86400);
            const refreshToken = jest.fn().mockResolvedValue(renewedToken);
            const unauthorizedRecovery = enabled ? createChatTokenUnauthorizedRecovery({ initialToken, refreshToken }) : undefined;
            const { args } = await createChatClient({ token: initialToken, environmentUrl: 'https://example.invalid/', unauthorizedRecovery });
            const { CommunicationSignalingClient } = jest.requireActual('@azure/communication-signaling');
            const sentTokens: string[] = [];
            const transport = {
                position: 'perRetry',
                policy: {
                    name: 'TestSignalingTransport',
                    sendRequest: async (request: any) => {
                        expect(request.url).toContain('/chat/config/realTimeNotifications?api-version=');
                        const token = request.headers.get('Authorization');
                        sentTokens.push(token);
                        return {
                            request,
                            headers: jest.requireActual('@azure/core-rest-pipeline').createHttpHeaders(),
                            status: token === `Bearer ${renewedToken}` ? 200 : 401,
                            // Stop after the real config pipeline, before opening a Trouter connection.
                            bodyAsText: '{}'
                        };
                    }
                }
            };
            const credential = { getToken: async () => ({ token: initialToken, expiresOnTimestamp: Date.now() + 3600000 }) };
            const signaling = new CommunicationSignalingClient(credential, { verbose: jest.fn(), info: jest.fn(), warning: jest.fn(), error: jest.fn() }, {
                resourceEndpoint: args[0],
                additionalPolicies: [...(args[2]?.signalingClientOptions?.additionalPolicies ?? []), transport]
            });
            if (enabled) {
                await expect(signaling.start()).rejects.toThrow('required fields are missing');
                expect(sentTokens).toEqual([`Bearer ${initialToken}`, `Bearer ${renewedToken}`]);
                expect(refreshToken).toHaveBeenCalledTimes(1);
            } else {
                await expect(signaling.start()).rejects.toThrow('Status: 401');
                expect(sentTokens).toEqual([`Bearer ${initialToken}`]);
                expect(refreshToken).not.toHaveBeenCalled();
            }
        });

        it.each([false, true])('resets a failed realtime start through the supported stop API even if cleanup rejects: %s', async cleanupRejects => {
            const unauthorizedRecovery = createChatTokenUnauthorizedRecovery({ initialToken: createJwt(3600), refreshToken: jest.fn() });
            const { client } = await createChatClient({ token: createJwt(3600), environmentUrl: 'https://example.invalid', unauthorizedRecovery });
            const chatClient = client.getChatClient();
            chatClient.getChatThreadClient = jest.fn().mockReturnValue({});
            chatClient.startRealtimeNotifications = jest.fn().mockRejectedValueOnce(new Error('401')).mockResolvedValueOnce(undefined);
            chatClient.stopRealtimeNotifications = cleanupRejects
                ? jest.fn().mockRejectedValue(new Error('cleanup'))
                : jest.fn().mockResolvedValue(undefined);
            const session = { id: 'id', threadId: 'thread', pollingInterval: 1000 };

            await expect(client.joinConversation(session)).rejects.toThrow('StartRealtimeNotificationsFailed');
            expect(chatClient.stopRealtimeNotifications).toHaveBeenCalledTimes(1);
            await expect(client.joinConversation(session)).resolves.toBeDefined();
            expect(chatClient.startRealtimeNotifications).toHaveBeenCalledTimes(2);
        });
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
        client.chatClient.stopRealtimeNotifications = jest.fn();

        try {
            await client.joinConversation({
                id: 'id',
                threadId: 'threadId',
                pollingInterval: 1000,
            });
        } catch (error : any ) {
            expect(error.message).toContain('StartRealtimeNotificationsFailed');
        }
        expect(client.chatClient.stopRealtimeNotifications).not.toHaveBeenCalled();
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

    it('ACSClient.conversation.registerOnNewMessage() should log failScenario telemetry when message processing throws and keep polling', async () => {
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

        const conversation: any = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        // Inject a mock logger so we can assert telemetry is recorded
        const logger = {
            startScenario: jest.fn(),
            completeScenario: jest.fn(),
            failScenario: jest.fn(),
            recordIndividualEvent: jest.fn()
        };
        conversation.logger = logger;

        conversation.keepPolling = true;
        jest.spyOn(conversation, 'getMessages').mockResolvedValue([{id: 'id', sender: {displayName: 'name'}}]);

        (global as any).setTimeout = jest.fn();

        // Customer callback throws while processing the message
        const throwingCallback = jest.fn(() => { throw new Error('transformation failed'); });

        // Capture the console.warn that surfaces processing failures
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        try {
            // Should not throw out of registerOnNewMessage despite the callback throwing
            await expect(conversation.registerOnNewMessage(throwingCallback)).resolves.toBeUndefined();

            expect(throwingCallback).toHaveBeenCalledTimes(1);
            expect(logger.failScenario).toHaveBeenCalledTimes(1);
            expect(logger.failScenario.mock.calls[0][0]).toEqual('MessageProcessingError');
            // Telemetry records the same static, type-only message as the console — never the error message
            expect(logger.failScenario.mock.calls[0][1].ExceptionDetails).toEqual('[ACSClient][registerOnNewMessage] Error occurred while processing messages: Error');
            expect(logger.failScenario.mock.calls[0][1].ExceptionDetails).not.toContain('transformation failed');
            // console.warn always fires so consumers without telemetry still see it
            expect(consoleWarnSpy).toHaveBeenCalledWith('[ACSClient][registerOnNewMessage] Error occurred while processing messages: Error');
        } finally {
            consoleWarnSpy.mockRestore();
        }
    });

    it('ACSClient.conversation.registerOnNewMessage() should not leak error content to telemetry or console', async () => {
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

        const conversation: any = await client.joinConversation({
            id: 'id',
            threadId: 'threadId',
            pollingInterval: 1000,
        });

        const logger = {
            startScenario: jest.fn(),
            completeScenario: jest.fn(),
            failScenario: jest.fn(),
            recordIndividualEvent: jest.fn()
        };
        conversation.logger = logger;

        conversation.keepPolling = true;
        jest.spyOn(conversation, 'getMessages').mockResolvedValue([{id: 'id', sender: {displayName: 'name'}}]);

        (global as any).setTimeout = jest.fn();

        // Error carries a custom name plus sensitive-looking content in its message
        const secret = 'sensitive-customer-pii-12345';
        const throwingCallback = jest.fn(() => {
            const err = new Error(secret);
            err.name = 'TypeError';
            throw err;
        });

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        try {
            await expect(conversation.registerOnNewMessage(throwingCallback)).resolves.toBeUndefined();

            expect(logger.failScenario).toHaveBeenCalledTimes(1);
            // Telemetry records only the safe error type, not the message content
            const exceptionDetails = logger.failScenario.mock.calls[0][1].ExceptionDetails;
            expect(exceptionDetails).toEqual('[ACSClient][registerOnNewMessage] Error occurred while processing messages: TypeError');
            expect(exceptionDetails).not.toContain(secret);
            // console.warn surfaces the safe error type only — no content leaks
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).toHaveBeenCalledWith('[ACSClient][registerOnNewMessage] Error occurred while processing messages: TypeError');
            expect(consoleWarnSpy.mock.calls[0].join(' ')).not.toContain(secret);
        } finally {
            consoleWarnSpy.mockRestore();
        }
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
});