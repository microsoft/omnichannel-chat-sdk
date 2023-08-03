import fetchTestConfig from "./fetchTestConfig";

const fetchPerformanceApiConfig = (scenario = ""): object => {
    const testConfig = fetchTestConfig();
    scenario = scenario ? scenario : "DefaultSettings";

    const performanceAPIConfig: any = {};
    performanceAPIConfig.apiUrl = testConfig["DefaultSettings"].apiUrl;
    performanceAPIConfig.threshold = testConfig["DefaultSettings"].threshold;


    if (!scenario) {
        return performanceAPIConfig;
    }

    if (!Object.keys(testConfig).includes(scenario)) {
        return performanceAPIConfig;
    }

    // Overwrite value only if it exists
    performanceAPIConfig.apiUrl = testConfig[scenario]?.apiUrl || performanceAPIConfig.apiUrl;
    performanceAPIConfig.threshold = testConfig[scenario]?.threshold || performanceAPIConfig.threshold;

    return performanceAPIConfig;
}

export default fetchPerformanceApiConfig;