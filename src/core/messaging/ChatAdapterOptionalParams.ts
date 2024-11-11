import { IErrorEventSubscriber } from "../../external/ACSAdapter/IErrorEventSubscriber";

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
            pollingInterval?: number,
            scanStatusRetrievalDelay?: number
        },
        options?: {
            [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        errorEventSubscriber?: IErrorEventSubscriber
    };
    DirectLine?: {
        options?: {
            [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
        }
    };
}

export default ChatAdapterOptionalParams;