import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { ChatClient } from "@azure/communication-chat";
import createAMSClient from "@microsoft/omnichannel-amsclient";
import FramedlessClient from "@microsoft/omnichannel-amsclient/lib/FramedlessClient";
import { ACSConversation } from "../src/core/messaging/ACSClient";
import { AMSClientLoadStates } from "../src/utils/AMSClientLoadStates";
import { ChatSDKErrorName } from "../src/core/ChatSDKError";
import OmnichannelChatSDK from "../src/OmnichannelChatSDK";
import TelemetryEvent from "../src/telemetry/TelemetryEvent";

jest.mock("@azure/communication-common");
jest.mock("@azure/communication-chat");
jest.mock("@microsoft/omnichannel-amsclient", () => ({
    __esModule: true,
    default: jest.fn()
}));
jest.mock("../src/core/messaging/ACSClient");
jest.mock("../src/telemetry/AriaTelemetry");

describe("Attachment client recovery", () => {
    const chatToken = { chatId: "chat-id", token: "chat-token", amsEndpoint: "https://example.com" };
    const fileInfo = { name: "attachment.txt", type: "text/plain", size: 1, data: new ArrayBuffer(1) };
    const fileMetadata = { id: "attachment-id", type: "text/plain" };
    let chatSDK: OmnichannelChatSDK;
    let client: FramedlessClient;
    let conversation: ACSConversation;

    beforeEach(() => {
        jest.clearAllMocks();
        chatSDK = new OmnichannelChatSDK({
            orgUrl: "https://example.com",
            orgId: "org-id",
            widgetId: "widget-id"
        });
        chatSDK["isAMSClientAllowed"] = true;
        chatSDK["getChatConfig"] = jest.fn().mockResolvedValue(undefined);
        jest.spyOn(chatSDK["scenarioMarker"], "failScenario");
        jest.spyOn(chatSDK["scenarioMarker"], "completeScenario");

        client = new FramedlessClient();
        jest.spyOn(client, "initialize").mockResolvedValue(undefined);
        jest.spyOn(client, "createObject").mockResolvedValue({ id: fileMetadata.id });
        jest.spyOn(client, "uploadDocument").mockResolvedValue(fileMetadata);
        jest.mocked(createAMSClient).mockReset().mockResolvedValue(client);

        const credential = new AzureCommunicationTokenCredential("chat-token");
        conversation = new ACSConversation(credential, new ChatClient("https://example.com", credential));
        chatSDK["conversation"] = conversation;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("keeps chat initialization nonblocking while the attachment preload is pending", async () => {
        let resolveClient!: (value: FramedlessClient) => void;
        jest.mocked(createAMSClient).mockReturnValueOnce(new Promise(resolve => {
            resolveClient = resolve;
        }));

        await chatSDK.initialize({ useParallelLoad: true });

        expect(chatSDK.isInitialized).toBe(true);
        expect(chatSDK.AMSClient).toBeNull();
        resolveClient(client);
        await new Promise<void>(resolve => setImmediate(resolve));
        expect(chatSDK.AMSClient).toBe(client);
    });

    it("reports a failed preload without an unhandled rejection or failed chat initialization", async () => {
        jest.mocked(createAMSClient).mockRejectedValueOnce(new Error("Iframe load timed out"));

        await chatSDK.initialize({ useParallelLoad: true });
        await new Promise<void>(resolve => setImmediate(resolve));

        expect(chatSDK.isInitialized).toBe(true);
        expect(chatSDK["AMSClientLoadCurrentState"]).toBe(AMSClientLoadStates.ERROR);
        expect(chatSDK["scenarioMarker"].failScenario).toHaveBeenCalledWith(
            TelemetryEvent.InitializeMessagingClient,
            expect.objectContaining({
                ExceptionDetails: expect.stringContaining(ChatSDKErrorName.MessagingClientCreationFailure)
            })
        );
        expect(chatSDK["scenarioMarker"].completeScenario).not.toHaveBeenCalledWith(
            TelemetryEvent.InitializeMessagingClient
        );
    });

    it("recreates and initializes a failed client before uploading an attachment", async () => {
        jest.mocked(createAMSClient).mockRejectedValueOnce(new Error("Iframe load timed out"));
        await chatSDK.initialize({ useParallelLoad: true });
        await new Promise<void>(resolve => setImmediate(resolve));
        chatSDK["chatToken"] = chatToken;

        const result = await chatSDK.uploadFileAttachment(fileInfo);

        expect(createAMSClient).toHaveBeenCalledTimes(2);
        expect(client.initialize).toHaveBeenCalledTimes(1);
        expect(client.initialize).toHaveBeenCalledWith({ chatToken });
        expect(client.createObject).toHaveBeenCalledWith(chatToken.chatId, fileInfo);
        expect(client.uploadDocument).toHaveBeenCalledWith(fileMetadata.id, fileInfo);
        expect(conversation.sendMessage).toHaveBeenCalledTimes(1);
        expect(result.fileMetadata).toEqual(fileMetadata);
        expect(chatSDK["AMSClientLoadCurrentState"]).toBe(AMSClientLoadStates.LOADED);
    });

    it("shares a single recreated client and waits for initialization before concurrent uploads", async () => {
        chatSDK.isInitialized = true;
        chatSDK["chatToken"] = chatToken;
        chatSDK["AMSClientLoadCurrentState"] = AMSClientLoadStates.ERROR;
        let resolveInitialization!: () => void;
        jest.spyOn(client, "initialize").mockReturnValueOnce(new Promise<void>(resolve => {
            resolveInitialization = resolve;
        }));

        const upload = chatSDK.uploadFileAttachment(fileInfo);
        const secondUpload = chatSDK.uploadFileAttachment(fileInfo);
        await Promise.resolve();
        await Promise.resolve();

        try {
            expect(client.initialize).toHaveBeenCalledWith({ chatToken });
            expect(chatSDK.AMSClient).toBeNull();
            expect(client.createObject).not.toHaveBeenCalled();
        } finally {
            resolveInitialization?.();
            await Promise.all([upload, secondUpload]);
        }
        expect(createAMSClient).toHaveBeenCalledTimes(1);
        expect(client.initialize).toHaveBeenCalledTimes(1);
        expect(client.createObject).toHaveBeenCalledTimes(2);
        expect(conversation.sendMessage).toHaveBeenCalledTimes(2);
    });

    it("recreates and initializes a failed client before downloading an attachment", async () => {
        chatSDK.isInitialized = true;
        chatSDK["chatToken"] = chatToken;
        chatSDK["AMSClientLoadCurrentState"] = AMSClientLoadStates.ERROR;
        const blob = new Blob(["attachment"]);
        jest.spyOn(client, "getViewStatus").mockResolvedValue({
            content_full_length: 1,
            content_length: 1,
            content_state: "ready",
            status_location: "",
            view_content_type: fileMetadata.type,
            view_length: 1,
            view_location: "https://example.com/attachment",
            view_state: "ready"
        });
        jest.spyOn(client, "getView").mockResolvedValue(blob);

        await expect(chatSDK.downloadFileAttachment(fileMetadata)).resolves.toBe(blob);

        expect(client.initialize).toHaveBeenCalledWith({ chatToken });
        expect(client.getView).toHaveBeenCalledWith(fileMetadata, "https://example.com/attachment");
    });

    it("propagates a failed foreground retry without reporting successful client creation", async () => {
        chatSDK.isInitialized = true;
        chatSDK["chatToken"] = chatToken;
        chatSDK["AMSClientLoadCurrentState"] = AMSClientLoadStates.ERROR;
        jest.mocked(createAMSClient).mockRejectedValueOnce(new Error("Iframe still unavailable"));

        await expect(chatSDK.uploadFileAttachment(fileInfo)).rejects.toMatchObject({
            message: ChatSDKErrorName.MessagingClientCreationFailure
        });

        expect(chatSDK["AMSClientLoadCurrentState"]).toBe(AMSClientLoadStates.ERROR);
        expect(chatSDK["scenarioMarker"].completeScenario).not.toHaveBeenCalledWith(
            TelemetryEvent.InitializeMessagingClient
        );
        expect(client.createObject).not.toHaveBeenCalled();
    });

    it("does not retain an unauthenticated recovered client and allows another retry", async () => {
        chatSDK.isInitialized = true;
        chatSDK["chatToken"] = chatToken;
        chatSDK["AMSClientLoadCurrentState"] = AMSClientLoadStates.ERROR;
        jest.spyOn(client, "initialize").mockRejectedValueOnce(new Error("Attachment authentication failed"));

        await expect(chatSDK.uploadFileAttachment(fileInfo)).rejects.toMatchObject({
            message: ChatSDKErrorName.MessagingClientCreationFailure
        });

        expect(chatSDK.AMSClient).toBeNull();
        expect(chatSDK["AMSClientLoadCurrentState"]).toBe(AMSClientLoadStates.ERROR);
        expect(client.createObject).not.toHaveBeenCalled();

        await chatSDK.uploadFileAttachment(fileInfo);

        expect(createAMSClient).toHaveBeenCalledTimes(2);
        expect(client.initialize).toHaveBeenCalledTimes(2);
        expect(client.uploadDocument).toHaveBeenCalledTimes(1);
    });

    it("reuses an already loaded client without recreating or reinitializing it", async () => {
        chatSDK.isInitialized = true;
        chatSDK["chatToken"] = chatToken;
        chatSDK.AMSClient = client;
        chatSDK["AMSClientLoadCurrentState"] = AMSClientLoadStates.LOADED;

        await chatSDK.uploadFileAttachment(fileInfo);

        expect(createAMSClient).not.toHaveBeenCalled();
        expect(client.initialize).not.toHaveBeenCalled();
        expect(client.uploadDocument).toHaveBeenCalledTimes(1);
    });

    it("does not load the attachment client when attachments are disabled", async () => {
        chatSDK["isAMSClientAllowed"] = false;

        await chatSDK.initialize({ useParallelLoad: true });

        expect(chatSDK.isInitialized).toBe(true);
        expect(createAMSClient).not.toHaveBeenCalled();
        await expect(chatSDK.uploadFileAttachment(fileInfo)).rejects.toMatchObject({
            message: ChatSDKErrorName.FeatureDisabled
        });
        expect(createAMSClient).not.toHaveBeenCalled();
    });
});
