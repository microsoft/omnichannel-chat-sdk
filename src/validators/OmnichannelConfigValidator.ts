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

      /**
      * Since we know the keys that are required and we know those values are string, 
      * there is no point in make a generic function to validate the object and different
      * types of values based on its type. We can just check for the keys and check if the value is empty or not.
      */
      const propertyValue = Reflect.get(omnichannelConfig, key);

      if (!propertyValue || 
        (typeof propertyValue === "string" && propertyValue.trim().length === 0) || 
        propertyValue.length === 0) {
        throw new Error(`Empty '${key}' in OmnichannelConfiguration`);
      }
    }
}

export default validateOmnichannelConfig;