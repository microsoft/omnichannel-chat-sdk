interface ChatAdapterOptionalParams {
    protocol?: string;
    IC3Adapter?: {
        options?: {
            [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    }
    ACSAdapter?: {
        options?: {
            [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    }
}

export default ChatAdapterOptionalParams;