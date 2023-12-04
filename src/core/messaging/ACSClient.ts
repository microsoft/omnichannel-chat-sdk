import ACSChatMessageType from "./ACSChatMessageType";
import ACSClientConfig from "./ACSClientConfig";
import { ACSClientLogger } from "../../utils/loggers";
import ACSParticipantDisplayName from "./ACSParticipantDisplayName";
import ACSSessionInfo from "./ACSSessionInfo";
import { ChatClient, ChatParticipant, ChatThreadClient, ChatMessage } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential, CommunicationUserIdentifier } from "@azure/communication-common";
import { ChatMessageReceivedEvent, ChatMessageEditedEvent, ParticipantsRemovedEvent, TypingIndicatorReceivedEvent } from '@azure/communication-signaling';
import ChatSDKMessage from "./ChatSDKMessage";
import createOmnichannelMessage from "../../utils/createOmnichannelMessage";
import { defaultMessageTags } from "./MessageTags";
import DeliveryMode from "@microsoft/omnichannel-ic3core/lib/model/DeliveryMode";
import LiveChatVersion from "../LiveChatVersion";
import OmnichannelMessage from "./OmnichannelMessage";

enum ACSClientEvent {
    InitializeACSClient = 'InitializeACSClient',
    InitializeACSConversation = 'InitializeACSConversation',
    GetParticipants = 'GetParticipants',
    RegisterOnNewMessage = 'RegisterOnNewMessage',
    RegisterOnThreadUpdate = 'RegisterOnThreadUpdate',
    OnTypingEvent = 'OnTypingEvent',
    GetMessages = 'GetMessages',
    SendMessage = 'SendMessage',
    SendTyping = 'SendTyping',
    Disconnect = 'Disconnect'
}

interface EventListenersMapping {
    [key: string]: CallableFunction[];
}

export interface ParticipantMapping {
    [key: string]: ChatParticipant;
}

export class ACSConversation {
    private logger: ACSClientLogger | null = null;
    private tokenCredential: AzureCommunicationTokenCredential;
    private chatClient: ChatClient;
    private chatThreadClient?: ChatThreadClient;
    private sessionInfo?: ACSSessionInfo;
    private participantsMapping?: ParticipantMapping;
    private eventListeners: EventListenersMapping;

    constructor(tokenCredential: AzureCommunicationTokenCredential, chatClient: ChatClient, logger: ACSClientLogger | null = null) {
        this.logger = logger;
        this.tokenCredential = tokenCredential;
        this.chatClient = chatClient;
        this.eventListeners = {};
    }

    public async initialize(sessionInfo: ACSSessionInfo): Promise<void> {
        this.logger?.startScenario(ACSClientEvent.InitializeACSConversation);

        this.sessionInfo = sessionInfo;

        try {
            this.chatThreadClient = await this.chatClient?.getChatThreadClient(sessionInfo.threadId as string);
        } catch (error) {
            const exceptionDetails = {
                response: 'ChatClientGetChatThreadClientFailure',
                errorObject: `${error}`
            };

            this.logger?.failScenario(ACSClientEvent.InitializeACSConversation, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            throw new Error("GetChatThreadClientFailed");
        }

        try {
            await this.chatClient.startRealtimeNotifications();
        } catch (error) {
            const exceptionDetails = {
                response: 'StartRealtimeNotificationsFailed',
                errorObject: `${error}`
            };

            this.logger?.failScenario(ACSClientEvent.InitializeACSConversation, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            throw new Error(exceptionDetails.response);
        }

        this.logger?.completeScenario(ACSClientEvent.InitializeACSConversation);
    }

    public async getMessages(): Promise<OmnichannelMessage[]> {
        this.logger?.startScenario(ACSClientEvent.GetMessages);

        const messages: OmnichannelMessage[] = [];

        try {
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

                const omnichannelMessage = createOmnichannelMessage(chatMessage as ChatMessage, {
                    liveChatVersion: LiveChatVersion.V2
                });

                messages.push(omnichannelMessage);

                nextMessage = await pagedAsyncIterableIterator.next();
            }

            this.logger?.completeScenario(ACSClientEvent.GetMessages);
        } catch (error) {
            const exceptionDetails = {
                errorObject: `${error}`
            };

            this.logger?.failScenario(ACSClientEvent.GetMessages, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            throw new Error(ACSClientEvent.GetMessages);
        }

        return messages;
    }

    public async getParticipants(): Promise<ChatParticipant[]> {
        this.logger?.startScenario(ACSClientEvent.GetParticipants);

        const participants: ChatParticipant[] = [];

        try {
            const pagedAsyncIterableIterator = await (this.chatThreadClient as ChatThreadClient).listParticipants();
            let next = await pagedAsyncIterableIterator.next();
            while (!next.done) {
                const user = next.value;
                participants.push(user);
                next = await pagedAsyncIterableIterator.next();
            }

            this.logger?.completeScenario(ACSClientEvent.GetParticipants);
        } catch (error) {
            const exceptionDetails = {
                errorObject: `${error}`
            };

            this.logger?.failScenario(ACSClientEvent.GetParticipants, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            throw new Error(ACSClientEvent.GetParticipants);
        }

        return participants;
    }

    public async registerOnNewMessage(onNewMessageCallback: CallableFunction): Promise<void> {
        this.logger?.startScenario(ACSClientEvent.RegisterOnNewMessage);

        let isReceivingNotifications = false;
        const postedMessageIds = new Set();

        try {
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

            const listener = (event: ChatMessageReceivedEvent | ChatMessageEditedEvent) => {
                isReceivingNotifications = true;

                const {id, sender} = event;

                const customerMessageCondition = ((sender as CommunicationUserIdentifier).communicationUserId === (this.sessionInfo?.id as string));
                const isChatMessageEditedEvent = Object.keys(event).includes("editedOn");

                // Filter out customer messages
                if (customerMessageCondition) {
                    return;
                }

                // Filter out duplicate messages
                if (postedMessageIds.has(id) && !isChatMessageEditedEvent) {
                    return;
                }

                if (event.message) {
                    Object.assign(event, {content: event.message});
                }

                onNewMessageCallback(event);
                postedMessageIds.add(id);
            }

            this.chatClient?.on("chatMessageReceived", listener);
            this.chatClient?.on("chatMessageEdited", listener);
            this.trackListener("chatMessageReceived", listener);
            this.trackListener("chatMessageEdited", listener);
            this.logger?.completeScenario(ACSClientEvent.RegisterOnNewMessage);
        } catch (error) {
            const exceptionDetails = {
                errorObject: `${error}`
            };

            this.logger?.failScenario(ACSClientEvent.RegisterOnNewMessage, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            throw new Error(ACSClientEvent.RegisterOnNewMessage);
        }
    }

    public async registerOnThreadUpdate(onThreadUpdateCallback: CallableFunction): Promise<void> {
        this.logger?.startScenario(ACSClientEvent.RegisterOnThreadUpdate);

        try {
            const listener = (event: ParticipantsRemovedEvent) => {
                onThreadUpdateCallback(event);
            };

            this.chatClient?.on("participantsRemoved", listener);
            this.trackListener("participantsRemoved", listener);
            this.logger?.completeScenario(ACSClientEvent.RegisterOnThreadUpdate);
        } catch (error) {
            this.logger?.failScenario(ACSClientEvent.RegisterOnThreadUpdate);
        }
    }

    public async onTypingEvent(onTypingEventCallback: CallableFunction): Promise<void> {
        this.logger?.startScenario(ACSClientEvent.OnTypingEvent);

        try {
            const listener = (event: TypingIndicatorReceivedEvent) => {
                const {sender, recipient} = event;

                // Ignore participant's own typing events
                if ((sender as any).communicationUserId === (recipient as any).communicationUserId) { // eslint-disable-line @typescript-eslint/no-explicit-any
                  return;
                }

                onTypingEventCallback(event);
            }

            this.chatClient?.on("typingIndicatorReceived", listener);
            this.trackListener("typingIndicatorReceived", listener);
            this.logger?.completeScenario(ACSClientEvent.OnTypingEvent);
        } catch (error) {
            this.logger?.failScenario(ACSClientEvent.OnTypingEvent);
        }
    }

    public async sendMessage(message: ChatSDKMessage): Promise<void> {
        this.logger?.startScenario(ACSClientEvent.SendMessage);

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
                tags: defaultMessageTags.join(','),
                ...message.metadata
            }
        }

        try {
            await this.chatThreadClient?.sendMessage(sendMessageRequest, sendMessageOptions);
            this.logger?.completeScenario(ACSClientEvent.SendMessage);
        } catch (error) {
            this.logger?.failScenario(ACSClientEvent.SendMessage);

            throw new Error('SendMessageFailed');
        }
    }

    public async sendTyping(): Promise<void> {
        this.logger?.startScenario(ACSClientEvent.SendTyping);

        try {
            await this.chatThreadClient?.sendTypingNotification();
            this.logger?.completeScenario(ACSClientEvent.SendTyping);
        } catch {
            this.logger?.failScenario(ACSClientEvent.SendTyping);
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
        this.logger?.startScenario(ACSClientEvent.Disconnect);

        try {
            for (const [event, listeners] of Object.entries(this.eventListeners)) {
                listeners.forEach(listener => {
                    this.chatClient.off(event as any, listener as any);  // eslint-disable-line @typescript-eslint/no-explicit-any
                });
            }

            this.logger?.completeScenario(ACSClientEvent.Disconnect);
        } catch {
            this.logger?.failScenario(ACSClientEvent.Disconnect);
        }
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

    private trackListener(event: string, listener: CallableFunction) {
        if (!(event in this.eventListeners)) {
            this.eventListeners[event] = [];
        }

        this.eventListeners[event].push(listener);
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
        this.logger?.startScenario(ACSClientEvent.InitializeACSClient);

        const tokenRefresher = async () => {
            if (acsClientConfig.tokenRefresher) {
                const token = await acsClientConfig.tokenRefresher();
                return token;
            }

            return acsClientConfig.token;
        };

        try {
            this.tokenCredential = new AzureCommunicationTokenCredential({
                token: acsClientConfig.token,
                tokenRefresher, // tokenRefresher is executed when token found to be expired on performing HTTP calls
                refreshProactively: true // Flag to whether refresh token 10 mins it expires
            });
        } catch (error) {
            const exceptionDetails = {
                response: 'CreateTokenCredentialFailure',
                errorObject: `${error}`
            };

            this.logger?.failScenario(ACSClientEvent.InitializeACSClient, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            throw new Error('CreateTokenCredentialFailed');
        }

        try {
            this.chatClient = new ChatClient(acsClientConfig.environmentUrl, this.tokenCredential);
        } catch (error) {
            const exceptionDetails = {
                response: 'CreateChatClientFailure',
                errorObject: `${error}`
            };

            this.logger?.failScenario(ACSClientEvent.InitializeACSClient, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            throw new Error('CreateChatClientFailed');
        }

        this.logger?.completeScenario(ACSClientEvent.InitializeACSClient);
    }

    public async joinConversation(sessionInfo: ACSSessionInfo): Promise<ACSConversation> {
        const conversation = new ACSConversation(this.tokenCredential as AzureCommunicationTokenCredential, this.chatClient as ChatClient, this.logger);
        await conversation.initialize(sessionInfo);
        return conversation;
    }

    public getChatClient() : ChatClient | null {
        return this.chatClient;
    }
}

export default ACSClient;