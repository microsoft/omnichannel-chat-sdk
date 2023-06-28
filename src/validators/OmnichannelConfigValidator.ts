import OmnichannelConfig from "../core/OmnichannelConfig";

const requiredOmnichannelConfigParams = ["orgUrl", "orgId", "widgetId"];

const validateOmnichannelConfig = (omnichannelConfig: OmnichannelConfig): void => {
    if (!omnichannelConfig) {
      throw new Error(`OmnichannelConfiguration not found`);
    }

    const mapEntries = new Map(Object.entries(omnichannelConfig));
    let valueOfEntry;

    for (const key of requiredOmnichannelConfigParams) {
      //check for they key present in the map, if not present or value is undefined then throw error
      valueOfEntry = mapEntries.get(key);
      if (!valueOfEntry || valueOfEntry.trim() === "") {
        throw new Error(`Missing '${key}' in OmnichannelConfiguration`);
      }
    }
}

export default validateOmnichannelConfig;