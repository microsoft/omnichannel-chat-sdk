export default interface IChatSDKMessage {
    content: string;
    tags?: string[];
    timestamp?: Date;
    metadata?: any;  // eslint-disable-line @typescript-eslint/no-explicit-any
}