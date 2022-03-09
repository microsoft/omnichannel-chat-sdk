interface ChatAdapterOptionalParams {
    protocol?: string;
    IC3Adapter?: {
        options?: {
            [key: string]: string
        }
    }
    ACSAdapter?: {
        options?: {
            [key: string]: string
        }
    }
}

export default ChatAdapterOptionalParams;