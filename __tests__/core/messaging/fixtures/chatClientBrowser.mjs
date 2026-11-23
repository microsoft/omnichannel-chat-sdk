import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const { window } = new JSDOM('', { url: 'https://example.invalid' });
globalThis.window = window;
globalThis.document = window.document;
globalThis.self = window;
const denyNetwork = () => { throw new Error('Unexpected network request in offline browser-build check'); };
globalThis.fetch = window.fetch = denyNetwork;
globalThis.XMLHttpRequest = window.XMLHttpRequest = class {
    constructor() { denyNetwork(); }
};

const browserEntry = import.meta.resolve('@azure/communication-chat');
assert.match(browserEntry, /\/dist\/browser\//);
const { ChatClient } = await import('@azure/communication-chat');
const options = JSON.parse(process.argv[2]);
const recoveryPolicyName = process.argv[3];
let signalingPolicyReached = false;
for (const entry of options.additionalPolicies ?? []) {
    entry.policy.sendRequest = () => { throw new Error('REST policy must not handle signaling configuration'); };
}
for (const entry of options.signalingClientOptions?.additionalPolicies ?? []) {
    entry.policy.sendRequest = async (request, next) => {
        if (entry.policy.name !== recoveryPolicyName) {
            return next(request);
        }
        assert.match(request.url, /\/chat\/config\/realTimeNotifications\?api-version=/);
        signalingPolicyReached = true;
        throw new Error('SDK signaling recovery policy reached');
    };
}
const credential = {
    getToken: async () => ({ token: 'offline-test-token', expiresOnTimestamp: Date.now() + 3600000 })
};
const client = new ChatClient('https://example.invalid', credential, options);
try {
    await assert.rejects(() => client.startRealtimeNotifications(), /SDK signaling recovery policy reached/);
    assert.equal(signalingPolicyReached, true);
    console.log(JSON.stringify({ browserBuild: true, signalingPolicyReached }));
} finally {
    await client.stopRealtimeNotifications();
    window.close();
}
