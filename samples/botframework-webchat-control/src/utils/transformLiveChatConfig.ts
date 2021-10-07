export class ConfigurationManager {
    public static liveChatVersion: number = 1;
    public static canUploadAttachment: boolean = false;
}

const transformLiveChatConfig = (liveChatConfig: any): ConfigurationManager => {
    const liveChatVersion = (liveChatConfig as any)["LiveChatVersion"];
    const canUploadAttachment = (liveChatConfig as any)["LiveWSAndLiveChatEngJoin"]["msdyn_enablefileattachmentsforcustomers"] === "true" || false;

    ConfigurationManager.liveChatVersion = parseInt(liveChatVersion) || 1;
    ConfigurationManager.canUploadAttachment = canUploadAttachment;

    return ConfigurationManager;
};

export default transformLiveChatConfig;