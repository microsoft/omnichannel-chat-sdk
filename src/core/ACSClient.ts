import { ChatClient, ChatThreadClient } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

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
    private chatThreadClient: ChatThreadClient | null = null;

    constructor(tokenCredential: AzureCommunicationTokenCredential, chatClient: ChatClient) {
        this.tokenCredential = tokenCredential;
        this.chatClient = chatClient;
    }

    public async initialize(sessionInfo: ACSSessionInfo) {
        this.chatThreadClient = await this.chatClient.getChatThreadClient(sessionInfo.threadId);
    }

    public async getMessages() {

    }

    public async getMembers() {

    }

    public async registerOnNewMessage(): Promise<void> {

    }

    public async registerOnThreadUpdate(): Promise<void> {

    }

    public async sendMessage(): Promise<void> {

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