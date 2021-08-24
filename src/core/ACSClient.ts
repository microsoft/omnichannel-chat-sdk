import { ChatClient, ChatMessage, ChatParticipant, ChatThreadClient } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential, CommunicationUserIdentifier } from "@azure/communication-common";
import { ChatMessageReceivedEvent, ParticipantsRemovedEvent, TypingIndicatorReceivedEvent } from '@azure/communication-signaling';
import DeliveryMode from "@microsoft/omnichannel-ic3core/lib/model/DeliveryMode";
import ACSParticipantDisplayName from "./ACSParticipantDisplayName";

export interface ACSSessionInfo {
    id: string;
    threadId: string;
    pollingInterval: number;
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

    public async initialize(sessionInfo: ACSSessionInfo): Promise<void> {
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
            const chatMessage = nextMessage.value;

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
           const user = next.value;
           participants.push(user);
           next = await pagedAsyncIterableIterator.next();
        }

        return participants;
    }

    public async registerOnNewMessage(onNewMessageCallback: CallableFunction): Promise<void> {
        let isReceivingNotifications = false;
        const postedMessageIds = new Set()

        const pollForMessages = async (delay: number) => {
            if (isReceivingNotifications) {
              return;
            }

            // Poll messages until WS established connection
            const messages = await this.getMessages();
            for (const message of messages.reverse()) {
                const {id, sender} = message;
                const customerMessageCondition = ((sender as CommunicationUserIdentifier).communicationUserId === (this.sessionInfo?.id as string))

                // Filter out customer messages
                if (customerMessageCondition) {
                    return;
                }

                if (!postedMessageIds.has(id)) {
                    onNewMessageCallback(message);
                    postedMessageIds.add(id);
                }
            }

            setTimeout(() => {
                pollForMessages(delay);
            }, delay);
        };

        await pollForMessages(this.sessionInfo?.pollingInterval as number);

        this.chatClient?.on("chatMessageReceived", (event: ChatMessageReceivedEvent) => {
            isReceivingNotifications = true;

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

    public async onTypingEvent(onTypingEventCallback: CallableFunction): Promise<void> {
        this.chatClient?.on("typingIndicatorReceived", (event: TypingIndicatorReceivedEvent) => {
            onTypingEventCallback(event);
        });
    }

    public async sendMessage(message: any): Promise<void> {
        const sendMessageRequest = {
            content: message.content,
        }

        const sendMessageOptions = {
            senderDisplayName: ACSParticipantDisplayName.Customer,
            metadata: {
                deliveryMode: DeliveryMode.Bridged,
                tags: 'ChannelId-lcw'
            }
        }

        try {
            const response = await this.chatThreadClient?.sendMessage(sendMessageRequest, sendMessageOptions);
            console.log(response);
        } catch (error) {
            throw new Error('SendMessageFailed');
        }
    }

    public async sendFileMessage(): Promise<void> {

    }

    public async sendFileData():  Promise<void> {

    }

    public async uploadFile(): Promise<void> {

    }

    public async downloadFile(): Promise<void> {

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