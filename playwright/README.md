# Playwright Tests

## Getting Started

### 1. Installation
```
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

### 4. Run Integration Tests

```sh
npm run test:integrations
```

### 5. View Integration Tests Report

```sh
npx playwright show-report integrations-report
```

## Commands

### Run Unauthenticated Chat Scenarios

```sh
npm run test:integrations -- -g UnauthenticatedChat
```

or

```sh
npm run test:integrations -- --grep "@UnauthenticatedChat"
```