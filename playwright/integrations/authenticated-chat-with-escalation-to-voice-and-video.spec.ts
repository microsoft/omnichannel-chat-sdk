import { test, expect } from '@playwright/test';
import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import RegexExpression from '../utils/RegexExpression';
import fetchAuthUrl from '../utils/fetchAuthUrl';
import { callingBundleVersion } from '../../src/config/settings';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('AuthenticatedChatWithEscalationToVoiceAndVideo');
const authUrl = fetchAuthUrl('AuthenticatedChatWithEscalationToVoiceAndVideo');

test.describe('AuthenticatedChat @AuthenticatedChatWithEscalationToVoiceAndVideo', () => {
    test('Authenticated Chat with Escalation to Voice & Video', async ({ page }) => {
        await page.goto(testPage);

        const [CallingBundleRequest, CallingBundleResponse, runtimeContext] = await Promise.all([
            page.waitForRequest(request => {
                return request.url().includes(RegexExpression.callingBundle) && request.url().match(RegexExpression.callingWidgetSnippetSourceRegex)?.length >= 0;
            }),
            page.waitForResponse(response => {
                return response.url().includes(RegexExpression.callingBundle) && response.url().match(RegexExpression.callingWidgetSnippetSourceRegex)?.length >= 0;
            }),
            await page.evaluate(async ({ omnichannelConfig, authUrl }) => {
                const { OmnichannelChatSDK_1: OmnichannelChatSDK } = window;

                const payload = {
                    method: "POST"
                };

                const response = await fetch(authUrl, payload);
                const authToken = await response.text();

                const chatSDKConfig = {
                    getAuthToken: () => authToken
                };

                const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);

                await chatSDK.initialize();

                const modules = exports;

                exports = undefined;

                await chatSDK.getVoiceVideoCalling();

                exports = modules;

                const chatConfig = await chatSDK.getLiveChatConfig();
                const { LiveWSAndLiveChatEngJoin: liveWSAndLiveChatEngJoin } = chatConfig;
                const { msdyn_widgetsnippet } = liveWSAndLiveChatEngJoin;
                const widgetSnippetSourceRegex = new RegExp(`src="(https:\\/\\/[\\w-.]+)[\\w-.\\/]+"`);
                const result = msdyn_widgetsnippet.match(widgetSnippetSourceRegex);

                const runtimeContext = {
                    result: result
                };

                return runtimeContext;
            }, { omnichannelConfig, authUrl })
        ]);

        const { result } = runtimeContext;
        const LiveChatWidgetLibCDNUrl = `${result[1]}/livechatwidget/v2scripts/callingsdk/${callingBundleVersion}/CallingBundle.js`;

        expect(CallingBundleRequest.url() === LiveChatWidgetLibCDNUrl).toBe(true);
        expect(CallingBundleRequest.method()).toBe('GET');
        expect(CallingBundleResponse.status()).toBe(200);
    });
});