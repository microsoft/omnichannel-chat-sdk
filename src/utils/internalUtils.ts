/**
 * Utility function that are only meant to be used internally. It would not guarantee backward compatibility if they were used outside of the package.
 */

import { nonProductionDynamicsLocationCode } from "./CoreServicesUtils";

export const isCoreServicesOrgUrlDNSError = (error: any, coreServicesOrgUrl: string | null, dynamicsLocationCode: string | null) => {
    const isDNSError = error.isAxiosError && error.code == AxiosErrorCodes.ERR_NETWORK;
    if (isDNSError && coreServicesOrgUrl && dynamicsLocationCode && nonProductionDynamicsLocationCode.includes(dynamicsLocationCode)) { // eslint-disable-line @typescript-eslint/no-explicit-any
        return true;
    }
    
    return false;
}