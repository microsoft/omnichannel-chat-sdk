import fetchTestConfig from "./fetchTestConfig";

const fetchTestSettings = (scenario = "") => {
    const testConfig = fetchTestConfig();
    scenario = scenario? scenario: "DefaultSettings";

    let chatDuration = testConfig["DefaultSettings"].chatDuration || 5000;

    if (!scenario) {
        return {chatDuration};
    }

    if (!Object.keys(testConfig).includes(scenario)) {
        return {chatDuration};
    }

    // Overwrite value only if it exists
    chatDuration = testConfig[scenario]?.chatDuration || chatDuration;
    return {chatDuration};
}

export default fetchTestSettings;