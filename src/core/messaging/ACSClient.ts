import ACSChatMessageType from "./ACSChatMessageType";
import ACSClientConfig from "./ACSClientConfig";
import { ACSClientLogger } from "../../utils/loggers";
import ACSParticipantDisplayName from "./ACSParticipantDisplayName";
import ACSSessionInfo from "./ACSSessionInfo";
import { ChatClient, ChatParticipant, ChatThreadClient, ChatMessage } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential, CommunicationUserIdentifier } from "@azure/communication-common";
import { ChatMessageReceivedEvent, ParticipantsRemovedEvent, TypingIndicatorReceivedEvent } from '@azure/communication-signaling';
import ChatSDKMessage from "./ChatSDKMessage";
import createOmnichannelMessage from "../../utils/createOmnichannelMessage";
import { defaultMessageTags } from "./MessageTags";
import DeliveryMode from "@microsoft/omnichannel-ic3core/lib/model/DeliveryMode";
import LiveChatVersion from "../LiveChatVersion";
import LogLevel from "../../telemetry/LogLevel";
import OmnichannelMessage from "./OmnichannelMessage";

export interface participantMapping {
    [key: string]: ChatParticipant;
}

enum ACSClientEvent {
    InitializeACSClient = 'InitializeACSClient',
    GetParticipants = 'GetParticipants',
    RegisterOnNewMessage = 'RegisterOnNewMessage',
    RegisterOnThreadUpdate = 'RegisterOnThreadUpdate',
    OnTypingEvent = 'OnTypingEvent',
    GetMessages = 'GetMessages',
    SendMessage = 'SendMessage',
    SendTyping = 'SendTyping',
}

export class ACSConversation {
    private logger: ACSClientLogger | null = null;
    private tokenCredential: AzureCommunicationTokenCredential;
    private chatClient: ChatClient;
    private chatThreadClient?: ChatThreadClient;
    private sessionInfo?: ACSSessionInfo;
    private participantsMapping?: participantMapping;

    constructor(tokenCredential: AzureCommunicationTokenCredential, chatClient: ChatClient, logger: ACSClientLogger | null = null) {
        this.logger = logger;
        this.tokenCredential = tokenCredential;
        this.chatClient = chatClient;
    }

    public async initialize(sessionInfo: ACSSessionInfo): Promise<void> {
        this.logger?.logClientSdkTelemetryEvent(LogLevel.INFO, {
            Event: `${ACSClientEvent.InitializeACSClient}Started`,
        });

        this.sessionInfo = sessionInfo;

        try {
            this.chatThreadClient = await this.chatClient?.getChatThreadClient(sessionInfo.threadId as string);
        } catch (error) {
            const telemetryData = {
                Event: `${ACSClientEvent.InitializeACSClient}Failed`,
                ExceptionDetails: `${error}`
            };

            this.logger?.logClientSdkTelemetryEvent(LogLevel.ERROR, telemetryData);

            throw new Error('GetChatThreadClientFailed');
        }

        try {
            await this.chatClient.startRealtimeNotifications();
        } catch (error) {
            const telemetryData = {
                Event: `${ACSClientEvent.InitializeACSClient}Failed`,
                ExceptionDetails: `${error}`
            };

            this.logger?.logClientSdkTelemetryEvent(LogLevel.ERROR, telemetryData);

            throw new Error('StartRealtimeNotificationsFailed');
        }

        this.participantsMapping = await this.createParticipantsMapping();

        this.logger?.logClientSdkTelemetryEvent(LogLevel.INFO, {
            Event: `${ACSClientEvent.InitializeACSClient}Completed`,
        });
    }

    public async getMessages(): Promise<OmnichannelMessage[]> {
        const messages: OmnichannelMessage[] = [];
        const pagedAsyncIterableIterator = await (this.chatThreadClient as ChatThreadClient).listMessages();
        let nextMessage = await pagedAsyncIterableIterator.next();
        while (!nextMessage.done) {
            const chatMessage = nextMessage.value;

            // Filter text type messages only
            if (chatMessage.type !== ACSChatMessageType.Text) {
                nextMessage = await pagedAsyncIterableIterator.next();
                continue;
            }

            // Flatten out message content
            if (chatMessage.content?.message) {
                Object.assign(chatMessage, {content: chatMessage.content?.message});
            }

            const {sender} = chatMessage;

            // Add alias to differentiate sender type
            const participant = (this.participantsMapping as participantMapping)[(sender as CommunicationUserIdentifier).communicationUserId];
            Object.assign(chatMessage.sender, {alias: participant.displayName});

            const omnichannelMessage = createOmnichannelMessage(chatMessage as ChatMessage, {
                liveChatVersion: LiveChatVersion.V2
            });

            messages.push(omnichannelMessage);

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
        const postedMessageIds = new Set();

        const pollForMessages = async (delay: number) => {
            if (isReceivingNotifications) {
              return;
            }

            try {
                const messages = await this.getMessages();
                for (const message of messages.reverse()) {
                    const {id, sender} = message;
                    const customerMessageCondition = sender.displayName === ACSParticipantDisplayName.Customer;

                    // Filter out customer messages
                    if (customerMessageCondition) {
                        continue;
                    }

                    // Filter out duplicate messages
                    if (!postedMessageIds.has(id)) {
                        onNewMessageCallback(message);
                        postedMessageIds.add(id);
                    }
                }
            } catch {
                // Ignore polling failures
            }

            setTimeout(() => {
                pollForMessages(delay);
            }, delay);
        };

        // Poll messages until WS established connection
        await pollForMessages(this.sessionInfo?.pollingInterval as number);

        this.chatClient?.on("chatMessageReceived", (event: ChatMessageReceivedEvent) => {
            isReceivingNotifications = true;

            const {id, sender} = event;

            const customerMessageCondition = ((sender as CommunicationUserIdentifier).communicationUserId === (this.sessionInfo?.id as string))

            // Filter out customer messages
            if (customerMessageCondition) {
                return;
            }

            // Filter out duplicate messages
            if (postedMessageIds.has(id)) {
                return;
            }

            if (event.message) {
                Object.assign(event, {content: event.message});
            }

            // Add alias to differentiate sender type
            const participant = (this.participantsMapping as participantMapping)[(sender as CommunicationUserIdentifier).communicationUserId];
            Object.assign(event.sender, {alias: participant.displayName});

            onNewMessageCallback(event);
            postedMessageIds.add(id);
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

    public async sendMessage(message: ChatSDKMessage): Promise<void> {
        if (!message.metadata) {
            message.metadata = {};
        }

        const sendMessageRequest = {
            content: message.content,
        }

        const sendMessageOptions = {
            senderDisplayName: ACSParticipantDisplayName.Customer,
            metadata: {
                deliveryMode: DeliveryMode.Bridged,
                tags: JSON.stringify([defaultMessageTags]),
                ...message.metadata
            }
        }

        try {
            await this.chatThreadClient?.sendMessage(sendMessageRequest, sendMessageOptions);
        } catch (error) {
            throw new Error('SendMessageFailed');
        }
    }

    public async sendTyping(): Promise<void> {
        try {
            await this.chatThreadClient?.sendTypingNotification();
        } catch {
            throw new Error('SendTypingFailed');
        }
    }

    public async sendFileMessage(): Promise<void> {
        return undefined;
    }

    public async sendFileData():  Promise<void> {
        return undefined;
    }

    public async uploadFile(): Promise<void> {
        return undefined;
    }

    public async downloadFile(): Promise<void> {
        return undefined;
    }

    public async disconnect(): Promise<void> {
        return undefined;
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
    private logger: ACSClientLogger | null = null;
    private tokenCredential: AzureCommunicationTokenCredential | null = null;
    private chatClient: ChatClient | null = null;

    public constructor(logger: ACSClientLogger | null = null) {
        this.logger = logger;
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
        const conversation = new ACSConversation(this.tokenCredential as AzureCommunicationTokenCredential, this.chatClient as ChatClient, this.logger);
        await conversation.initialize(sessionInfo);
        return conversation;
    }
}

export default ACSClient;