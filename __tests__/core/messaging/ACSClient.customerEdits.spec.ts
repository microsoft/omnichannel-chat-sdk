import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { ChatClient, ChatMessage, ChatThreadClient } from "@azure/communication-chat";
import { ChatMessageEditedEvent, ChatMessageReceivedEvent } from "@azure/communication-signaling";
import { ACSConversation } from "../../../src/core/messaging/ACSClient";
import ACSRegisterOnNewMessageOptionalParams from "../../../src/core/messaging/ACSRegisterOnNewMessageOptionalParams";
import { ACSClientLogger } from "../../../src/utils/loggers";
import LiveChatVersion from "../../../src/core/LiveChatVersion";
import createOmnichannelMessage from "../../../src/utils/createOmnichannelMessage";

jest.mock("@azure/communication-common");
jest.mock("@azure/communication-chat");

const original = (): ChatMessageReceivedEvent => ({
    id: "message",
    threadId: "thread",
    sender: { kind: "communicationUser", communicationUserId: "customer" },
    recipient: { kind: "communicationUser", communicationUserId: "customer" },
    senderDisplayName: "Customer",
    type: "Text",
    message: "Original customer content",
    metadata: { tags: "ChannelId-lcw,FromCustomer" },
    version: "1720000000000",
    createdOn: new Date(1720000000000)
});

const edited = (message = "Corrected customer content", version = "1720000000001"): ChatMessageEditedEvent => ({
    ...original(),
    message,
    version,
    editedOn: new Date(1720000000001)
});

const snapshot = (message: ChatMessageReceivedEvent | ChatMessageEditedEvent): ChatMessage => ({
    id: message.id,
    type: "text",
    sequenceId: "1",
    version: message.version,
    sender: message.sender,
    senderDisplayName: message.senderDisplayName,
    metadata: message.metadata,
    content: { message: message.message },
    createdOn: message.createdOn,
    editedOn: "editedOn" in message ? message.editedOn : undefined
});

const createConversation = async (): Promise<{
    conversation: ACSConversation;
    messages: jest.SpiedFunction<ACSConversation["getMessages"]>;
    threadClient: ChatThreadClient;
    logger: ACSClientLogger;
}> => {
    const credential = new AzureCommunicationTokenCredential("token");
    const chatClient = new ChatClient("https://example.invalid", credential);
    const threadClient = new ChatThreadClient("https://example.invalid", "thread", credential);
    jest.mocked(chatClient.getChatThreadClient).mockReturnValue(threadClient);
    const logger = new ACSClientLogger({ orgId: "org", orgUrl: "https://example.invalid", widgetId: "widget" });
    jest.spyOn(logger, "recordIndividualEvent").mockImplementation(() => undefined);
    jest.spyOn(logger, "failScenario").mockImplementation(() => undefined);
    const conversation = new ACSConversation(credential, chatClient, logger);
    await conversation.initialize({ id: "customer", threadId: "thread", pollingInterval: 1000 });
    const messages = jest.spyOn(conversation, "getMessages").mockResolvedValue([]);
    return { conversation, messages, threadClient, logger };
};

describe("ACSConversation customer edits", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    const registrationOptions: (ACSRegisterOnNewMessageOptionalParams | undefined)[] = [
        undefined,
        { disablePolling: false }
    ];
    it.each(registrationOptions)("delivers customer realtime and polling edits without opt-in: %p", async (options) => {
        const { conversation, messages } = await createConversation();
        const callback = jest.fn();
        messages.mockResolvedValue([snapshot(original()), snapshot(edited())]);

        await conversation.registerOnNewMessage(callback, options);
        conversation["eventListeners"].chatMessageReceived[0](original());
        conversation["eventListeners"].chatMessageEdited[0](edited());
        await jest.advanceTimersByTimeAsync(1000);

        expect(callback).toHaveBeenCalledTimes(1);
        conversation["eventListeners"].chatMessageEdited[0](edited("Latest", "1720000000002"));
        expect(callback).toHaveBeenCalledTimes(2);
        await conversation.disconnect();
    });

    it("deduplicates customer edits independently for each subscription", async () => {
        const { conversation } = await createConversation();
        const firstCallback = jest.fn();
        const secondCallback = jest.fn();
        await conversation.registerOnNewMessage(firstCallback, { disablePolling: true });
        await conversation.registerOnNewMessage(secondCallback, { disablePolling: true });

        for (const listener of conversation["eventListeners"].chatMessageEdited) {
            listener(edited());
            listener(edited());
        }

        expect(firstCallback).toHaveBeenCalledTimes(1);
        expect(secondCallback).toHaveBeenCalledTimes(1);
        await conversation.disconnect();
    });

    it.each([{}, { editedOn: undefined }, { editedOn: null }])(
        "suppresses original realtime customer echoes with optional edit fields %p",
        async (fields) => {
            const { conversation } = await createConversation();
            const callback = jest.fn();
            await conversation.registerOnNewMessage(callback, { disablePolling: true });

            conversation["eventListeners"].chatMessageReceived[0]({ ...original(), ...fields });

            expect(callback).not.toHaveBeenCalled();
        }
    );

    it.each(["####", "Corrected customer content"])("delivers a same-ID customer edit: %s", async (content) => {
        const { conversation, logger } = await createConversation();
        const callback = jest.fn();
        await conversation.registerOnNewMessage(callback, { disablePolling: true });
        const event = edited(content);

        conversation["eventListeners"].chatMessageEdited[0](event);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(event);
        const message = createOmnichannelMessage(callback.mock.calls[0][0], { liveChatVersion: LiveChatVersion.V2 });
        expect(message).toMatchObject({
            id: "message",
            content,
            role: "user",
            sender: { id: "customer", displayName: "Customer" }
        });
        expect(JSON.stringify(jest.mocked(logger.recordIndividualEvent).mock.calls)).not.toContain(content);
    });

    it.each([true, false])("suppresses the send echo beforeSendResponse=%s", async (beforeSendResponse) => {
        const { conversation, threadClient } = await createConversation();
        const callback = jest.fn();
        await conversation.registerOnNewMessage(callback, { disablePolling: true });
        const receive = conversation["eventListeners"].chatMessageReceived[0];
        jest.mocked(threadClient.sendMessage).mockImplementation(async () => {
            if (beforeSendResponse) {
                receive(original());
            }
            return { id: "message" };
        });

        await conversation.sendMessage({ content: original().message });
        if (!beforeSendResponse) {
            receive(original());
        }
        conversation["eventListeners"].chatMessageEdited[0](edited());
        receive(original());

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][0].message).toBe("Corrected customer content");
    });

    it("delivers newer edit versions once and rejects duplicates and older content", async () => {
        const { conversation } = await createConversation();
        const callback = jest.fn();
        await conversation.registerOnNewMessage(callback, { disablePolling: true });
        const edit = conversation["eventListeners"].chatMessageEdited[0];

        edit(edited());
        edit(edited());
        edit(edited("Latest correction", "1720000000002"));
        edit(edited("Older unmasked content", "1720000000001"));

        expect(callback.mock.calls.map(([message]) => message.message)).toEqual([
            "Corrected customer content", "Latest correction"
        ]);
    });

    it("does not deliver this customer's edits from another conversation thread", async () => {
        const { conversation } = await createConversation();
        const callback = jest.fn();
        await conversation.registerOnNewMessage(callback, { disablePolling: true });

        conversation["eventListeners"].chatMessageEdited[0]({ ...edited(), threadId: "another-thread" });

        expect(callback).not.toHaveBeenCalled();
    });

    it("compares UInt64 versions without losing precision or treating decimal strings lexically", async () => {
        const { conversation } = await createConversation();
        const callback = jest.fn();
        await conversation.registerOnNewMessage(callback, { disablePolling: true });
        const edit = conversation["eventListeners"].chatMessageEdited[0];

        edit(edited("First", "9"));
        edit(edited("Second", "10"));
        edit(edited("Third", "9007199254740992"));
        edit(edited("Fourth", "9007199254740993"));
        edit(edited("Duplicate", "09007199254740993"));
        edit(edited("Stale", "9007199254740992"));

        expect(callback.mock.calls.map(([message]) => message.message)).toEqual(["First", "Second", "Third", "Fourth"]);
    });

    it("recovers edited snapshots on initial/reconnect polling without replaying unedited customer history", async () => {
        const { conversation, messages } = await createConversation();
        const callback = jest.fn();
        messages.mockResolvedValue([snapshot({ ...original(), id: "unedited-history" }), snapshot(edited())]);

        await conversation.registerOnNewMessage(callback, { disablePolling: false });
        conversation["eventListeners"].chatMessageEdited[0](edited());
        await jest.advanceTimersByTimeAsync(1000);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][0].content.message).toBe("Corrected customer content");
        await conversation.disconnect();
    });

    it("captures a realtime edit during the initial poll and rejects its older response", async () => {
        const { conversation, messages } = await createConversation();
        const callback = jest.fn();
        let finishPoll!: (messages: ChatMessage[]) => void;
        messages.mockReturnValueOnce(new Promise<ChatMessage[]>((resolve) => { finishPoll = resolve; }));
        const registration = conversation.registerOnNewMessage(callback, { disablePolling: false });
        await jest.advanceTimersByTimeAsync(0);
        const edit = conversation["eventListeners"].chatMessageEdited?.[0];
        expect(edit).toBeDefined();

        edit?.(edited("Latest", "1720000000002"));
        finishPoll([snapshot(edited("Older unmasked content"))]);
        await registration;

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][0].message).toBe("Latest");
        await conversation.disconnect();
    });

    it("recovers an offline edit in a new conversation without invoking disconnected listeners", async () => {
        const first = await createConversation();
        const callback = jest.fn();
        await first.conversation.registerOnNewMessage(callback, { disablePolling: true });
        const oldListener = first.conversation["eventListeners"].chatMessageEdited[0];
        await first.conversation.disconnect();
        oldListener(edited());
        expect(callback).not.toHaveBeenCalled();

        const reconnected = await createConversation();
        reconnected.messages.mockImplementation(async () => [
            snapshot({ ...original(), id: "unedited-history" }),
            snapshot(edited("Edited while offline", "1720000000002"))
        ]);
        await reconnected.conversation.registerOnNewMessage(callback, { disablePolling: false });
        await jest.advanceTimersByTimeAsync(1000);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][0]).toMatchObject({
            id: "message", content: { message: "Edited while offline" }
        });
        await reconnected.conversation.disconnect();
    });

    it("delivers missed polling edits after realtime and ignores unchanged or older polling snapshots", async () => {
        const { conversation, messages } = await createConversation();
        const callback = jest.fn();
        await conversation.registerOnNewMessage(callback, { disablePolling: false });
        const edit = conversation["eventListeners"].chatMessageEdited[0];
        edit(edited());

        messages.mockResolvedValue([snapshot(edited())]);
        await jest.advanceTimersByTimeAsync(1000);
        messages.mockResolvedValue([snapshot(edited("Latest", "1720000000002"))]);
        await jest.advanceTimersByTimeAsync(1000);
        edit(edited("Latest", "1720000000002"));
        messages.mockResolvedValue([snapshot(edited())]);
        await jest.advanceTimersByTimeAsync(2000);

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback.mock.calls[1][0].content.message).toBe("Latest");
        await conversation.disconnect();
    });

    it("does not overwrite a realtime edit with an older in-flight polling response", async () => {
        const { conversation, messages } = await createConversation();
        const callback = jest.fn();
        await conversation.registerOnNewMessage(callback, { disablePolling: false });
        let finishPoll!: (messages: ChatMessage[]) => void;
        messages.mockReturnValueOnce(new Promise<ChatMessage[]>((resolve) => { finishPoll = resolve; }));
        await jest.advanceTimersByTimeAsync(1000);

        conversation["eventListeners"].chatMessageEdited[0](edited("Latest", "1720000000002"));
        finishPoll([snapshot(edited("Older unmasked content"))]);
        await jest.advanceTimersByTimeAsync(0);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][0].message).toBe("Latest");
        await conversation.disconnect();
    });

    it("retries a polling edit when a consumer callback fails", async () => {
        const { conversation, messages, logger } = await createConversation();
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
        const callback = jest.fn().mockImplementationOnce(() => { throw new Error("Synthetic callback failure"); });
        messages.mockImplementation(async () => [snapshot(edited())]);

        await conversation.registerOnNewMessage(callback, { disablePolling: false });
        await jest.advanceTimersByTimeAsync(1000);
        await jest.advanceTimersByTimeAsync(1000);

        expect(callback).toHaveBeenCalledTimes(2);
        expect(logger.failScenario).toHaveBeenCalledWith("MessageProcessingError", expect.any(Object));
        expect(warn).toHaveBeenCalledTimes(1);
        await conversation.disconnect();
    });

    it("reports invalid customer edit versions without delivering unorderable updates", async () => {
        const { conversation, logger } = await createConversation();
        const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
        const callback = jest.fn();
        await conversation.registerOnNewMessage(callback, { disablePolling: true });

        conversation["eventListeners"].chatMessageEdited[0](edited("Synthetic private content", "invalid-version"));

        expect(callback).not.toHaveBeenCalled();
        expect(logger.failScenario).toHaveBeenCalledWith("MessageProcessingError", expect.any(Object));
        expect(warn).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(jest.mocked(logger.failScenario).mock.calls)).not.toContain("Synthetic private content");
    });

    it.each([undefined, null, new Date(NaN)])("reports malformed edited-event timestamps %p", async (timestamp) => {
        const { conversation, logger } = await createConversation();
        jest.spyOn(console, "warn").mockImplementation(() => undefined);
        const callback = jest.fn();
        await conversation.registerOnNewMessage(callback, { disablePolling: true });
        const event = edited();
        Reflect.set(event, "editedOn", timestamp);

        conversation["eventListeners"].chatMessageEdited[0](event);

        expect(callback).not.toHaveBeenCalled();
        expect(logger.failScenario).toHaveBeenCalledWith("MessageProcessingError", expect.any(Object));
    });

    it("does not suppress a realtime retry after the consumer callback throws", async () => {
        const { conversation } = await createConversation();
        const callback = jest.fn().mockImplementationOnce(() => { throw new Error("Synthetic callback failure"); });
        await conversation.registerOnNewMessage(callback, { disablePolling: true });
        const edit = conversation["eventListeners"].chatMessageEdited[0];

        expect(() => edit(edited())).toThrow("Synthetic callback failure");
        edit(edited());
        edit(edited());

        expect(callback).toHaveBeenCalledTimes(2);
    });

    it("rejects older edits after a callback failure while allowing the latest version to retry", async () => {
        const { conversation } = await createConversation();
        const callback = jest.fn().mockImplementationOnce(() => { throw new Error("Synthetic callback failure"); });
        await conversation.registerOnNewMessage(callback, { disablePolling: true });
        const edit = conversation["eventListeners"].chatMessageEdited[0];
        const latest = edited("Latest masked content", "1720000000002");

        expect(() => edit(latest)).toThrow("Synthetic callback failure");
        edit(edited("Older unmasked content", "1720000000001"));
        expect(callback).toHaveBeenCalledTimes(1);
        edit(latest);
        edit(latest);

        expect(callback).toHaveBeenCalledTimes(2);
    });

    it("does not dispatch or reschedule an in-flight poll after disconnect", async () => {
        const { conversation, messages } = await createConversation();
        const callback = jest.fn();
        await conversation.registerOnNewMessage(callback, { disablePolling: false });
        let finishPoll!: (messages: ChatMessage[]) => void;
        messages.mockReturnValueOnce(new Promise<ChatMessage[]>((resolve) => { finishPoll = resolve; }));
        await jest.advanceTimersByTimeAsync(1000);

        await conversation.disconnect();
        finishPoll([snapshot(edited())]);
        await jest.advanceTimersByTimeAsync(0);

        expect(callback).not.toHaveBeenCalled();
        expect(jest.getTimerCount()).toBe(0);
    });

    it("does not register listeners when disconnected during the initial poll", async () => {
        const { conversation, messages } = await createConversation();
        const callback = jest.fn();
        let finishPoll!: (messages: ChatMessage[]) => void;
        messages.mockReturnValueOnce(new Promise<ChatMessage[]>((resolve) => { finishPoll = resolve; }));
        const registration = conversation.registerOnNewMessage(callback, { disablePolling: false });
        await jest.advanceTimersByTimeAsync(0);

        await conversation.disconnect();
        finishPoll([snapshot(edited())]);
        await registration;

        expect(callback).not.toHaveBeenCalled();
        expect(Object.values(conversation["eventListeners"]).flat()).toHaveLength(0);
        expect(jest.getTimerCount()).toBe(0);
    });

    it("preserves agent, system and queue-position delivery and same-ID agent edits", async () => {
        const { conversation } = await createConversation();
        const callback = jest.fn();
        await conversation.registerOnNewMessage(callback, { disablePolling: true });
        const receive = conversation["eventListeners"].chatMessageReceived[0];
        const edit = conversation["eventListeners"].chatMessageEdited[0];
        const agent = {
            ...original(), id: "agent-message",
            sender: { kind: "communicationUser", communicationUserId: "agent" },
            senderDisplayName: "Agent", metadata: { tags: "public" }
        };
        receive(agent);
        receive(agent);
        edit({ ...agent, message: "Agent correction", editedOn: new Date(1720000000001) });
        receive({ ...agent, id: "system-message", metadata: { tags: "system" } });
        receive({ ...agent, id: "queue-message", metadata: { tags: "system" } });
        edit({ ...agent, id: "queue-message", message: "Queue position 1", editedOn: new Date(1720000000002) });

        expect(callback).toHaveBeenCalledTimes(5);
    });
});
