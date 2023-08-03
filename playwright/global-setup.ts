import { FullConfig } from '@playwright/test';
import fetchTestConfig from './utils/fetchTestConfig';

const globalSetup = (config: FullConfig) => {
    const projectArg = process.argv.find(arg => arg.includes('project'))
    
    // Get the project's name after the = sign
    const projectName = projectArg.split("=")[1];
    process.env.projectName = projectName;

    const testConfig = fetchTestConfig();

    if (!process.env.testConfig) {
        process.env.testConfig = JSON.stringify(testConfig);
    }

    // Use test server instead of static page to run tests if set
    if (config._webServers.length > 0) {
        process.env.testServer = config._webServers[0].url;
    }
}

export default globalSetup;