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

Requires a widget with chat token renewal enabled, configured under `UnauthenticatedChatWithTokenRenewal` in `test.config.yml`. The tests shift the page clock so the chat token looks about to expire or expired, then check that chat operations keep working with the renewed token. Each test takes about 2 minutes.

```sh
PLAYWRIGHT_SLOW_MO=0 npm run test:integrations -- -g "@UnauthenticatedChatWithTokenRenewal"
```
