interface IDataMaskingSDKConfig {
    disable: boolean,
    maskingCharacter: string
}

interface IChatSDKConfig {
    dataMasking: IDataMaskingSDKConfig
}

export {
    IDataMaskingSDKConfig
};

export default IChatSDKConfig;
