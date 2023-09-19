import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const fetchTestConfig = () => {
    if (process.env.testConfig) {
        return JSON.parse(process.env.testConfig);
    }

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

export default fetchTestConfig;