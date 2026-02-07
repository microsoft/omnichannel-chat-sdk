import fetchTestConfig from "./fetchTestConfig";
 
const fetchAuthToken = (scenario = ""): object => {
    const testConfig = fetchTestConfig();
    scenario = scenario? scenario: "DefaultSettings";
 
    // Inject environment token into DefaultSettings
    if (process.env.TOKEN) {
        testConfig["DefaultSettings"].token = process.env.TOKEN;
    }
 
    let token = testConfig["DefaultSettings"].token || "";
 
    if (!scenario) {
        return token;
    }
 
    if (!Object.keys(testConfig).includes(scenario)) {
        return token;
    }
 
    // Overwrite value only if it exists
    token = testConfig[scenario]?.token || token;
 
    return token;
}
 
export default fetchAuthToken;