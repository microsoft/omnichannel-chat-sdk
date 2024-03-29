
import { CoreServicesGeoNamesMapping, coreServicesOrgUrlPrefix, getCoreServicesGeoName, nonProductionDynamicsLocationCode, unqOrgUrlPattern } from "../../src/utils/CoreServicesUtils";

describe("CoreServicesUtils", () => {
    it ("getCoreServicesGeoName() should return the proper geo name based on location code", () => {
        for (const locationCode in CoreServicesGeoNamesMapping) {
            const geoName = CoreServicesGeoNamesMapping[locationCode];
            const result = getCoreServicesGeoName(locationCode);
            expect(result).toBe(geoName);
        }
    });

    it ("getCoreServicesGeoName() should return \"\" if the location code does not exist", () => {
        const locationCode = "NA";
        const result = getCoreServicesGeoName(locationCode);
        expect(result).toBe("");
    });    
});