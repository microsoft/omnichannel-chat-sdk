import { expect, test } from '@playwright/test';

import fetchTestPageUrl from '../utils/fetchTestPageUrl';

const testPage = fetchTestPageUrl();

test.describe('Utilities @Utilities', () => {
    test('WebUtils.loadScript() should add the script in the DOM', async ({ page }) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async () => {
                const {require_WebUtils, require_libraries} = window;
                const WebUtils = require_WebUtils();
                const libraries = require_libraries();
                const scriptURL = libraries.getACSAdapterCDNUrl();

                const runtimeContext = {};
                runtimeContext.expectedScriptUrl = scriptURL;

                try {
                    await WebUtils.default.loadScript(scriptURL);
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                }

                const scriptElements = document.getElementsByTagName('script');
                const result = Array.from(scriptElements).filter((script) => script.src === scriptURL);
                runtimeContext.loadedScriptUrl = result[0].src;

                return runtimeContext;
            })
        ]);

        expect(runtimeContext?.errorMessage).not.toBeDefined();
        expect(runtimeContext.loadedScriptUrl).toBeDefined();
        expect(runtimeContext.loadedScriptUrl === runtimeContext.expectedScriptUrl).toBe(true);
    });

    test('WebUtils.loadScript() failure should return an error message', async ({ page }) => {
        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async () => {
                const {require_WebUtils, require_libraries} = window;
                const WebUtils = require_WebUtils();
                const libraries = require_libraries();
                const scriptURL = `${libraries.getACSAdapterCDNUrl()}/invalid`;

                const runtimeContext = {};

                try {
                    await WebUtils.default.loadScript(scriptURL);
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                }

                return runtimeContext;
            })
        ]);

        const expectedErrorMessage = "Resource failed to load, or can't be used.";
        expect(runtimeContext?.errorMessage).toBeDefined();
        expect(runtimeContext?.errorMessage).toBe(expectedErrorMessage);
    });

    test('WebUtils.loadScript() retries should be using exponential backoff', async ({page}) => {
        test.setTimeout(60 * 1000);

        await page.goto(testPage);

        const [runtimeContext] = await Promise.all([
            await page.evaluate(async () => {
                const {require_WebUtils, require_libraries} = window;
                const WebUtils = require_WebUtils();
                const libraries = require_libraries();
                const scriptURL = `${libraries.getACSAdapterCDNUrl()}/invalid`;

                const runtimeContext = {};

                try {
                    await WebUtils.default.loadScript(scriptURL, () => {}, () => {}, 4);
                } catch (err) {
                    runtimeContext.errorMessage = `${err.message}`;
                }

                runtimeContext.traces = performance.getEntries().filter((entry) => entry.initiatorType === 'script' && entry.name === scriptURL);

                return runtimeContext;
            })
        ]);

        const createDifference = (arr) => {
            const differenceArray = [];
            for (let i = 1; i < arr.length; i++) {
                differenceArray.push(arr[i].startTime - arr[i - 1].startTime);
            }

            return differenceArray;
        };

        const isAscending = (arr) => arr.every((value, index) => index === 0 || value >= arr[index - 1])
        const differenceArray = createDifference(runtimeContext.traces);
        expect(isAscending(differenceArray)).toBe(true);
    });
});
