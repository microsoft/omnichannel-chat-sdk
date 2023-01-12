import fetchTestConfig from "./fetchTestConfig";

const fetchAuthUrl = (scenario = ""): object => {
    const testConfig = fetchTestConfig();
    scenario = scenario? scenario: "DefaultSettings";

    let authUrl = testConfig["DefaultSettings"].authUrl;

    if (!scenario) {
        return authUrl;
    }

    if (!Object.keys(testConfig).includes(scenario)) {
        return authUrl;
    }

    // Overwrite value only if it exists
    authUrl = testConfig[scenario]?.authUrl || authUrl;

    return authUrl;
}

export default fetchAuthUrl;