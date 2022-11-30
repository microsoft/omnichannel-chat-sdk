import { FullConfig } from '@playwright/test';
import fetchTestConfig from './utils/fetchTestConfig';

const globalSetup = (config: FullConfig) => {
    const testConfig = fetchTestConfig();
    if (!process.env.testConfig) {
        process.env.testConfig = JSON.stringify(testConfig);
    }
}

export default globalSetup;