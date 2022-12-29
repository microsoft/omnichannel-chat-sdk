import fetchTestConfig from "./fetchTestConfig";

const fetchOmnichannelConfig = (scenario = ""): object => {
    const testConfig = fetchTestConfig();
    scenario = scenario? scenario: "DefaultSettings";

    const omnichannelConfig: any = {};  // eslint-disable-line @typescript-eslint/no-explicit-any
    omnichannelConfig.orgId = testConfig["DefaultSettings"].orgId;
    omnichannelConfig.orgUrl = testConfig["DefaultSettings"].orgUrl;
    omnichannelConfig.widgetId = testConfig["DefaultSettings"].widgetId;
    omnichannelConfig.token = testConfig["DefaultSettings"].token;
    omnichannelConfig.reconnectId = testConfig["DefaultSettings"].reconnectId;

    if (!scenario) {
        return omnichannelConfig;
    }

    if (!Object.keys(testConfig).includes(scenario)) {
        return omnichannelConfig;
    }

    // Overwrite value only if it exists
    omnichannelConfig.orgId = testConfig[scenario]?.orgId || omnichannelConfig.orgId;
    omnichannelConfig.orgUrl = testConfig[scenario]?.orgUrl || omnichannelConfig.orgUrl;
    omnichannelConfig.widgetId = testConfig[scenario]?.widgetId || omnichannelConfig.widgetId;
    omnichannelConfig.token = testConfig[scenario]?.token || omnichannelConfig.token;
    omnichannelConfig.reconnectId = testConfig[scenario]?.reconnectId || omnichannelConfig.reconnectId;

    return omnichannelConfig;
}

export default fetchOmnichannelConfig;