import ocSDKConfiguration from "../config/ocSDKConfiguration";

const createOcSDKConfiguration = (useCoreServices: boolean) => {
    const configuration = {...ocSDKConfiguration};
    if (useCoreServices) {
        configuration.useUnauthReconnectIdSigQueryParam = true;
    }

    return configuration;
};

export default createOcSDKConfiguration;