import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect, Page } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithTokenRenewal');
const renewChatTokenPattern = /livechatconnector\/v2\/(auth\/)?renewchattoken/i;
const acsThreadsPattern = /chat\/threads\//;

// Shifts Date in the page so the chat token can be made to look near expiry or expired without waiting for it.
const installShiftableClock = (page: Page) => page.addInitScript(() => {
    const RealDate = Date;
    let offsetInMs = 0;
    function ShiftedDate(this: unknown, ...args: unknown[]) {
        if (!(this instanceof ShiftedDate)) {
            return new RealDate(RealDate.now() + offsetInMs).toString();
        }
        return args.length ? new (RealDate as any)(...args) : new RealDate(RealDate.now() + offsetInMs);
    }
    ShiftedDate.prototype = RealDate.prototype;
    ShiftedDate.now = () => RealDate.now() + offsetInMs;
    ShiftedDate.UTC = RealDate.UTC;
    ShiftedDate.parse = RealDate.parse;
    (window as any).Date = ShiftedDate;
    // Long timers (such as the ACS credential's scheduled refresh) fire when the shifted clock passes their due time.
    const longTimerThresholdInMs = 60 * 1000;
    const longTimers = new Map<unknown, { dueInMs: number; fire: () => void }>();
    const realSetTimeout = window.setTimeout.bind(window);
    const realClearTimeout = window.clearTimeout.bind(window);
    (window as any).setTimeout = (handler: (...callbackArgs: unknown[]) => void, delay = 0, ...callbackArgs: unknown[]) => {
        if (typeof handler !== 'function' || delay < longTimerThresholdInMs) {
            return realSetTimeout(handler, delay, ...callbackArgs);
        }
        const fire = () => { longTimers.delete(id); handler(...callbackArgs); };
        const id = realSetTimeout(fire, delay);
        longTimers.set(id, { dueInMs: ShiftedDate.now() + delay, fire });
        return id;
    };
    (window as any).clearTimeout = (id: number) => { longTimers.delete(id); realClearTimeout(id); };
    (window as any).advanceClockTo = (targetInMs: number) => {
        offsetInMs += Math.max(0, targetInMs - ShiftedDate.now());
        for (const [id, timer] of [...longTimers]) {
            if (timer.dueInMs <= ShiftedDate.now()) {
                realClearTimeout(id as number);
                timer.fire();
            }
        }
    };
});

const trackNetwork = (page: Page) => {
    const state = { renewalEnabled: undefined as unknown, renewCalls: 0, acsAuthHeaders: [] as { at: number; auth: string }[] };
    page.on('response', async (response) => {
        if (response.url().includes(OmnichannelEndpoints.LiveChatConfigPath)) {
            const json = await response.json().catch(() => undefined);
            state.renewalEnabled = json?.LcwFcbConfiguration?.lcwChatTokenRenewalEnabled;
        }
    });
    page.on('request', async (request) => {
        if (renewChatTokenPattern.test(request.url())) {
            state.renewCalls++;
        }
        if (acsThreadsPattern.test(request.url())) {
            const headers = await request.allHeaders();
            state.acsAuthHeaders.push({ at: Date.now(), auth: headers['authorization'] ?? '' });
        }
    });
    return state;
};

const startChat = (page: Page) => page.evaluate(async (omnichannelConfig) => {
    const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window as any;
    const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig);
    (window as any).chatSDK = chatSDK;
    (window as any).scenarioEvents = [];
    const marker = chatSDK.scenarioMarker;
    for (const method of ['startScenario', 'completeScenario', 'failScenario']) {
        const original = marker[method].bind(marker);
        marker[method] = (event: string, props?: unknown) => {
            (window as any).scenarioEvents.push({ method, event });
            return original(event, props);
        };
    }
    await chatSDK.initialize();
    await chatSDK.startChat();
    // Customer messages are filtered out of onNewMessage, so listen on the ACS client to see real-time (WebSocket) delivery.
    (window as any).realtimeMessages = [];
    const conversationClient = chatSDK.conversation.chatClient;
    conversationClient.on('chatMessageReceived', (event: any) => {
        (window as any).realtimeMessages.push({ id: event.id, content: event.message });
    });
    // Real-time notifications are only delivered once registration completes, so wait for our own typing event to echo back.
    let realtimeReady = false;
    conversationClient.on('typingIndicatorReceived', () => { realtimeReady = true; });
    for (let i = 0; i < 15 && !realtimeReady; i++) {
        await chatSDK.sendTypingEvent();
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    if (!realtimeReady) {
        throw new Error('Real-time notifications did not start');
    }
    const token = chatSDK.chatToken.token as string;
    const expInMs = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000;
    return { token, expInMs, attachmentsAllowed: !!chatSDK.isAMSClientAllowed };
}, omnichannelConfig);

// Runs the customer-facing chat operations and returns the names of any that failed.
const exerciseChat = (page: Page, label: string, attachmentsAllowed: boolean) => page.evaluate(async ({ label, attachmentsAllowed }) => {
    const chatSDK = (window as any).chatSDK;
    const failures: string[] = [];
    const run = async (name: string, fn: () => Promise<void>) => {
        try {
            await fn();
        } catch (error) {
            failures.push(`${name}: ${(error as Error)?.message ?? error}`);
        }
    };
    const content = `token renewal ${label}`;
    const fileText = `token renewal attachment ${label} ${Math.random()}`;
    let fileMetadata: any;

    const waitForRealtime = async (match: (m: { id: string; content: string }) => boolean) => {
        for (let i = 0; i < 40; i++) {
            if (((window as any).realtimeMessages as { id: string; content: string }[]).some(match)) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        throw new Error('not received over the real-time connection');
    };

    await run('sendTypingEvent', () => chatSDK.sendTypingEvent());
    await run('sendMessage', () => chatSDK.sendMessage({ content }));
    await run('receiveMessageRealtime', () => waitForRealtime(m => m.content === content));
    if (attachmentsAllowed) {
        const seenBeforeUpload = new Set(((window as any).realtimeMessages as { id: string }[]).map(m => m.id));
        await run('uploadFileAttachment', async () => {
            const message = await chatSDK.uploadFileAttachment(new File([fileText], 'renewal.txt', { type: 'text/plain' }));
            fileMetadata = message?.fileMetadata;
            if (!fileMetadata?.id) {
                throw new Error('attachment was not sent');
            }
        });
        await run('receiveAttachmentRealtime', () => waitForRealtime(m => !seenBeforeUpload.has(m.id)));
        await run('downloadFileAttachment', async () => {
            const blob = await chatSDK.downloadFileAttachment(fileMetadata);
            if (await blob.text() !== fileText) {
                throw new Error('downloaded content does not match');
            }
        });
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    await run('getMessages', async () => {
        const messages = await chatSDK.getMessages() ?? [];
        if (!messages.some((m: any) => m.content === content)) {
            throw new Error('sent message not found');
        }
        if (fileMetadata?.id && !messages.some((m: any) => m.fileMetadata?.id === fileMetadata.id)) {
            throw new Error('attachment message not found');
        }
    });
    await run('getConversationDetails', () => chatSDK.getConversationDetails());
    return failures;
}, { label, attachmentsAllowed });

const scenarioOutcomes = (page: Page, eventName: string) => page.evaluate((eventName) =>
    ((window as any).scenarioEvents as { method: string; event: string }[])
        .filter(e => e.event === eventName && e.method !== 'startScenario')
        .map(e => e.method), eventName);

const renewalOutcomes = (page: Page) => scenarioOutcomes(page, 'RenewChatToken');

const waitForRenewal = async (page: Page) => {
    await expect.poll(async () => (await renewalOutcomes(page)).length, { timeout: 30 * 1000 }).toBeGreaterThan(0);
    return renewalOutcomes(page);
};

const currentToken = (page: Page) => page.evaluate(() => (window as any).chatSDK.chatToken.token as string);

const endChat = (page: Page) => page.evaluate(() => (window as any).chatSDK.endChat()).catch(() => undefined);

test.describe('@UnauthenticatedChat @UnauthenticatedChatWithTokenRenewal', () => {
    test.setTimeout(4 * 60 * 1000);

    test.beforeEach(async ({ page }) => {
        await installShiftableClock(page);
    });

    test('ChatSDK should renew a chat token that is about to expire and keep chat operations working', async ({ page }) => {
        const network = trackNetwork(page);
        await page.goto(testPage);
        const started = await startChat(page);
        test.skip(network.renewalEnabled !== true, 'Chat token renewal is not enabled for this widget');

        expect(await exerciseChat(page, 'before renewal', started.attachmentsAllowed)).toEqual([]);
        expect(network.renewCalls).toBe(0);

        // Past the ACS credential's 10-minute proactive refresh point while the original token is still valid.
        await page.evaluate((target) => (window as any).advanceClockTo(target), started.expInMs - 9.5 * 60 * 1000);
        const duringRenewalFailures = await exerciseChat(page, 'during renewal', started.attachmentsAllowed);
        const outcomes = await waitForRenewal(page);
        const afterRenewalFailures = await exerciseChat(page, 'after renewal', started.attachmentsAllowed);

        expect(outcomes).not.toContain('failScenario');
        expect(await currentToken(page)).not.toBe(started.token);
        expect(network.renewCalls).toBe(1);
        expect(duringRenewalFailures).toEqual([]);
        expect(afterRenewalFailures).toEqual([]);

        await endChat(page);
    });

    test('ChatSDK should renew an expired chat token and keep chat operations working', async ({ page }) => {
        const network = trackNetwork(page);
        await page.goto(testPage);
        const started = await startChat(page);
        test.skip(network.renewalEnabled !== true, 'Chat token renewal is not enabled for this widget');

        expect(await exerciseChat(page, 'before expiry', started.attachmentsAllowed)).toEqual([]);

        // The renewed token is minted on real time; wait so it still has more than the SDK's 60s minimum lifetime
        // relative to the shifted clock.
        await page.waitForTimeout(110 * 1000);
        await page.evaluate((target) => (window as any).advanceClockTo(target), started.expInMs + 30 * 1000);
        const expiredAt = Date.now();
        const afterExpiryFailures = await exerciseChat(page, 'during renewal after expiry', started.attachmentsAllowed);
        const outcomes = await waitForRenewal(page);
        const afterRenewalFailures = await exerciseChat(page, 'after renewal', started.attachmentsAllowed);
        const acsCallsAfterExpiry = network.acsAuthHeaders.filter(call => call.at >= expiredAt);

        expect(outcomes).not.toContain('failScenario');
        expect(await currentToken(page)).not.toBe(started.token);
        expect(network.renewCalls).toBe(1);
        expect(afterExpiryFailures).toEqual([]);
        expect(afterRenewalFailures).toEqual([]);
        expect(acsCallsAfterExpiry.length).toBeGreaterThan(0);
        expect(acsCallsAfterExpiry.every(call => !call.auth.endsWith(started.token))).toBe(true);

        await endChat(page);
    });

    test('ChatSDK should recover from a 401 on an unexpired chat token and keep chat operations working', async ({ page }) => {
        const network = trackNetwork(page);
        await page.goto(testPage);
        const started = await startChat(page);
        test.skip(network.renewalEnabled !== true, 'Chat token renewal is not enabled for this widget');

        expect(await exerciseChat(page, 'before 401', started.attachmentsAllowed)).toEqual([]);
        expect(network.renewCalls).toBe(0);

        // Simulates ACS rejecting the still-valid token (for example, after revocation) on the next message send.
        const sendAuthHeaders: string[] = [];
        let injected = false;
        await page.route(/chat\/threads\/[^/]+\/messages/, async (route) => {
            const request = route.request();
            if (request.method() !== 'POST') {
                return route.continue();
            }
            const auth = (await request.allHeaders())['authorization'] ?? '';
            sendAuthHeaders.push(auth);
            if (!injected && auth.endsWith(started.token)) {
                injected = true;
                return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: { code: 'Unauthorized', message: 'Injected by test' } }) });
            }
            return route.continue();
        });

        const afterUnauthorizedFailures = await exerciseChat(page, 'during 401 recovery', started.attachmentsAllowed);
        await expect.poll(async () => (await scenarioOutcomes(page, 'ChatTokenUnauthorizedRecovery')).length, { timeout: 30 * 1000 }).toBeGreaterThan(0);
        const afterRecoveryFailures = await exerciseChat(page, 'after 401 recovery', started.attachmentsAllowed);
        const recoveryOutcomes = await scenarioOutcomes(page, 'ChatTokenUnauthorizedRecovery');
        const renewedToken = await currentToken(page);

        expect(injected).toBe(true);
        expect(afterUnauthorizedFailures).toEqual([]);
        expect(afterRecoveryFailures).toEqual([]);
        expect(recoveryOutcomes).toEqual(['completeScenario']);
        expect(await renewalOutcomes(page)).toEqual(['completeScenario']);
        expect(network.renewCalls).toBe(1);
        expect(renewedToken).not.toBe(started.token);
        expect(sendAuthHeaders[0].endsWith(started.token)).toBe(true);
        expect(sendAuthHeaders.slice(1).length).toBeGreaterThan(0);
        expect(sendAuthHeaders.slice(1).every(auth => auth.endsWith(renewedToken))).toBe(true);

        await page.unroute(/chat\/threads\/[^/]+\/messages/);
        await endChat(page);
    });
});
