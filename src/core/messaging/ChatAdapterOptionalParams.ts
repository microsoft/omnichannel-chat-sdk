interface ChatAdapterOptionalParams {
    protocol?: string;
    IC3Adapter?: {
        options?: {
            [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    };
    ACSAdapter?: {
        fileScan?: {
            disabled?: boolean,
            interval?: number
        },
        options?: {
            [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    };
    DirectLine?: {
        options?: {
            [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    };
}

export default ChatAdapterOptionalParams;