interface ChatAdapterOptionalParams {
    protocol?: string;
    IC3Adapter?: {
        options?: {
            [key: string]: any
        }
    }
    ACSAdapter?: {
        options?: {
            [key: string]: any
        }
    }
}

export default ChatAdapterOptionalParams;