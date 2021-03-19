import ChatAdapterConfig from "./ChatAdapterConfig";
import IC3Config from "./IC3Config";

interface IDataMaskingSDKConfig {
    disable: boolean,
    maskingCharacter: string
}

interface IChatSDKConfig {
    dataMasking: IDataMaskingSDKConfig,
    getAuthToken?: () => Promise<string|null>,
    ic3Config?: IC3Config,
    chatAdapterConfig?: ChatAdapterConfig
}

export {
    IDataMaskingSDKConfig
};

export default IChatSDKConfig;
