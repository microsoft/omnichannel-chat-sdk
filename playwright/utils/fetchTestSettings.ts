import fetchTestConfig from "./fetchTestConfig";

const fetchTestSettings = (scenario = "") => {
    const testConfig = fetchTestConfig();
    scenario = scenario? scenario: "DefaultSettings";

    const testSettings: any = {};  // eslint-disable-line @typescript-eslint/no-explicit-any
    testSettings.chatDuration = 3000;

    if (!scenario) {
        return testSettings;  // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    if (!Object.keys(testConfig).includes(scenario)) {
        return testSettings;
    }

    // Overwrite value only if it exists
    testSettings.chatDuration = testConfig[scenario]?.chatDuration || testSettings.chatDuration;

    return testSettings;
}

export default fetchTestSettings;