/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const OmnichannelChatSDK = require('../src/OmnichannelChatSDK').default;

import { AWTLogManager } from "../src/external/aria/webjs/AriaSDK";
import axios from "axios";

// MRT validates Oc-Sessionid on v2 transcript calls and returns 401 when it is missing, including after
// endChat. These tests run the real OCSDK request code and replace only the HTTP adapter, so they check
// the headers that would reach MRT.
describe('Post-endChat transcript session key', () => {
    AWTLogManager.initialize = jest.fn();

    const omnichannelConfig = {
        orgUrl: 'https://org.test',
        orgId: 'org-id',
        widgetId: 'widget-id'
    };

    type RecordedRequest = { method: string; url: string; headers: Record<string, string> };
    let requests: RecordedRequest[] = [];
    let conversationCount = 0;
    let transcriptStatus = 200;
    let holdTranscriptResponses = false;
    let heldResponses: Array<() => void> = [];
    const originalAdapter = axios.defaults.adapter;

    beforeEach(() => {
        requests = [];
        conversationCount = 0;
        transcriptStatus = 200;
        holdTranscriptResponses = false;
        heldResponses = [];
        axios.defaults.adapter = (async (config: any) => {
            const headers: Record<string, string> = {};
            const rawHeaders = config.headers?.toJSON ? config.headers.toJSON() : config.headers;
            Object.keys(rawHeaders || {}).forEach((key) => { headers[key.toLowerCase()] = rawHeaders[key]; });
            requests.push({ method: (config.method || '').toUpperCase(), url: config.url, headers });

            const isTranscriptCall = config.url.includes('getchattranscripts') || config.url.includes('createemailrequest');
            if (holdTranscriptResponses && isTranscriptCall) {
                await new Promise<void>((resolve) => heldResponses.push(resolve));
            }

            let data: any = {};
            let status = 200;
            const responseHeaders: Record<string, string> = {};
            if (config.url.endsWith('/conversation')) {
                conversationCount++;
                const suffix = conversationCount === 1 ? 'A' : 'B';
                data = { ChatId: `chat-${suffix}`, Token: `token-${suffix}`, RegionGtms: '{}' };
                responseHeaders['oc-sessionid'] = `session-${suffix}`;
            } else if (isTranscriptCall) {
                status = transcriptStatus;
                data = config.url.includes('getchattranscripts') ? '{"Messages":[]}' : {};
            }

            const response = { data, status, statusText: status === 200 ? 'OK' : 'Error', headers: responseHeaders, config, request: {} };
            if (status !== 200) {
                const error: any = new Error(`Request failed with status code ${status}`);
                error.isAxiosError = true;
                error.config = config;
                error.response = response;
                throw error;
            }
            return response;
        }) as any;
    });

    afterEach(() => {
        axios.defaults.adapter = originalAdapter;
    });

    const createStartedChatSDK = async (chatSDKConfig: any = {}) => {
        const chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
        chatSDK.getChatConfig = jest.fn();
        chatSDK["isAMSClientAllowed"] = true;
        await chatSDK.initialize();

        chatSDK.ACSClient.initialize = jest.fn();
        chatSDK.ACSClient.joinConversation = jest.fn();
        chatSDK.AMSClient.initialize = jest.fn();

        await chatSDK.startChat();
        return chatSDK;
    };

    // What LCW v3 SDKAdapter.prepareTranscriptContext passes after endChat: the cached token, no sessionId.
    const contextWithoutSessionId = (chatSDK: any) => ({ chatToken: { ...chatSDK.chatToken }, requestId: chatSDK.requestId });

    const requestsMatching = (fragment: string): RecordedRequest[] => requests.filter((r) => r.url.toLowerCase().includes(fragment));

    const lastRequestMatching = (fragment: string): RecordedRequest => {
        const matches = requestsMatching(fragment);
        if (matches.length === 0) {
            throw new Error(`No request matching '${fragment}'. Requests: ${requests.map((r) => r.url).join(', ')}`);
        }
        return matches[matches.length - 1];
    };

    it('getLiveChatTranscript before endChat sends the active chat session key', async () => {
        const chatSDK = await createStartedChatSDK();
        expect(chatSDK.OCClient.sessionId).toBe('session-A');

        await chatSDK.getLiveChatTranscript();

        expect(lastRequestMatching('getchattranscripts').headers['oc-sessionid']).toBe('session-A');
    });

    it('getLiveChatTranscript after endChat sends the ended chat session key when the context has no sessionId', async () => {
        const chatSDK = await createStartedChatSDK();
        const liveChatContext = contextWithoutSessionId(chatSDK);

        await chatSDK.endChat();
        expect(chatSDK.OCClient.sessionId).toBeNull();

        await chatSDK.getLiveChatTranscript({ liveChatContext });

        const transcriptRequest = lastRequestMatching('getchattranscripts');
        expect(transcriptRequest.url).toContain('/livechatconnector/v2/getchattranscripts/chat-A/');
        expect(transcriptRequest.headers['oc-sessionid']).toBe('session-A');
    });

    it('emailLiveChatTranscript after endChat sends the ended chat session key when the context has no sessionId', async () => {
        const chatSDK = await createStartedChatSDK();
        const liveChatContext = contextWithoutSessionId(chatSDK);

        await chatSDK.endChat();
        await chatSDK.emailLiveChatTranscript({ emailAddress: 'a@b.test', attachmentMessage: 'msg' }, { liveChatContext });

        expect(lastRequestMatching('createemailrequest').headers['oc-sessionid']).toBe('session-A');
    });

    it('authenticated getLiveChatTranscript after endChat sends the ended chat session key', async () => {
        const chatSDK = await createStartedChatSDK({ getAuthToken: async () => 'authenticatedUserToken' });
        chatSDK.authenticatedUserToken = 'authenticatedUserToken';
        const liveChatContext = contextWithoutSessionId(chatSDK);

        await chatSDK.endChat();
        await chatSDK.getLiveChatTranscript({ liveChatContext });

        const transcriptRequest = lastRequestMatching('getchattranscripts');
        expect(transcriptRequest.url).toContain('/livechatconnector/v2/auth/getchattranscripts/chat-A/');
        expect(transcriptRequest.headers['oc-sessionid']).toBe('session-A');
    });

    it('never sends the ended chat session key for a different chatId', async () => {
        const chatSDK = await createStartedChatSDK();
        const liveChatContext = { ...contextWithoutSessionId(chatSDK), chatToken: { chatId: 'other-chat', token: 'other-token' } };

        await chatSDK.endChat();
        await chatSDK.getLiveChatTranscript({ liveChatContext });
        await chatSDK.emailLiveChatTranscript({ emailAddress: 'a@b.test', attachmentMessage: 'msg' }, { liveChatContext });

        expect(lastRequestMatching('getchattranscripts/other-chat/').headers['oc-sessionid']).toBeUndefined();
        expect(lastRequestMatching('createemailrequest').headers['oc-sessionid']).toBeUndefined();
    });

    it('clears the ended chat session key when the next chat starts', async () => {
        const chatSDK = await createStartedChatSDK();
        const chatAContext = contextWithoutSessionId(chatSDK);
        await chatSDK.endChat();

        await chatSDK.startChat();
        expect(chatSDK.OCClient.sessionId).toBe('session-B');
        // The new chat must not inherit chat A's key.
        expect(lastRequestMatching('/conversation').headers['oc-sessionid']).toBeUndefined();
        await chatSDK.endChat();

        await chatSDK.getLiveChatTranscript({ liveChatContext: chatAContext });

        expect(lastRequestMatching('getchattranscripts/chat-a/').headers['oc-sessionid']).toBeUndefined();
    });

    it('restores OCClient.sessionId after a post-endChat transcript call, including when MRT rejects it', async () => {
        const chatSDK = await createStartedChatSDK();
        const liveChatContext = contextWithoutSessionId(chatSDK);
        await chatSDK.endChat();

        await chatSDK.getLiveChatTranscript({ liveChatContext });
        expect(chatSDK.OCClient.sessionId).toBeNull();

        transcriptStatus = 401;
        await expect(chatSDK.getLiveChatTranscript({ liveChatContext })).rejects.toBeDefined();
        expect(chatSDK.OCClient.sessionId).toBeNull();

        await chatSDK.startChat();
        expect(lastRequestMatching('/conversation').headers['oc-sessionid']).toBeUndefined();
    });

    it('prefers a sessionId passed in the liveChatContext over the ended chat session key', async () => {
        const chatSDK = await createStartedChatSDK();
        const liveChatContext = { ...contextWithoutSessionId(chatSDK), sessionId: 'session-explicit' };

        await chatSDK.endChat();
        await chatSDK.getLiveChatTranscript({ liveChatContext });

        expect(lastRequestMatching('getchattranscripts').headers['oc-sessionid']).toBe('session-explicit');
        // The explicit key applies to that request only.
        expect(chatSDK.OCClient.sessionId).toBeNull();
    });

    const waitForRequests = async (fragment: string, count: number): Promise<void> => {
        for (let attempt = 0; attempt < 100 && requestsMatching(fragment).length < count; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
        expect(requestsMatching(fragment).length).toBeGreaterThanOrEqual(count);
    };

    const releaseHeldResponses = (): void => {
        heldResponses.splice(0).forEach((release) => release());
    };

    // Transcript and email calls don't hold the start/end lock, so other requests can run while one waits
    // for MRT. The key a transcript call needs must not reach those requests.
    it.each([
        { outcome: 'succeeds', status: 200 },
        { outcome: 'fails', status: 401 },
    ])('keeps the ended chat key off other requests while its transcript call waits and $outcome', async ({ status }) => {
        const chatSDK = await createStartedChatSDK();
        const chatAContext = contextWithoutSessionId(chatSDK);
        const otherChatContext = { ...chatAContext, chatToken: { chatId: 'other-chat', token: 'other-token' } };
        await chatSDK.endChat();

        holdTranscriptResponses = true;
        transcriptStatus = status;
        const chatATranscript = chatSDK.getLiveChatTranscript({ liveChatContext: chatAContext }).catch((error: unknown) => error);
        await waitForRequests('getchattranscripts/chat-a/', 1);
        expect(chatSDK.OCClient.sessionId).toBeNull();

        const otherTranscript = chatSDK.getLiveChatTranscript({ liveChatContext: otherChatContext }).catch((error: unknown) => error);
        const chatAEmail = chatSDK.emailLiveChatTranscript({ emailAddress: 'a@b.test', attachmentMessage: 'msg' }, { liveChatContext: chatAContext });
        await waitForRequests('getchattranscripts/other-chat/', 1);
        await waitForRequests('createemailrequest', 1);

        await chatSDK.startChat();

        releaseHeldResponses();
        await Promise.all([chatATranscript, otherTranscript, chatAEmail]);

        expect(lastRequestMatching('getchattranscripts/chat-a/').headers['oc-sessionid']).toBe('session-A');
        expect(lastRequestMatching('createemailrequest').headers['oc-sessionid']).toBe('session-A');
        expect(lastRequestMatching('getchattranscripts/other-chat/').headers['oc-sessionid']).toBeUndefined();
        expect(lastRequestMatching('/conversation').headers['oc-sessionid']).toBeUndefined();
        expect(chatSDK.OCClient.sessionId).toBe('session-B');
        expect(chatSDK.sessionId).toBe('session-B');
    });

    it('keeps an explicit context key off a chat that starts while the transcript call waits', async () => {
        const chatSDK = await createStartedChatSDK();
        const liveChatContext = { ...contextWithoutSessionId(chatSDK), sessionId: 'session-explicit' };
        await chatSDK.endChat();

        holdTranscriptResponses = true;
        const transcript = chatSDK.getLiveChatTranscript({ liveChatContext });
        const email = chatSDK.emailLiveChatTranscript({ emailAddress: 'a@b.test', attachmentMessage: 'msg' }, { liveChatContext });
        await waitForRequests('getchattranscripts', 1);
        await waitForRequests('createemailrequest', 1);
        expect(chatSDK.OCClient.sessionId).toBeNull();

        await chatSDK.startChat();
        releaseHeldResponses();
        await Promise.all([transcript, email]);

        expect(lastRequestMatching('getchattranscripts').headers['oc-sessionid']).toBe('session-explicit');
        expect(lastRequestMatching('createemailrequest').headers['oc-sessionid']).toBe('session-explicit');
        expect(lastRequestMatching('/conversation').headers['oc-sessionid']).toBeUndefined();
        expect(chatSDK.OCClient.sessionId).toBe('session-B');
    });
});
