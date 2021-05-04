import { ChatClient, ChatThreadClient } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential, CommunicationUserIdentifier } from "@azure/communication-common";
import { ChatMessageReceivedEvent } from '@azure/communication-signaling';

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
    }

    public async getMessages() {

    }

    public async getMembers() {

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

            onNewMessageCallback(event);
        });
    }

    public async registerOnThreadUpdate(): Promise<void> {

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