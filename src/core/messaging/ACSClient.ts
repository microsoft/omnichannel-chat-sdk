import { AzureCommunicationTokenCredential, CommunicationUserIdentifier } from "@azure/communication-common";
import { ChatClient, ChatMessage, ChatParticipant, ChatThreadClient } from "@azure/communication-chat";
import { ChatMessageEditedEvent, ChatMessageReceivedEvent, ParticipantsRemovedEvent, StreamingChatMessageChunkReceivedEvent, StreamingChatMessageStartEvent, TypingIndicatorReceivedEvent } from '@azure/communication-signaling';
import { MessagePrinterFactory, PrinterType } from "../../utils/printers/MessagePrinterFactory";

import ACSChatMessageType from "./ACSChatMessageType";
import ACSClientConfig from "./ACSClientConfig";
import { ACSClientLogger } from "../../utils/loggers";
import ACSGetMessagesOptionalParams from "./ACSClientGetMessagesOptionParams";
import ACSParticipantDisplayName from "./ACSParticipantDisplayName";
import ACSRegisterOnNewMessageOptionalParams from "./ACSRegisterOnNewMessageOptionalParams";
import ACSSessionInfo from "./ACSSessionInfo";
import ChatSDKMessage from "./ChatSDKMessage";
import DeliveryMode from "@microsoft/omnichannel-ic3core/lib/model/DeliveryMode";
import LiveChatVersion from "../LiveChatVersion";
import { MessageSource } from "../../telemetry/MessageSource";
import OmnichannelMessage from "./OmnichannelMessage";
import OmnichannelStreamingMessage from "./OmnichannelStreamingMessage";
import OnStreamingMessageOptionalParams from "./OnStreamingMessageOptionalParams";
import TelemetryEvent from "../../telemetry/TelemetryEvent";
import createOmnichannelMessage from "../../utils/createOmnichannelMessage";
import createOmnichannelStreamingMessage from "../../utils/createOmnichannelStreamingMessage";
import { defaultMessageTags } from "./MessageTags";

enum ACSClientEvent {
    InitializeACSClient = 'InitializeACSClient',
    InitializeACSConversation = 'InitializeACSConversation',
    GetParticipants = 'GetParticipants',
    RegisterOnNewMessage = 'RegisterOnNewMessage',
    RegisterOnStreamingMessage = 'RegisterOnStreamingMessage',
    RegisterOnThreadUpdate = 'RegisterOnThreadUpdate',
    OnTypingEvent = 'OnTypingEvent',
    GetMessages = 'GetMessages',
    SendMessage = 'SendMessage',
    SendTyping = 'SendTyping',
    SendReadReceipt = 'SendReadReceipt',
    StartPolling = 'StartPolling',
    StopPolling = 'StopPolling',
    MessageProcessingError = 'MessageProcessingError',
    Disconnect = 'Disconnect'
}

interface EventListenersMapping {
    [key: string]: CallableFunction[];
}

export interface ParticipantMapping {
    [key: string]: ChatParticipant;
}

function* nextDelay() {
    yield* [1000, 1000, 2000, 3000, 5000, 8000, 10000];
}
export class ACSConversation {
    private logger: ACSClientLogger | null = null;
    private tokenCredential: AzureCommunicationTokenCredential;
    private chatClient: ChatClient;
    private chatThreadClient?: ChatThreadClient;
    private sessionInfo?: ACSSessionInfo;
    private participantsMapping?: ParticipantMapping;
    private eventListeners: EventListenersMapping;
    private keepPolling = false;
    private pollingTimer: NodeJS.Timeout | number | null = null;
    private streamSequenceCounters: Map<string, number> = new Map();
    private finalizedMessageIds: Set<string> = new Set();
    private streamingMessageCallback: ((message: OmnichannelStreamingMessage) => void) | null = null;

    constructor(tokenCredential: AzureCommunicationTokenCredential, chatClient: ChatClient, logger: ACSClientLogger | null = null) {
        this.logger = logger;
        this.tokenCredential = tokenCredential;
        this.chatClient = chatClient;
        this.eventListeners = {};
    }

    public async startPolling(): Promise<void> {
        this.logger?.startScenario(ACSClientEvent.StartPolling);
        this.keepPolling = true;
        this.logger?.completeScenario(ACSClientEvent.StartPolling);
    }

    public async stopPolling(): Promise<void> {
        this.logger?.startScenario(ACSClientEvent.StopPolling);
        this.keepPolling = false;
        this.logger?.completeScenario(ACSClientEvent.StopPolling);
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

            throw new Error(JSON.stringify(exceptionDetails));
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

            throw new Error(JSON.stringify(exceptionDetails));
        }

        this.logger?.completeScenario(ACSClientEvent.InitializeACSConversation);
    }

    public async getMessages(optionsParams: ACSGetMessagesOptionalParams = {}): Promise<OmnichannelMessage[] | ChatMessage[]> {
        this.logger?.startScenario(ACSClientEvent.GetMessages);

        const messages = [];

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

                if (optionsParams?.skipConversion === true) {
                    messages.push(chatMessage as ChatMessage)
                } else {
                    messages.push(createOmnichannelMessage(chatMessage as ChatMessage, {
                        liveChatVersion: LiveChatVersion.V2
                    }));
                }

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

        return (optionsParams?.skipConversion === true) ? messages as ChatMessage[] : messages as OmnichannelMessage[];
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

    public async registerOnNewMessage(onNewMessageCallback: CallableFunction, optionalParams: ACSRegisterOnNewMessageOptionalParams = { disablePolling: false }): Promise<void> {
        this.logger?.startScenario(ACSClientEvent.RegisterOnNewMessage);
        const postedMessageIds = new Set();

        try {
            // Initial polls with exponential backoff then poll every 10 seconds by default
            const pollForMessages = async (delayGenerator: Generator<number, void, unknown>) => {
                if (this.keepPolling) {
                    try {
                        const messages = await this.getMessages({ skipConversion: true });
                        for (const message of messages.reverse()) {
                            try {
                                const { id, senderDisplayName } = message as ChatMessage;
                                const customerMessageCondition = senderDisplayName === ACSParticipantDisplayName.Customer;
                                // Filter out customer messages
                                if (customerMessageCondition) {
                                    continue;
                                }

                                // Filter out duplicate messages
                                if (!postedMessageIds.has(id)) {
                                    this.logger?.recordIndividualEvent(TelemetryEvent.MessageReceived, MessageSource.Polling, MessagePrinterFactory.printifyMessage(message, PrinterType.Polling));
                                    onNewMessageCallback(message);
                                    postedMessageIds.add(id);
                                }
                            } catch (error) {
                                // Surface message-processing failures instead of
                                // swallowing them. Keep iterating so a single bad
                                // message does not stop the rest of the batch.
                                //
                                // Record only the error type (error.name), never the
                                // error message/object/stack or any service response.
                                // error.message can embed customer/conversation data
                                // (e.g. a consumer callback or the ACS SDK may include
                                // message content or identifiers), so we deliberately
                                // exclude it from both telemetry and the console.
                                const errorName = (error as Error)?.name ?? 'Error';
                                const errorMessage = `[ACSClient][registerOnNewMessage] Error occurred while processing messages: ${errorName}`;

                                this.logger?.failScenario(ACSClientEvent.MessageProcessingError, {
                                    ExceptionDetails: errorMessage
                                });

                                // Always emit a console warning so consumers without
                                // access to telemetry still know a message failed to
                                // process. The message is static apart from the safe
                                // error type, so no error content can leak.
                                console.warn(errorMessage);
                            }

                        }
                    } catch {
                        // Ignore polling failures
                    }
                }

                const defaultInterval = optionalParams.pollingInterval || 10000;
                const delay = delayGenerator.next();
                this.pollingTimer = setTimeout(() => {
                    pollForMessages(delayGenerator);
                }, delay.done === true ? defaultInterval : delay.value);
            };

            await this.startPolling();
            if (optionalParams.disablePolling === false) {
                const delayGenerator = nextDelay();
                await pollForMessages(delayGenerator);
            }

            const listener = (event: ChatMessageReceivedEvent | ChatMessageEditedEvent) => {
                const { id, sender } = event;

                const customerMessageCondition = ((sender as CommunicationUserIdentifier).communicationUserId === (this.sessionInfo?.id as string));
                const isChatMessageEditedEvent = Object.keys(event).includes("editedOn");

                // Filter out customer messages
                if (customerMessageCondition) {
                    return;
                }

                // Route streaming finals that arrive on chatMessageReceived to the streaming callback.
                // ACS may deliver the final streaming message as event 200 (chatMessageReceived) instead
                // of event 251 (streamingChatMessageChunkReceived). Detect this by checking streamingMetadata.
                const streamingType = (event as ChatMessageReceivedEvent).streamingMetadata?.streamingMessageType;
                if (streamingType === 'final' && this.streamingMessageCallback) {
                    try {
                        const streamingMessage = createOmnichannelStreamingMessage(event as unknown as StreamingChatMessageChunkReceivedEvent, {
                            liveChatVersion: LiveChatVersion.V2,
                            eventName: 'streamingChatMessageChunkReceived',
                            sequenceCounters: this.streamSequenceCounters,
                            finalizedMessageIds: this.finalizedMessageIds,
                            logger: this.logger,
                        });
                        if (streamingMessage) {
                            this.streamingMessageCallback(streamingMessage);
                            this.logger?.recordIndividualEvent(
                                TelemetryEvent.StreamingMessageReceived,
                                MessageSource.WebSocketStreaming,
                                MessagePrinterFactory.printifyMessage(event, PrinterType.Streaming)
                            );
                        }
                    } catch (err) {
                        this.logger?.recordIndividualEvent(
                            TelemetryEvent.StreamingHandlerThrew,
                            MessageSource.WebSocketStreaming,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            { messageId: event.id, error: `${err}`, source: 'chatMessageReceivedFinalRouting' } as any
                        );
                    }
                } else if (streamingType && streamingType !== 'final') {
                    // Unexpected: chatMessageReceived should only carry 'final' streaming metadata.
                    // Log for observability but still deliver to onNewMessage below.
                    this.logger?.recordIndividualEvent(
                        TelemetryEvent.StreamingUnexpectedTypeOnNewMessage,
                        MessageSource.WebSocketStreaming,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        { messageId: event.id, streamingType } as any
                    );
                }

                // Filter out duplicate messages
                if (postedMessageIds.has(id) && !isChatMessageEditedEvent) {
                    return;
                }
                // Always deliver to onNewMessage for backward compatibility
                onNewMessageCallback(event);
                postedMessageIds.add(id);
                this.logger?.recordIndividualEvent(TelemetryEvent.MessageReceived, MessageSource.WebSocket, MessagePrinterFactory.printifyMessage(event, PrinterType.WebSocket));
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

    public async registerOnStreamingMessage(
        onStreamingMessageCallback: (message: OmnichannelStreamingMessage) => void,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        optionalParams: OnStreamingMessageOptionalParams = {}
    ): Promise<void> {
        this.logger?.startScenario(ACSClientEvent.RegisterOnStreamingMessage);

        // Guard against duplicate registration — remove previous listeners before adding new ones.
        // This prevents listener leaks if the consumer calls onStreamingMessage() multiple times.
        if (this.streamingMessageCallback) {
            this.logger?.recordIndividualEvent(
                TelemetryEvent.StreamingRegistrationReplaced,
                MessageSource.WebSocketStreaming,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { reason: 'registerOnStreamingMessage called while already registered' } as any
            );
            const existingStartListeners = this.eventListeners['streamingChatMessageStarted'] ?? [];
            const existingChunkListeners = this.eventListeners['streamingChatMessageChunkReceived'] ?? [];
            for (const listener of existingStartListeners) {
                this.chatClient?.off('streamingChatMessageStarted' as any, listener as any); // eslint-disable-line @typescript-eslint/no-explicit-any
            }
            for (const listener of existingChunkListeners) {
                this.chatClient?.off('streamingChatMessageChunkReceived' as any, listener as any); // eslint-disable-line @typescript-eslint/no-explicit-any
            }
            this.eventListeners['streamingChatMessageStarted'] = [];
            this.eventListeners['streamingChatMessageChunkReceived'] = [];
        }

        // Store reference so chatMessageReceived listener can route streaming finals
        this.streamingMessageCallback = onStreamingMessageCallback;

        try {
            const invokeWithIsolation = (event: { id: string }, message: OmnichannelStreamingMessage) => {
                const result = onStreamingMessageCallback(message) as unknown;
                if (result && typeof (result as Promise<unknown>).catch === 'function') {
                    (result as Promise<unknown>).catch((rejected: unknown) => {
                        this.logger?.recordIndividualEvent(
                            TelemetryEvent.StreamingHandlerAsyncRejected,
                            MessageSource.WebSocketStreaming,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            { messageId: event.id, error: `${rejected}` } as any
                        );
                    });
                }
            };

            const onStart = (event: StreamingChatMessageStartEvent) => {
                try {
                    const message = createOmnichannelStreamingMessage(event, {
                        liveChatVersion: LiveChatVersion.V2,
                        eventName: 'streamingChatMessageStarted',
                        sequenceCounters: this.streamSequenceCounters,
                        finalizedMessageIds: this.finalizedMessageIds,
                        logger: this.logger,
                    });
                    if (message === undefined) {
                        return;
                    }
                    this.logger?.recordIndividualEvent(
                        TelemetryEvent.StreamingMessageReceived,
                        MessageSource.WebSocketStreaming,
                        MessagePrinterFactory.printifyMessage(event, PrinterType.Streaming)
                    );
                    invokeWithIsolation(event, message);
                } catch (err) {
                    this.logger?.recordIndividualEvent(
                        TelemetryEvent.StreamingHandlerThrew,
                        MessageSource.WebSocketStreaming,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        { messageId: event.id, error: `${err}` } as any
                    );
                }
            };

            const onChunk = (event: StreamingChatMessageChunkReceivedEvent) => {
                try {
                    const message = createOmnichannelStreamingMessage(event, {
                        liveChatVersion: LiveChatVersion.V2,
                        eventName: 'streamingChatMessageChunkReceived',
                        sequenceCounters: this.streamSequenceCounters,
                        finalizedMessageIds: this.finalizedMessageIds,
                        logger: this.logger,
                    });
                    if (message === undefined) {
                        return;
                    }
                    this.logger?.recordIndividualEvent(
                        TelemetryEvent.StreamingMessageReceived,
                        MessageSource.WebSocketStreaming,
                        MessagePrinterFactory.printifyMessage(event, PrinterType.Streaming)
                    );
                    invokeWithIsolation(event, message);

                    // Backwards-compat fire-through: when a streaming message reaches
                    // "final", also deliver it to chatMessageReceived listeners so
                    // consumers using only onNewMessage still see the complete message.
                    if (message.streamingMetadata.streamingMessageType === 'final') {
                        const newMessageListeners = this.eventListeners['chatMessageReceived'] ?? [];
                        for (const listener of newMessageListeners) {
                            try {
                                listener(event);
                            } catch (err) {
                                this.logger?.recordIndividualEvent(
                                    TelemetryEvent.StreamingHandlerThrew,
                                    MessageSource.WebSocketStreaming,
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    { messageId: event.id, error: `${err}`, source: 'newMessageFireThrough' } as any
                                );
                            }
                        }
                    }
                } catch (err) {
                    this.logger?.recordIndividualEvent(
                        TelemetryEvent.StreamingHandlerThrew,
                        MessageSource.WebSocketStreaming,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        { messageId: event.id, error: `${err}` } as any
                    );
                }
            };

            this.chatClient?.on('streamingChatMessageStarted', onStart);
            this.chatClient?.on('streamingChatMessageChunkReceived', onChunk);
            this.trackListener('streamingChatMessageStarted', onStart);
            this.trackListener('streamingChatMessageChunkReceived', onChunk);

            this.logger?.completeScenario(ACSClientEvent.RegisterOnStreamingMessage);
        } catch (error) {
            const exceptionDetails = { errorObject: `${error}` };
            this.logger?.failScenario(ACSClientEvent.RegisterOnStreamingMessage, {
                ExceptionDetails: JSON.stringify(exceptionDetails),
            });

            throw new Error(`${ACSClientEvent.RegisterOnStreamingMessage}: ${error}`);
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
                const { sender, recipient } = event;

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

    public async sendMessage(message: ChatSDKMessage): Promise<OmnichannelMessage> {
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
            const response = await this.chatThreadClient?.sendMessage(sendMessageRequest, sendMessageOptions);
            this.logger?.completeScenario(ACSClientEvent.SendMessage);

            if (response?.id) {
                const chatMessage = {
                    id: response?.id,
                    content: message.content,
                    sender: { communicationUserId: this.sessionInfo?.id as string },
                    displayName: sendMessageOptions.senderDisplayName,
                    metadata: {
                        tags: defaultMessageTags.join(',')
                    },
                    createdOn: new Date(parseInt(response?.id)) || response?.id
                };

                return createOmnichannelMessage(chatMessage as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
                    liveChatVersion: LiveChatVersion.V2
                });
            }
        } catch (error) {
            const exceptionDetails = {
                response: 'SendMessageFailed',
                errorObject: `${error}`
            };

            this.logger?.failScenario(ACSClientEvent.SendMessage, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            throw error;
        }

        return {} as OmnichannelMessage;
    }

    public async sendTyping(): Promise<void> {
        this.logger?.startScenario(ACSClientEvent.SendTyping);

        try {
            await this.chatThreadClient?.sendTypingNotification();
            this.logger?.completeScenario(ACSClientEvent.SendTyping);
        } catch (error) {
            const exceptionDetails = {
                response: 'SendTypingFailed',
                errorObject: `${error}`
            };

            this.logger?.failScenario(ACSClientEvent.SendTyping, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            throw new Error('SendTypingFailed');
        }
    }

    public async sendReadReceipt(messageId: string): Promise<void> {
        this.logger?.startScenario(ACSClientEvent.SendReadReceipt);

        try {
            await this.chatThreadClient?.sendReadReceipt({ chatMessageId: messageId });
            this.logger?.completeScenario(ACSClientEvent.SendReadReceipt);
        } catch (error) {
            const exceptionDetails = {
                response: 'SendReadReceiptFailed',
                errorObject: `${error}`
            };

            this.logger?.failScenario(ACSClientEvent.SendReadReceipt, {
                ExceptionDetails: JSON.stringify(exceptionDetails)
            });

            throw new Error('SendReadReceiptFailed');
        }
    }

    public async sendFileMessage(): Promise<void> {
        return undefined;
    }

    public async sendFileData(): Promise<void> {
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

            await this.stopPolling();
            if (this.pollingTimer) {
                clearTimeout(this.pollingTimer as number);
            }

            // Clear streaming state to prevent memory leaks across sessions
            this.streamSequenceCounters.clear();
            this.finalizedMessageIds.clear();
            this.streamingMessageCallback = null;

            this.logger?.completeScenario(ACSClientEvent.Disconnect);
        } catch {
            this.logger?.failScenario(ACSClientEvent.Disconnect);
        }
    }

    private async createParticipantsMapping() {
        const participants = await this.getParticipants();
        const participantsMapping = {};
        for (const participant of participants) {
            const { id } = participant;

            if (!Object.keys(participantsMapping).includes((id as CommunicationUserIdentifier).communicationUserId)) {
                Object.assign(participantsMapping, { [(id as CommunicationUserIdentifier).communicationUserId]: participant });
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

    public addListener(event: string, listener: CallableFunction): void {
        this.chatClient?.on(event as any, listener as any);  // eslint-disable-line @typescript-eslint/no-explicit-any
        this.trackListener(event, listener);
    }

    public removeListener(event: string, listener: CallableFunction): void {
        // Remove from tracked listeners
        if (event in this.eventListeners) {
            const index = this.eventListeners[event].indexOf(listener);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }

        // Unregister from ACS SDK
        try {
            this.chatClient?.off(event as any, listener as any);  // eslint-disable-line @typescript-eslint/no-explicit-any
        } catch (error) {
            // Silently ignore unregister failures
        }
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

            throw new Error( JSON.stringify(exceptionDetails));
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

            throw new Error(JSON.stringify(exceptionDetails));
        }

        this.logger?.completeScenario(ACSClientEvent.InitializeACSClient);
    }

    public async joinConversation(sessionInfo: ACSSessionInfo): Promise<ACSConversation> {
        const conversation = new ACSConversation(this.tokenCredential as AzureCommunicationTokenCredential, this.chatClient as ChatClient, this.logger);
        await conversation.initialize(sessionInfo);
        return conversation;
    }

    public getChatClient(): ChatClient | null {
        return this.chatClient;
    }
}

export default ACSClient;
