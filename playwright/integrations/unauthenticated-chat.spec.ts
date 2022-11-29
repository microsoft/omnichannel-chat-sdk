import { test, expect } from '@playwright/test';
import {join} from 'path';

const testPage = join('file:', __dirname, '..', 'public', 'index.html');
const omnichannelConfig = {
    orgId: "",
    orgUrl: "",
    widgetId: ""
};

test('ChatSDK.initialize() should fetch the live chat configuration', async ({ page }) => {
    await page.goto(testPage);

    const [request, response] = await Promise.all([
        page.waitForRequest(request => {
            return request.url().includes("livechatconnector/config");
        }),
        page.waitForResponse(response => {
            return response.url().includes("livechatconnector/config");
        }),
        await page.evaluate(async ({ omnichannelConfig }) => {
            const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window;
            const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);

            chatSDK.setDebug(true);
            await chatSDK.initialize();
        }, { omnichannelConfig })
    ]);

    const liveChatConfigPath = "livechatconnector/config";
    expect(request.url().includes(liveChatConfigPath)).toBe(true);
    expect(response.status()).toBe(200);
});