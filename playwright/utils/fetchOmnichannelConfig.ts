import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const fetchTestConfig = () => {
    const testConfigFilePath = path.join(path.dirname(__dirname), 'test.config.yml');
    let testConfig = null;
    try {
        const fileData = fs.readFileSync(testConfigFilePath, 'utf8');
        testConfig = YAML.parse(fileData);
    } catch {
        throw new Error(`Unable to process test config file ${testConfigFilePath}`);
    }

    if (!testConfig) {
        throw new Error('Test config file is empty');
    }

    return testConfig;
};

const fetchOmnichannelConfig = (scenario = ""): object => {
    const testConfig = fetchTestConfig();
    scenario = scenario? scenario: "DefaultSettings";

    const omnichannelConfig: any = {};  // eslint-disable-line @typescript-eslint/no-explicit-any
    omnichannelConfig.orgId = testConfig["DefaultSettings"].orgId;
    omnichannelConfig.orgUrl = testConfig["DefaultSettings"].orgUrl;
    omnichannelConfig.widgetId = testConfig["DefaultSettings"].widgetId;

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

    return omnichannelConfig;
}

export default fetchOmnichannelConfig;