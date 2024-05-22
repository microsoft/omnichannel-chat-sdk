
import { CoreServicesGeoNamesMapping, coreServicesOrgUrlPrefix, getCoreServicesGeoName, isCoreServicesOrgUrl, nonProductionDynamicsLocationCode, unqOrgUrlPattern } from "../../src/utils/CoreServicesUtils";

describe("CoreServicesUtils", () => {
    it("unqOrgUrlPattern should be able to retrieve the location code from the an UNQ OrgUrl", () => {
        const locationCode = "crm";
        const orgUrl = `https://unq[orgId]-${locationCode}.omnichannelengagementhub.com`;
        const result = unqOrgUrlPattern.exec(orgUrl);

        expect(result).toBeDefined();
        if (result) {
            expect(result[1]).toBe(locationCode);
        }
    });

    it("unqOrgUrlPattern should be able to retrieve the location code from the an custom UNQ OrgUrl", () => {
        const locationCode = "crmtest";
        const orgUrl = `https://[custom]-${locationCode}.omnichannelengagementhub.com`;
        const result = unqOrgUrlPattern.exec(orgUrl);
        
        expect(result).toBeDefined();
        if (result) {
            expect(result[1]).toBe(locationCode);
        }
    });

    it("unqOrgUrlPattern should be able to retrieve the location code from the an UNQ OrgUrl with a different domain", () => {
        const locationCode = "crm10";
        const orgUrl = `https://[custom]-${locationCode}.oc.crmlivetie.com`;
        const result = unqOrgUrlPattern.exec(orgUrl);
        
        expect(result).toBeDefined();
        if (result) {
            expect(result[1]).toBe(locationCode);
        }
    });

    it("unqOrgUrlPattern should be able to retrieve the location code from the an UNQ OrgUrl with a different top-level domain", () => {
        const locationCode = "crm12";
        const orgUrl = `https://[custom]-${locationCode}.omnichannelengagementhub.us`;
        const result = unqOrgUrlPattern.exec(orgUrl);
        
        expect(result).toBeDefined();
        if (result) {
            expect(result[1]).toBe(locationCode);
        }        
    });    

    it("getCoreServicesGeoName() should return the proper geo name based on location code", () => {
        for (const locationCode in CoreServicesGeoNamesMapping) {
            const geoName = CoreServicesGeoNamesMapping[locationCode];
            const result = getCoreServicesGeoName(locationCode);
            expect(result).toBe(geoName);
        }
    });

    it("getCoreServicesGeoName() should return \"\" if the location code does not exist", () => {
        const locationCode = "NA";
        const result = getCoreServicesGeoName(locationCode);
        expect(result).toBe("");
    });

    it("isCoreServicesOrgUrl() should return \"true\" if orgUrl is a CoreServices OrgUrl", () => {
        const orgUrl = "https://m-[orgId].[geoName].omnichannelengagementhub.com";
        const result = isCoreServicesOrgUrl(orgUrl);
        expect(result).toBe(true);
    });

    it("isCoreServicesOrgUrl() should return \"false\" if orgUrl is NOT a CoreServices OrgUrl", () => {
        const orgUrl = "https://unq[orgId]-[locationCode].omnichannelengagementhub.com";
        const result = isCoreServicesOrgUrl(orgUrl);
        expect(result).toBe(false);
    });
});