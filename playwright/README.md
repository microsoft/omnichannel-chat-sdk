# Playwright Tests

## Getting Started

### 1. Installation

```sh
npm install
```

### 2. Build OmnichannelChatSDK

```sh
cd ..
npm run build:tsc
cd playwright
```

### 3. Build Test Harness

```sh
npm run build:babel
npm run build:esbuild
```

### 4. Create Test Config File

```sh
cp test.config.sample.yml test.config.yml
```

### 5. Add Test Configurations

```diff
DefaultSettings:
- orgId: ""
+ orgId: "[orgId]"
- orgUrl: ""
+ orgUrl: "[orgUrl]"
- widgetId: ""
+ widgetId: "[widgetId]"
UnauthenticatedChat:

# ...
```

### 6. Run Integration Tests

```sh
npm run test:integrations
```

### 7. View Integration Tests Report

```sh
npx playwright show-report integrations-report
```

## Commands

### Run Unauthenticated Chat Scenarios

```sh
npm run test:integrations -- -g "@UnauthenticatedChat"
```

#### Directly Run Specific Chat Scenarios

```sh
./node_modules/.bin/playwright test -c playwright.config.ts --trace on --grep "@UnauthenticatedChat"
```

### Run Authenticated Chat Scenarios

```sh
npm run test:integrations -- -g "@AuthenticatedChat"
```

### Run Chat Token Renewal Scenarios

Requires a test widget configuration with chat token renewal enabled, configured under `UnauthenticatedChatWithTokenRenewal` in `test.config.yml`. These tests use the SDK directly, without loading either Live Chat Widget. Configuration can also be supplied through the existing `testConfig` environment variable.

Coverage includes healthy operations and page restore without a renewal subscriber; first-rejected message reads, typing and sends; native SDK-created Web Chat adapter polling and subsequent delivery; signaling setup during saved-context restoration; host-owned persistence after renewal and a real reload; explicit recovery opt-out; and bounded failure after anonymous renewal HTTP 400/401/403/404/405. Existing near-expiry and expired-token tests also exercise real-time delivery and attachments when the test configuration enables them. Every test attempts authorized conversation closure, including on assertion failure.

The combined-fault case consistently rejects the original credential on message polling and signaling configuration/registration, holds the real renewal request while closing the browser's established notification WebSocket, and verifies a rejected signaling attempt before releasing renewal. Reconnect exercises signaling registration; the separate saved-context restore case exercises signaling configuration. It requires recovery with no customer send/typing request, a replacement connection, at least three subsequent successful polls, an independently sent message delivered exactly once through both native notifications and the adapter, and persisted same-chat restoration after a real reload. The independent sender is a separate ACS client using the same authorized test identity, not a separately authenticated agent.

Its `recovery-session` report annotation records the saved request ID, ACS thread ID and UTC capture time for backend telemetry correlation. It does not record tokens or session keys. Correlate real renewal, message processing and conversation closure separately from browser-injected failures; MRT telemetry alone does not establish client polling or WebSocket reconnection.

Credential rejection and WebSocket closure are scoped to the test browser. They do not rotate a shared ACS resource key or certify ACS's server-side revocation behavior. SDK token renewal does not automatically persist a custom host's saved context: the host must subscribe to `onChatTokenRenewed` and update its own storage. Terminal anonymous renewal failures remain terminal; their tests verify safe failure, not successful recovery. Authenticated, persistent-chat and embedded browser flows are not certified by this suite. Network traces and recordings are disabled because they contain credentials.

```sh
PLAYWRIGHT_SLOW_MO=0 npm run test:integrations -- -g "@UnauthenticatedChatWithTokenRenewal"
```
