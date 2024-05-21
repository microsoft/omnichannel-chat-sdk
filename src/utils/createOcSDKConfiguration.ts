import ocSDKConfiguration from "../config/ocSDKConfiguration";

const createOcSDKConfiguration = (useCoreServices: boolean): {[key: string]: number | boolean} => {
    const configuration = {...ocSDKConfiguration};
    if (useCoreServices) {
        configuration.useUnauthReconnectIdSigQueryParam = true;
    }

    return configuration;
};

export default createOcSDKConfiguration;