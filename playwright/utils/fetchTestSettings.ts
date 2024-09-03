import fetchTestConfig from "./fetchTestConfig";

const fetchTestSettings = (scenario = "") => {
    const testConfig = fetchTestConfig();
    scenario = scenario? scenario: "DefaultSettings";

    let chatDuration = testConfig["DefaultSettings"].chatDuration || 5000;
    let waitForSessionInitializationCompletionTimeout = testConfig["DefaultSettings"].waitForSessionInitializationCompletionTimeout || 10000;
    let waitForSessionInitializationCompletionInterval = testConfig["DefaultSettings"].waitForSessionInitializationCompletionInterval || 1000;

    if (!scenario) {
        return {chatDuration};
    }

    if (!Object.keys(testConfig).includes(scenario)) {
        return {chatDuration};
    }

    // Overwrite value only if it exists
    chatDuration = testConfig[scenario]?.chatDuration || chatDuration;
    waitForSessionInitializationCompletionTimeout = testConfig[scenario]?.waitForSessionInitializationCompletionTimeout || waitForSessionInitializationCompletionTimeout;
    waitForSessionInitializationCompletionInterval = testConfig[scenario]?.waitForSessionInitializationCompletionInterval || waitForSessionInitializationCompletionInterval;

    return {chatDuration, waitForSessionInitializationCompletionTimeout, waitForSessionInitializationCompletionInterval};
}

export default fetchTestSettings;