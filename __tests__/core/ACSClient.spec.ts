import ACSClient, { ACSConversation } from "../../src/core/ACSClient";

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

    it('ACSClient.conversation.registerOnNewMessage() should call ChatThreadClient.getMessages() & register to "chatMessageReceived" event', async () => {
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

        await conversation.registerOnNewMessage(() => {});

        const event = "chatMessageReceived";
        expect(conversation.getMessages).toHaveBeenCalledTimes(1);
        expect(client.chatClient.on).toHaveBeenCalledTimes(1);
        expect(client.chatClient.on.mock.calls[0][0]).toEqual(event);
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