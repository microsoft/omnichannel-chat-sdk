interface IDataMaskingSDKConfig {
    disable: boolean,
    maskingCharacter: string
}

interface IChatSDKConfig {
    dataMasking: IDataMaskingSDKConfig,
    getAuthToken?: () => Promise<string|null>
}

export {
    IDataMaskingSDKConfig
};

export default IChatSDKConfig;
