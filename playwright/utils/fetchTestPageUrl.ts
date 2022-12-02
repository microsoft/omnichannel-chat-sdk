import {join} from 'path';

const fetchTestPageUrl = (): string => {
    const testPage = join('file:', __dirname, '..', 'public', 'index.html');
    return testPage;
}

export default fetchTestPageUrl;