export default interface ChatSDKMessage {
    content: string;
    tags?: string[];
    timestamp?: Date;
    metadata?: any;  // eslint-disable-line @typescript-eslint/no-explicit-any
}