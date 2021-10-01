import IChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/IChatConfig";

export class ConfigurationManager {
    public static liveChatVersion: number = 1;
    public static canUploadAttachment: boolean = false;
}

const transformLiveChatConfig = (liveChatConfig: IChatConfig): ConfigurationManager => {
    const liveChatVersion = (liveChatConfig as any)["LiveChatVersion"];
    const canUploadAttachment = (liveChatConfig as any)["LiveWSAndLiveChatEngJoin"]["msdyn_enablefileattachmentsforcustomers"] === "true" || false;

    ConfigurationManager.liveChatVersion = parseInt(liveChatVersion);
    ConfigurationManager.canUploadAttachment = canUploadAttachment;

    return ConfigurationManager;
};

export default transformLiveChatConfig;