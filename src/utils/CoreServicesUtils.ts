const CoreServicesGeoNamesMapping: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
    "crm": "us", // NAM
    "crm2": "br", // SAM
    "crm3": "ca", // CAN
    "crm4": "eu", // EUR
    "crm5": "as", // APJ
    "crm6": "au", // OCE
    "crm7": "jp", // JPN
    "crm8": "in", // IND
    "crm10": "preprod", // PREPROD
    "crm11": "uk", // GBR
    "crm12": "fr", // FRA
    "crm14": "za", // ZAF
    "crm15": "ae", // UAE
    "crm16": "de", // GER
    "crm17": "ch", // CHE
    "crm19": "no", // NOR 
    "crm20": "sg", // SGP
    "crm21": "kr", // KOR
    "crm22": "se" // SWE
}

export const coreServicesOrgUrlPrefix = "https://m-";

export const unqOrgUrlPattern = /http[s]*:\/\/[\w-]*-(crm[\d]*).[\w.]*/;

export const nonProductionDynamicsLocationCode = ["crm10"];

export const getCoreServicesGeoName = (dynamicsLocationCode: string): string => {
    const locationCode = Object.keys(CoreServicesGeoNamesMapping).find(key => key === dynamicsLocationCode);
    return locationCode ? CoreServicesGeoNamesMapping[locationCode]: "";
};