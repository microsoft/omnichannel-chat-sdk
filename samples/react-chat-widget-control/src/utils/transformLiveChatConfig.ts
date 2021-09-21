import IChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/IChatConfig";

export class ConfigurationManager {
    public static canUploadAttachment: boolean = false;
}

const transformLiveChatConfig = (liveChatConfig: IChatConfig): ConfigurationManager => {
    const canUploadAttachment = (liveChatConfig as any)["LiveWSAndLiveChatEngJoin"]["msdyn_enablefileattachmentsforcustomers"] === "true" || false;
    ConfigurationManager.canUploadAttachment = false;
    return ConfigurationManager;
};

export default transformLiveChatConfig;