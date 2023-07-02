import OmnichannelConfig from "../core/OmnichannelConfig";

const requiredOmnichannelConfigParams = ["orgUrl", "orgId", "widgetId"];

const validateOmnichannelConfig = (omnichannelConfig: OmnichannelConfig): void => {
    if (!omnichannelConfig) {
      throw new Error(`OmnichannelConfiguration not found`);
    }

    for (const key of requiredOmnichannelConfigParams) {
      //check for they key present in the map, if not present or value is undefined then throw error
      const isPresent = Reflect.has(omnichannelConfig, key);

      if (!isPresent) {
        throw new Error(`Missing '${key}' in OmnichannelConfiguration`);
      }

      const propertyValue = Reflect.get(omnichannelConfig, key);

      if (propertyValue.length === 0) {
        throw new Error(`Empty '${key}' in OmnichannelConfiguration`);
      }
    }
}

export default validateOmnichannelConfig;