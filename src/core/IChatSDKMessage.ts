export default interface IChatSDKMessage {
    content: string;
    tags?: string[];
    timestamp?: Date;
}