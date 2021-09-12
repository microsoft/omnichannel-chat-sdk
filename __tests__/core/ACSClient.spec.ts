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
});