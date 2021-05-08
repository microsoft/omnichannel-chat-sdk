import { ChatClient, ChatMessage, ChatParticipant, ChatThreadClient } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential, CommunicationUserIdentifier } from "@azure/communication-common";
import { ChatMessageReceivedEvent, ParticipantsRemovedEvent } from '@azure/communication-signaling';

export interface ACSSessionInfo {
    id: string;
    threadId: string;
}

export interface ACSClientConfig {
    token: string;
    environmentUrl: string;
}

export class ACSConversation {
    private tokenCredential: AzureCommunicationTokenCredential;
    private chatClient: ChatClient;
    private chatThreadClient?: ChatThreadClient;
    private sessionInfo?: ACSSessionInfo;
    private participantsMapping: any;

    constructor(tokenCredential: AzureCommunicationTokenCredential, chatClient: ChatClient) {
        this.tokenCredential = tokenCredential;
        this.chatClient = chatClient;
    }

    public async initialize(sessionInfo: ACSSessionInfo) {
        this.sessionInfo = sessionInfo;

        try {
            this.chatThreadClient = await this.chatClient?.getChatThreadClient(sessionInfo.threadId as string);
        } catch (error) {
            console.error(`ACSConversation/chatClient/getChatThreadClient/error ${error}`);
            throw new Error('GetChatThreadClientFailed');
        }

        try {
            await this.chatClient.startRealtimeNotifications();
        } catch (error) {
            console.error(`ACSConversation/chatClient/startRealtimeNotifications/error ${error}`);
            throw new Error('StartRealtimeNotificationsFailed');
        }

        this.participantsMapping = await this.createParticipantsMapping();
    }

    public async getMessages(): Promise<ChatMessage[]> {
        const messages: ChatMessage[] = [];
        const pagedAsyncIterableIterator = await (this.chatThreadClient as ChatThreadClient).listMessages();
        let nextMessage = await pagedAsyncIterableIterator.next();
        while (!nextMessage.done) {
            let chatMessage = nextMessage.value;

            // Filter text type messages only
            if (chatMessage.type !== 'text') {
                nextMessage = await pagedAsyncIterableIterator.next();
                continue;
            }

            // Flatten out message content
            if (chatMessage.content?.message) {
                Object.assign(chatMessage, {content: chatMessage.content?.message});
            }

            const {sender} = chatMessage;

            // Add alias to differentiate sender type
            const participant = this.participantsMapping[(sender as CommunicationUserIdentifier).communicationUserId];
            Object.assign(chatMessage.sender, {alias: participant.displayName});

            messages.push(chatMessage);

            nextMessage = await pagedAsyncIterableIterator.next();
        }

        return messages;
    }

    public async getParticipants(): Promise<ChatParticipant[]> {
        const participants: ChatParticipant[] = [];
        const pagedAsyncIterableIterator = await (this.chatThreadClient as ChatThreadClient).listParticipants();
        let next = await pagedAsyncIterableIterator.next();
        while (!next.done) {
           let user = next.value;
           participants.push(user);
           next = await pagedAsyncIterableIterator.next();
        }

        return participants;
    }

    public async registerOnNewMessage(onNewMessageCallback: CallableFunction): Promise<void> {
        this.chatClient?.on("chatMessageReceived", (event: ChatMessageReceivedEvent) => {
            const {sender} = event;

            const customerMessageCondition = ((sender as CommunicationUserIdentifier).communicationUserId === (this.sessionInfo?.id as string))

            // Filter out customer messages
            if (customerMessageCondition) {
                return;
            }

            if (event.message) {
                Object.assign(event, {content: event.message});
            }

            // Add alias to differentiate sender type
            const participant = this.participantsMapping[(sender as CommunicationUserIdentifier).communicationUserId];
            Object.assign(event.sender, {alias: participant.displayName});

            onNewMessageCallback(event);
        });
    }

    public async registerOnThreadUpdate(onThreadUpdateCallback: CallableFunction): Promise<void> {
        this.chatClient?.on("participantsRemoved", (event: ParticipantsRemovedEvent) => {
            onThreadUpdateCallback(event);
        });
    }

    public async sendMessage(message: any): Promise<void> {
        const sendMessageRequest = {
            content: message.content,
            senderDisplayName: undefined
        }

        try {
            const response = await this.chatThreadClient?.sendMessage(sendMessageRequest);
            console.log(response);
        } catch (error) {
            console.error(`ACSClient/sendMessage/error ${error}`);
        }
    }

    public async sendFileMessage(): Promise<void> {

    }

    public async sendFileData():  Promise<void> {

    }

    public async uploadFile() {

    }

    public async downloadFile() {

    }

    public async disconnect(): Promise<void> {

    }

    private async createParticipantsMapping() {
        const participants = await this.getParticipants();
        const participantsMapping = {};
        for (const participant of participants) {
          const {id} = participant;

          if (!Object.keys(participantsMapping).includes((id as CommunicationUserIdentifier).communicationUserId)) {
            Object.assign(participantsMapping, {[(id as CommunicationUserIdentifier).communicationUserId]: participant});
          }
        }

        return participantsMapping;
    }
}

class ACSClient {
    private tokenCredential: AzureCommunicationTokenCredential | null = null;
    private chatClient: ChatClient | null = null;

    constructor() {

    }

    public async initialize(acsClientConfig: ACSClientConfig): Promise<void> {
        try {
            this.tokenCredential = new AzureCommunicationTokenCredential(acsClientConfig.token);
        } catch (error) {
            throw new Error('CreateTokenCredentialFailed');
        }

        try {
            this.chatClient = new ChatClient(acsClientConfig.environmentUrl, this.tokenCredential);
        } catch (error) {
            throw new Error('CreateChatClientFailed');
        }
    }

    public async joinConversation(sessionInfo: ACSSessionInfo): Promise<ACSConversation> {
        const conversation = new ACSConversation(this.tokenCredential as AzureCommunicationTokenCredential, this.chatClient as ChatClient);
        await conversation.initialize(sessionInfo);
        return conversation;
    }
}

export default ACSClient;