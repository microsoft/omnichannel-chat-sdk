import fetchOmnichannelConfig from '../utils/fetchOmnichannelConfig';
import fetchTestPageUrl from '../utils/fetchTestPageUrl';
import { test, expect, Page } from '@playwright/test';
import OmnichannelEndpoints from '../utils/OmnichannelEndpoints';
import { ChatClient } from '@azure/communication-chat';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

const testPage = fetchTestPageUrl();
const omnichannelConfig = fetchOmnichannelConfig('UnauthenticatedChatWithTokenRenewal');
const renewChatTokenPattern = /livechatconnector\/v2\/(auth\/)?renewchattoken/i;
const acsThreadsPattern = /chat\/threads\//;
// Network artifacts contain credentials; retain only assertions and session identifiers.
test.use({ trace: 'off', video: 'off', screenshot: 'off' });

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
    (window as any).resetClock = () => { offsetInMs = 0; };
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

const startChat = (page: Page, chatSDKConfig = {}, restore = false) => page.evaluate(async ({ omnichannelConfig, chatSDKConfig, restore }) => {
    const {OmnichannelChatSDK_1: OmnichannelChatSDK} = window as any;
    const chatSDK = new OmnichannelChatSDK.default(omnichannelConfig, chatSDKConfig);
    (window as any).chatSDK = chatSDK;
    (window as any).scenarioEvents = [];
    const marker = chatSDK.scenarioMarker;
    for (const method of ['startScenario', 'completeScenario', 'failScenario']) {
        const original = marker[method].bind(marker);
        marker[method] = (event: string, props?: unknown) => {
            (window as any).scenarioEvents.push({ method, event });
            if (method === 'completeScenario' && event === 'RenewChatToken' && (window as any).resetClockAfterRenewal) {
                // The live API mints on real time; do not make its fresh token look near expiry too.
                (window as any).resetClock();
            }
            return original(event, props);
        };
    }
    await chatSDK.initialize();
    const liveChatContext = restore ? JSON.parse(sessionStorage.getItem('sdkRecoveryContext') as string) : undefined;
    await chatSDK.startChat(liveChatContext ? { liveChatContext } : {});
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
}, { omnichannelConfig, chatSDKConfig, restore });

// Runs the customer-facing chat operations and returns the names of any that failed.
const exerciseChat = (page: Page, label: string, attachmentsAllowed: boolean) => page.evaluate(async ({ label, attachmentsAllowed }) => {
    const chatSDK = (window as any).chatSDK;
    const failures: string[] = [];
    const run = async (name: string, fn: () => Promise<void>) => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        try {
            await Promise.race([
                fn(),
                new Promise<never>((_, reject) => {
                    timeoutId = setTimeout(() => reject(new Error('Operation exceeded 45 seconds')), 45 * 1000);
                })
            ]);
        } catch (error) {
            failures.push(`${name}: ${(error as Error)?.message ?? error}`);
        } finally {
            clearTimeout(timeoutId);
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
        if (messages.filter((m: any) => m.content === content).length !== 1) {
            throw new Error('sent message missing or duplicated');
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

const endChat = async (page: Page) => {
    if (!await page.evaluate(() => Boolean((window as any).chatSDK?.chatToken?.chatId))) {
        return;
    }
    const closed = page.waitForResponse(response =>
        response.request().method() === 'POST' && (
            response.url().includes(OmnichannelEndpoints.LiveChatSessionClosePath)
            || /\/conversation\/[^/?]+\/close/i.test(response.url())
        ));
    await page.evaluate(async () => {
        (window as any).adapterSubscription?.unsubscribe();
        (window as any).recoveryAdapter?.end();
        (window as any).adapterConnectionSubscription?.unsubscribe();
        await (window as any).chatSDK.endChat();
    });
    const response = await closed;
    expect(response.ok()).toBe(true);
    test.info().annotations.push({ type: 'conversation-cleanup', description: `HTTP ${response.status()}` });
};

const rejectOriginalCredential = async (page: Page, pattern: RegExp, originalToken: string, method?: string) => {
    const attempts: boolean[] = [];
    await page.route(pattern, async route => {
        const request = route.request();
        if (method && request.method() !== method) {
            return route.continue();
        }
        const original = ((await request.allHeaders())['authorization'] ?? '').endsWith(originalToken);
        attempts.push(original);
        if (original) {
            return route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ error: { code: 'Unauthorized', message: 'Injected by test' } })
            });
        }
        return route.continue();
    });
    return attempts;
};

const saveContext = (page: Page) => page.evaluate(async () => {
    const context = await (window as any).chatSDK.getCurrentLiveChatContext();
    sessionStorage.setItem('sdkRecoveryContext', JSON.stringify(context));
    return { requestId: context.requestId, chatId: context.chatToken.chatId };
});

const expectSameSavedChat = async (page: Page, saved: { requestId: string; chatId: string }) => {
    expect(await page.evaluate(async saved => {
        const context = await (window as any).chatSDK.getCurrentLiveChatContext();
        return context.requestId === saved.requestId && context.chatToken.chatId === saved.chatId;
    }, saved)).toBe(true);
};

const installTrackedNotificationTransport = (page: Page) => page.addInitScript(() => {
    const NativeWebSocket = window.WebSocket;
    const sockets = new Set<WebSocket>();
    let opened = 0;
    let closed = 0;
    window.WebSocket = class extends NativeWebSocket {
        constructor(url: string | URL, protocols?: string | string[]) {
            super(url, protocols);
            if (/trouter/i.test(new URL(String(url)).hostname)) {
                sockets.add(this);
                this.addEventListener('open', () => { opened++; });
                this.addEventListener('close', () => { closed++; sockets.delete(this); });
            }
        }
    };
    Object.defineProperty(window, 'recoveryTransport', {
        value: {
            snapshot: () => ({ opened, closed, active: [...sockets].filter(socket => socket.readyState === NativeWebSocket.OPEN).length }),
            disconnect: () => {
                const active = [...sockets].filter(socket => socket.readyState === NativeWebSocket.OPEN);
                active.forEach(socket => socket.close(4001, 'Browser-local recovery test'));
                return active.length;
            }
        }
    });
});

const connectNativeAdapter = async (page: Page) => {
    await page.evaluate(async () => {
        const adapter = await (window as any).chatSDK.createChatAdapter();
        (window as any).recoveryAdapter = adapter;
        (window as any).adapterMessages = [];
        (window as any).adapterFailed = false;
        (window as any).adapterConnectionSubscription = adapter.connectionStatus$.subscribe((status: number) => {
            (window as any).adapterConnectionStatus = status;
        });
        (window as any).adapterSubscription = adapter.activity$.subscribe({
            next: (activity: { text?: string }) => {
                if (activity.text) {
                    (window as any).adapterMessages.push(activity.text);
                }
            },
            error: () => { (window as any).adapterFailed = true; }
        });
    });
    await expect.poll(() => page.evaluate(() => (window as any).adapterConnectionStatus)).toBe(2);
};

const sendIndependentMessage = async (page: Page, content: string) => {
    const { token, acsEndpoint, chatId } = await page.evaluate(() => {
        const { token, acsEndpoint, chatId } = (window as any).chatSDK.chatToken;
        return { token, acsEndpoint, chatId };
    });
    const credential = new AzureCommunicationTokenCredential(token);
    try {
        const sender = new ChatClient(acsEndpoint, credential).getChatThreadClient(chatId);
        await sender.sendMessage({ content }, { senderDisplayName: 'SDK recovery test sender' });
    } finally {
        credential.dispose();
    }
};

test.describe('@UnauthenticatedChat @UnauthenticatedChatWithTokenRenewal', () => {
    test.setTimeout(4 * 60 * 1000);

    test.beforeEach(async ({ page }) => {
        await installShiftableClock(page);
    });

    test.afterEach(async ({ page }) => {
        await endChat(page);
    });

    test('SDK-only healthy operations and page restore need no renewal subscriber', async ({ page }) => {
        const network = trackNetwork(page);
        await page.goto(testPage);
        const started = await startChat(page);
        expect(await exerciseChat(page, 'healthy SDK-only', started.attachmentsAllowed)).toEqual([]);
        const saved = await saveContext(page);
        await page.reload();
        const restored = await startChat(page, {}, true);
        await expectSameSavedChat(page, saved);
        expect(await exerciseChat(page, 'healthy SDK-only restore', restored.attachmentsAllowed)).toEqual([]);
        expect(network.renewCalls).toBe(0);
    });

    for (const operation of ['getMessages', 'sendTypingEvent'] as const) {
        test(`SDK-only ${operation} recovers when its request is the first rejected call`, async ({ page }) => {
            const network = trackNetwork(page);
            await page.goto(testPage);
            const started = await startChat(page);
            expect(network.renewalEnabled).toBe(true);
            const saved = await saveContext(page);
            const pattern = operation === 'getMessages' ? /chat\/threads\/[^/]+\/messages/ : /chat\/threads\/[^/]+\/typing/;
            const attempts = await rejectOriginalCredential(page, pattern, started.token, operation === 'getMessages' ? 'GET' : 'POST');
            await expect.poll(async () => {
                await page.evaluate(async operation => { await (window as any).chatSDK[operation](); }, operation);
                return attempts.length;
            }, { timeout: 20 * 1000 }).toBeGreaterThan(0);
            expect(attempts).toEqual([true, false]);
            expect(network.renewCalls).toBe(1);
            expect(await scenarioOutcomes(page, 'ChatTokenUnauthorizedRecovery')).toEqual(['completeScenario']);
            await expectSameSavedChat(page, saved);
            expect(await exerciseChat(page, `after first ${operation} rejection`, started.attachmentsAllowed)).toEqual([]);
            expect(network.renewCalls).toBe(1);
        });
    }

    test('SDK-created Web Chat adapter keeps polling and delivering after a polling-first 401', async ({ page }) => {
        const network = trackNetwork(page);
        let reads = 0;
        page.on('request', request => {
            if (request.method() === 'GET' && /chat\/threads\/[^/]+\/messages/.test(request.url())) {
                reads++;
            }
        });
        await page.goto(testPage);
        const started = await startChat(page);
        expect(network.renewalEnabled).toBe(true);
        await connectNativeAdapter(page);
        await expect.poll(() => reads, { timeout: 45 * 1000 }).toBeGreaterThan(0);
        const attempts = await rejectOriginalCredential(page, /chat\/threads\/[^/]+\/messages/, started.token, 'GET');
        await expect.poll(() => network.renewCalls, { timeout: 75 * 1000 }).toBe(1);
        await expect.poll(() => attempts.length).toBeGreaterThanOrEqual(2);
        expect(attempts.slice(0, 2)).toEqual([true, false]);
        const marker = `SDK adapter recovery ${Date.now()}`;
        await page.evaluate(marker => (window as any).chatSDK.sendMessage({ content: marker }), marker);
        await expect.poll(() => page.evaluate(marker =>
            ((window as any).adapterMessages as string[]).filter(text => text === marker).length, marker
        ), { timeout: 45 * 1000 }).toBe(1);
        expect(await page.evaluate(() => (window as any).adapterFailed)).toBe(false);
        const readsAfterRecovery = reads;
        await expect.poll(() => reads, { timeout: 45 * 1000 }).toBeGreaterThan(readsAfterRecovery);
        expect(network.renewCalls).toBe(1);
    });

    test('SDK-only combined credential rejection and notification disconnect recovers without customer activity', async ({ page }) => {
        const network = trackNetwork(page);
        await installTrackedNotificationTransport(page);
        let reads = 0;
        let faultArmed = false;
        let recoveryComplete = false;
        let customerWritesBeforeRecovery = 0;
        page.on('request', request => {
            if (request.method() === 'GET' && /chat\/threads\/[^/]+\/messages/.test(request.url())) {
                reads++;
            }
            if (faultArmed && !recoveryComplete && request.method() === 'POST'
                && /chat\/threads\/[^/]+\/(messages|typing)/.test(request.url())) {
                customerWritesBeforeRecovery++;
            }
        });
        await page.goto(testPage);
        const started = await startChat(page);
        expect(network.renewalEnabled).toBe(true);
        const saved = await saveContext(page);
        test.info().annotations.push({
            type: 'recovery-session',
            description: JSON.stringify({
                requestId: saved.requestId,
                chatId: saved.chatId,
                capturedAt: new Date().toISOString()
            })
        });
        await connectNativeAdapter(page);
        await expect.poll(() => reads, { timeout: 45 * 1000 }).toBeGreaterThan(0);
        const before = await page.evaluate(() => (window as any).recoveryTransport.snapshot());
        expect(before.active).toBeGreaterThan(0);
        await page.evaluate(() => {
            const sdk = (window as any).chatSDK;
            (window as any).renewedNotifications = 0;
            sdk.onChatTokenRenewed(async () => {
                sessionStorage.setItem('sdkRecoveryContext', JSON.stringify(await sdk.getCurrentLiveChatContext()));
                (window as any).renewedNotifications++;
            });
        });

        let releaseRenewal: () => void = () => { throw new Error('Renewal gate was not initialized'); };
        const renewalGate = new Promise<void>(resolve => { releaseRenewal = resolve; });
        await page.route(renewChatTokenPattern, async route => {
            await renewalGate;
            return route.continue();
        });
        const rejected: string[] = [];
        const succeeded: string[] = [];
        const rejectedSignalingRoutes = new Set<string>();
        const faultPattern = /\/chat\/|\/v3\/registrations/i;
        const requestKind = (url: string, method: string) => {
            if (method === 'GET' && /\/chat\/threads\/[^/]+\/messages/.test(url)) {
                return 'polling';
            }
            return /\/chat\/config\/realTimeNotifications|\/v3\/registrations/i.test(url) ? 'signaling' : undefined;
        };
        await page.route(faultPattern, async route => {
            const request = route.request();
            const kind = requestKind(request.url(), request.method());
            if (!kind) {
                return route.continue();
            }
            const headers = await request.allHeaders();
            const original = Object.values(headers).some(value => value.includes(started.token))
                || (request.postData() ?? '').includes(started.token);
            if (original) {
                rejected.push(kind);
                if (kind === 'signaling') {
                    rejectedSignalingRoutes.add(/\/v3\/registrations/i.test(request.url()) ? 'registration' : 'configuration');
                }
                return route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: { code: 'Unauthorized', message: 'Injected by test' } })
                });
            }
            return route.continue();
        });
        page.on('response', response => {
            const kind = requestKind(response.url(), response.request().method());
            if (kind && response.ok()) {
                succeeded.push(kind);
            }
        });
        faultArmed = true;
        try {
            await expect.poll(() => rejected.includes('polling'), { timeout: 45 * 1000 }).toBe(true);
            expect(await page.evaluate(() => (window as any).recoveryTransport.disconnect())).toBeGreaterThan(0);
            await expect.poll(() => rejected.includes('signaling'), { timeout: 30 * 1000 }).toBe(true);
        } finally {
            releaseRenewal();
        }
        await expect.poll(() => page.evaluate(() => (window as any).renewedNotifications), { timeout: 45 * 1000 }).toBe(1);
        await expect.poll(() => page.evaluate(() => (window as any).recoveryTransport.snapshot().closed)).toBeGreaterThan(before.closed);
        await expect.poll(() => page.evaluate(() => (window as any).recoveryTransport.snapshot().opened), { timeout: 75 * 1000 }).toBeGreaterThan(before.opened);
        await expect.poll(() => succeeded.includes('polling'), { timeout: 45 * 1000 }).toBe(true);
        await expect.poll(() => succeeded.includes('signaling'), { timeout: 45 * 1000 }).toBe(true);
        expect(network.renewCalls).toBe(1);
        expect((await currentToken(page)) !== started.token).toBe(true);
        const successfulPollsAfterRecovery = succeeded.filter(kind => kind === 'polling').length;
        await expect.poll(() => succeeded.filter(kind => kind === 'polling').length, { timeout: 45 * 1000 })
            .toBeGreaterThanOrEqual(successfulPollsAfterRecovery + 3);
        const subsequentSuccessfulPolls = succeeded.filter(kind => kind === 'polling').length - successfulPollsAfterRecovery;
        expect(customerWritesBeforeRecovery).toBe(0);
        recoveryComplete = true;
        const recoveredTransport = await page.evaluate(() => (window as any).recoveryTransport.snapshot());
        expect(recoveredTransport.active).toBeGreaterThan(0);

        const marker = `Independent combined recovery ${Date.now()}`;
        await sendIndependentMessage(page, marker);
        await expect.poll(() => page.evaluate(marker =>
            ((window as any).realtimeMessages as { content: string }[]).filter(message => message.content === marker).length, marker
        ), { timeout: 45 * 1000 }).toBe(1);
        await expect.poll(() => page.evaluate(marker =>
            ((window as any).adapterMessages as string[]).filter(text => text === marker).length, marker
        ), { timeout: 45 * 1000 }).toBe(1);
        expect(await page.evaluate(() => (window as any).adapterFailed)).toBe(false);
        await expectSameSavedChat(page, saved);
        expect(await page.evaluate(() =>
            JSON.parse(sessionStorage.getItem('sdkRecoveryContext') as string).chatToken.token === (window as any).chatSDK.chatToken.token
        )).toBe(true);
        await page.reload();
        const restored = await startChat(page, {}, true);
        await expectSameSavedChat(page, saved);
        expect(await exerciseChat(page, 'after combined fault and reload', restored.attachmentsAllowed)).toEqual([]);
        expect(network.renewCalls).toBe(1);
        test.info().annotations.push({
            type: 'combined-recovery',
            description: JSON.stringify({
                rejectedPolling: rejected.filter(kind => kind === 'polling').length,
                rejectedSignaling: rejected.filter(kind => kind === 'signaling').length,
                rejectedSignalingRoutes: [...rejectedSignalingRoutes],
                successfulPolling: succeeded.filter(kind => kind === 'polling').length,
                subsequentSuccessfulPolls,
                successfulSignaling: succeeded.filter(kind => kind === 'signaling').length,
                originalSocketsOpened: before.opened,
                recoveredSocketsOpened: recoveredTransport.opened,
                recoveredSocketsClosed: recoveredTransport.closed,
                renewCalls: network.renewCalls,
                customerWritesBeforeRecovery,
                independentNativeAndAdapterDelivery: true,
                persistedSameChatReload: true
            })
        });
    });

    test('SDK-only restore renews a saved credential rejected by signaling setup', async ({ page }) => {
        const network = trackNetwork(page);
        await page.goto(testPage);
        const started = await startChat(page);
        expect(network.renewalEnabled).toBe(true);
        const saved = await saveContext(page);
        const attempts = await rejectOriginalCredential(page, /chat\/config\/realTimeNotifications/i, started.token, 'GET');
        await page.reload();
        const restored = await startChat(page, {}, true);
        expect(attempts).toEqual([true, false]);
        expect(network.renewCalls).toBe(1);
        await expectSameSavedChat(page, saved);
        expect(await exerciseChat(page, 'after SDK-only signaling restore', restored.attachmentsAllowed)).toEqual([]);
        await saveContext(page);
        await page.reload();
        await startChat(page, {}, true);
        await expectSameSavedChat(page, saved);
        expect(network.renewCalls).toBe(1);
    });

    test('SDK-only hosts can persist renewed context and restore the same chat after reload', async ({ page }) => {
        const network = trackNetwork(page);
        await page.goto(testPage);
        const started = await startChat(page);
        expect(network.renewalEnabled).toBe(true);
        const saved = await saveContext(page);
        await page.evaluate(() => {
            const sdk = (window as any).chatSDK;
            (window as any).renewedNotifications = 0;
            sdk.onChatTokenRenewed(async () => {
                sessionStorage.setItem('sdkRecoveryContext', JSON.stringify(await sdk.getCurrentLiveChatContext()));
                (window as any).renewedNotifications++;
            });
        });
        const attempts = await rejectOriginalCredential(page, /chat\/threads\/[^/]+\/messages/, started.token);
        await page.evaluate(() => (window as any).chatSDK.getMessages());
        expect(attempts).toEqual([true, false]);
        await expect.poll(() => page.evaluate(() => (window as any).renewedNotifications)).toBe(1);
        expect(await page.evaluate(() =>
            JSON.parse(sessionStorage.getItem('sdkRecoveryContext') as string).chatToken.token === (window as any).chatSDK.chatToken.token
        )).toBe(true);
        await page.reload();
        const restored = await startChat(page, {}, true);
        await expectSameSavedChat(page, saved);
        expect(await exerciseChat(page, 'after host-persisted renewal', restored.attachmentsAllowed)).toEqual([]);
        expect(network.renewCalls).toBe(1);
    });

    test('SDK-only opt-out preserves rejection without starting token renewal', async ({ page }) => {
        const network = trackNetwork(page);
        await page.goto(testPage);
        const started = await startChat(page, { chatTokenRenewal: { disableUnauthorizedRecovery: true } });
        const attempts = await rejectOriginalCredential(page, /chat\/threads\/[^/]+\/messages/, started.token, 'GET');
        const rejected = await page.evaluate(async () => (await (window as any).chatSDK.getMessages()) === undefined);
        expect(rejected).toBe(true);
        expect(attempts).toEqual([true]);
        expect(network.renewCalls).toBe(0);
        expect(await scenarioOutcomes(page, 'GetMessages')).toEqual(['failScenario']);
    });

    for (const status of [400, 401, 403, 404, 405]) {
        test(`SDK-only anonymous renewal HTTP ${status} fails safely without a retry loop`, async ({ page }) => {
            const network = trackNetwork(page);
            await page.goto(testPage);
            const started = await startChat(page);
            expect(network.renewalEnabled).toBe(true);
            await rejectOriginalCredential(page, /chat\/threads\/[^/]+\/messages/, started.token, 'GET');
            await page.route(renewChatTokenPattern, route => route.fulfill({
                status, contentType: 'application/json', body: JSON.stringify({ Message: 'Injected terminal renewal failure' })
            }));
            const requestRejected = () => page.evaluate(async () => (await (window as any).chatSDK.getMessages()) === undefined);
            expect(await requestRejected()).toBe(true);
            expect(network.renewCalls).toBe(1);
            await page.evaluate(target => (window as any).advanceClockTo(target), Date.now() + 65 * 1000);
            expect(await requestRejected()).toBe(true);
            expect(network.renewCalls).toBe(1);
            expect(await renewalOutcomes(page)).toEqual(['failScenario']);
            expect(await scenarioOutcomes(page, 'GetMessages')).toEqual(['failScenario', 'failScenario']);
            expect((await currentToken(page)) === started.token).toBe(true);
        });
    }

    test('ChatSDK should renew a chat token that is about to expire and keep chat operations working', async ({ page }) => {
        const network = trackNetwork(page);
        await page.goto(testPage);
        const started = await startChat(page);
        test.skip(network.renewalEnabled !== true, 'Chat token renewal is not enabled for this widget');

        expect(await exerciseChat(page, 'before renewal', started.attachmentsAllowed)).toEqual([]);
        expect(network.renewCalls).toBe(0);

        // Past the ACS credential's 10-minute proactive refresh point while the original token is still valid.
        await page.evaluate((target) => {
            (window as any).resetClockAfterRenewal = true;
            (window as any).advanceClockTo(target);
        }, started.expInMs - 9.5 * 60 * 1000);
        const duringRenewalFailures = await exerciseChat(page, 'during renewal', started.attachmentsAllowed);
        const outcomes = await waitForRenewal(page);
        const afterRenewalFailures = await exerciseChat(page, 'after renewal', started.attachmentsAllowed);

        expect(outcomes).not.toContain('failScenario');
        expect((await currentToken(page)) !== started.token).toBe(true);
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
        await page.evaluate((target) => {
            (window as any).resetClockAfterRenewal = true;
            (window as any).advanceClockTo(target);
        }, started.expInMs + 30 * 1000);
        const expiredAt = Date.now();
        const afterExpiryFailures = await exerciseChat(page, 'during renewal after expiry', started.attachmentsAllowed);
        const outcomes = await waitForRenewal(page);
        const afterRenewalFailures = await exerciseChat(page, 'after renewal', started.attachmentsAllowed);
        const acsCallsAfterExpiry = network.acsAuthHeaders.filter(call => call.at >= expiredAt);

        expect(outcomes).not.toContain('failScenario');
        expect((await currentToken(page)) !== started.token).toBe(true);
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
        expect(renewedToken !== started.token).toBe(true);
        expect(sendAuthHeaders[0].endsWith(started.token)).toBe(true);
        expect(sendAuthHeaders.slice(1).length).toBeGreaterThan(0);
        expect(sendAuthHeaders.slice(1).every(auth => auth.endsWith(renewedToken))).toBe(true);

        await page.unroute(/chat\/threads\/[^/]+\/messages/);
        await endChat(page);
    });
});
