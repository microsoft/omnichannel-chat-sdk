import { isCoreServicesOrgUrlDNSError } from "../../src/utils/internalUtils";

describe('InternalUtils', () => {
    it("isCoreServicesOrgUrlDNSError() should return true if 'ERR_NETWORK' AxiosError is thrown", async () => {
        const axiosErrorObject: any = {code: "ERR_NETWORK", isAxiosError: true};
        const coreServicesOrgUrl = "https://m-[data-org-id].test.omnichannelengagementhub.com";
        const dynamicsLocationCode = "test";
        const result = isCoreServicesOrgUrlDNSError(axiosErrorObject, coreServicesOrgUrl, dynamicsLocationCode);
        expect(result).toBe(true);
    });

    it("isCoreServicesOrgUrlDNSError() should return false if any error other than 'ERR_NETWORK' AxiosError is thrown", async () => {
        const axiosErrorObject: any = {};
        const coreServicesOrgUrl = "https://m-[data-org-id].test.omnichannelengagementhub.com";
        const dynamicsLocationCode = "test";
        const result = isCoreServicesOrgUrlDNSError(axiosErrorObject, coreServicesOrgUrl, dynamicsLocationCode);
        expect(result).toBe(false);
    });

    it("isCoreServicesOrgUrlDNSError() should return false if coreServicesOrgUrl is not provided", async () => {
        const axiosErrorObject: any = {code: "ERR_NETWORK", isAxiosError: true};
        const coreServicesOrgUrl = null;
        const dynamicsLocationCode = "test";
        const result = isCoreServicesOrgUrlDNSError(axiosErrorObject, coreServicesOrgUrl, dynamicsLocationCode);
        expect(result).toBe(false);
    });

    it("isCoreServicesOrgUrlDNSError() should return false if dynamicsLocationCode is not provided", async () => {
        const axiosErrorObject: any = {code: "ERR_NETWORK", isAxiosError: true};
        const coreServicesOrgUrl = "https://m-[data-org-id].test.omnichannelengagementhub.com";
        const dynamicsLocationCode = null;
        const result = isCoreServicesOrgUrlDNSError(axiosErrorObject, coreServicesOrgUrl, dynamicsLocationCode);
        expect(result).toBe(false);
    });  
});