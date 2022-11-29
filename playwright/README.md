# Playwright Tests

## Installation

```
npm install
```

## How To Run

### 1. Build Test Harness

```sh
npm run build:babel
npm run build:esbuild
```

### 2. Run Integration Tests

```sh
npm run test:integrations
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