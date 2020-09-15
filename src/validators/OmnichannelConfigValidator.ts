import IOmnichannelConfig from "../core/IOmnichannelConfig";

const requiredOmnichannelConfigParams = ["orgUrl", "orgId", "widgetId"];

const validateOmnichannelConfig = (omnichannelConfig: IOmnichannelConfig) => {
    if (!omnichannelConfig) {
      throw new Error(`OmnichannelConfiguration not found`);
    }

    const currentOmnichannelConfigParams = Object.keys(omnichannelConfig);
    for (const key of requiredOmnichannelConfigParams) {
      if (!currentOmnichannelConfigParams.includes(key)) {
        throw new Error(`Missing '${key}' in OmnichannelConfiguration`);
      }
    }
}

export default validateOmnichannelConfig;