/**
 * Utility function that are only meant to be used internally. It would not guarantee backward compatibility if they were used outside of the package.
 */

import AxiosErrorCodes from "../core/AxiosErrorCodes";

export const isCoreServicesOrgUrlDNSError = (error: any, coreServicesOrgUrl: string | null, dynamicsLocationCode: string | null): boolean => { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    // Validating whether it's an 'ERR_NAME_NOT_RESOLVED' error
    // `ERR_NETWORK` could return false positives since the error can be caused by network disconnection
    const isDNSUrlResolveError = error.isAxiosError && error.code == AxiosErrorCodes.ERR_NETWORK;
    if (isDNSUrlResolveError && coreServicesOrgUrl && dynamicsLocationCode) {
        return true;
    }
    
    return false;
}