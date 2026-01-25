# omnichannel-chat-sdk - Claude Code Instructions

## Repository Ecosystem

**This workspace may contain up to 6 related repositories. Not all teams have all repos working together.** Always be aware of which repository you're in when making changes.

| Repository | Type | Purpose | Typical Location |
|------------|------|---------|------------------|
| **CRM.Omnichannel** | Monorepo (Backend) | 20+ microservices for Omnichannel platform | `<workspace-root>/CRM.Omnichannel/` |
| **ConversationControl** | Frontend (Agent UI) | Agent experience and conversation management UI | `<workspace-root>/CRM.OmniChannel.ConversationControl/` |
| **LiveChatWidget** | Frontend (Customer) | Customer-facing chat widget | `<workspace-root>/CRM.OmniChannel.LiveChatWidget/` |
| **omnichannel-chat-sdk** | Public SDK | TypeScript SDK for chat integration | `<workspace-root>/omnichannel-chat-sdk/` |
| **omnichannel-chat-widget** | Public Components | React component library | `<workspace-root>/omnichannel-chat-widget/` |
| **omnichannel-amsclient** | Shared Library | File upload/download client | `<workspace-root>/omnichannel-amsclient/` |

---

## Quick Context
- **Purpose:** Public SDK for building custom chat experiences with Dynamics 365 Omnichannel
- **Type:** TypeScript Library (npm package)
- **Tech Stack:** TypeScript, Rollup, Jest, Playwright
- **Distribution:** npm registry (@microsoft/omnichannel-chat-sdk)
- **Consumers:** CRM.OmniChannel.LiveChatWidget, omnichannel-chat-widget, external customers

## Memory Bank & Existing Instructions (Read First)

**This repo already has comprehensive Copilot instructions. Read them ALL before any task:**

1. **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - ASK FIRST protocol, PR guidelines, coding standards
2. **[docs/copilot/CODING_GUIDELINES.md](docs/copilot/CODING_GUIDELINES.md)** - Essential patterns and requirements
3. **[docs/copilot/PROMPT_TEMPLATES.md](docs/copilot/PROMPT_TEMPLATES.md)** - Copilot prompt templates

**CRITICAL:** All existing Copilot instructions apply to Claude Code as well. Follow them strictly.

---

## Authorization Protocol (ASK FIRST)

**From copilot-instructions.md - MANDATORY:**

This repo follows a **strict "ASK FIRST" protocol**:
1. **Understand** the request and read relevant code
2. **Propose** specific changes with file paths and code snippets
3. **Explain** impact on consumers (LiveChatWidget, chat-widget, external customers)
4. **Wait** for explicit approval ("yes", "proceed", "go")
5. **Implement** only after approval

**NEVER modify code without explicit user authorization.**

---

## Architecture Overview

**What is omnichannel-chat-sdk?**

This is the official TypeScript SDK for integrating Omnichannel chat into custom applications. It provides a strongly-typed API for chat operations (start chat, send message, end chat, file attachments) and abstracts the MessagingRuntime REST APIs.

**Key Features:**
- Promise-based async API
- TypeScript type definitions
- Comprehensive error handling (ChatSDKExceptionDetails)
- Telemetry integration (startScenario → completeScenario/failScenario)
- Cross-platform support (Browser, Node.js, React Native)

**Integration:**
- **Backend:** Consumes MessagingRuntime REST APIs (`/api/messaging/v1/*`)
- **ACS:** Integrates with Azure Communication Services for chat threading
- **Consumers:** LiveChatWidget, chat-widget, external customers (public npm)

---

## Build & Test Workflow

### Prerequisites
- Node.js (version in package.json engines)
- npm package manager
- **Authentication:** `vsts-npm-auth` for Azure DevOps npm registry (internal dependencies)

### Setup
```bash
cd omnichannel-chat-sdk

# Authenticate with Azure DevOps npm registry
vsts-npm-auth -config .npmrc

# Install dependencies
npm install
```

### Common Commands

**Build:**
- **Build SDK:** `npm run build:tsc` - TypeScript compilation
- **Bundle:** `npm run build` - Rollup bundling (ESM, CJS, UMD)
- **Watch mode:** `npm run watch` - Incremental development

**Test:**
- **Unit tests:** `npm test` - Jest tests
- **E2E tests:** `npm run test:e2e` - Playwright integration tests
- **Coverage:** `npm run coverage` - Test coverage report
- **Lint:** `npm run lint` - ESLint validation

**Release:**
- **Publish:** `npm publish` - Publish to npm registry (requires npm auth)
- **Version bump:** `npm version <major|minor|patch>` - Semantic versioning

---

## Coding Standards

**Critical:** Follow [docs/copilot/CODING_GUIDELINES.md](docs/copilot/CODING_GUIDELINES.md) for all TypeScript code.

### Key Conventions from Copilot Instructions

**TypeScript Best Practices:**
- **Avoid `any` type** - Use proper type definitions
- **Strict TypeScript** - Enable strict mode in tsconfig.json
- **Explicit return types** - Always declare function return types
- **Async/await preferred** - Over .then() chains
- **Cross-platform compatibility** - Code must work in Browser, Node.js, React Native

**Telemetry Pattern (MANDATORY):**
```typescript
// ✅ CORRECT - startScenario → completeScenario/failScenario pattern
async sendMessage(message: string): Promise<void> {
    this.telemetry.startScenario('SendMessage');
    try {
        const response = await this.httpClient.post('/api/messaging/v1/messages/send', {
            conversationId: this.conversationId,
            content: message
        });
        this.telemetry.completeScenario('SendMessage');
    } catch (error) {
        this.telemetry.failScenario('SendMessage', error);
        throw new ChatSDKError('Failed to send message', error);
    }
}
```

**Error Handling (MANDATORY):**
```typescript
// Use ChatSDKExceptionDetails structure
export interface ChatSDKExceptionDetails {
    message: string;
    errorCode: string;
    innerError?: Error;
    context?: Record<string, unknown>;
}

// Example usage
throw new ChatSDKError({
    message: 'Failed to start chat',
    errorCode: 'START_CHAT_FAILED',
    innerError: error,
    context: { chatConfig }
});
```

**Method Structure:**
```typescript
// Standard async method pattern
export async function methodName(
    param1: Type1,
    param2: Type2,
    optionalConfig?: OptionalType
): Promise<ReturnType> {
    // 1. Validate inputs
    if (!param1) {
        throw new ChatSDKError({ message: 'param1 is required', errorCode: 'INVALID_INPUT' });
    }

    // 2. Start telemetry scenario
    this.telemetry.startScenario('MethodName');

    try {
        // 3. Business logic
        const result = await this.performOperation(param1, param2);

        // 4. Complete telemetry
        this.telemetry.completeScenario('MethodName');

        return result;
    } catch (error) {
        // 5. Fail telemetry and rethrow
        this.telemetry.failScenario('MethodName', error);
        throw new ChatSDKError({ message: 'Operation failed', errorCode: 'OPERATION_FAILED', innerError: error });
    }
}
```

---

## Testing Strategy

**Unit Tests (Jest):**
- **Location:** `__tests__/` directory
- **Run:** `npm test`
- **Coverage:** Maintain >80% coverage for business logic

**E2E Tests (Playwright):**
- **Location:** `playwright/` directory
- **Run:** `npm run test:e2e`
- **Purpose:** Test against real MessagingRuntime APIs (test environment)

**Test Best Practices:**
- Mock external dependencies (HTTP client, telemetry)
- Test both happy path and error scenarios
- Verify telemetry calls (startScenario, completeScenario, failScenario)
- Test cross-platform compatibility (Node.js, Browser environments)

---

## Integration with Other Repos

**This SDK integrates with:**
- **CRM.Omnichannel (Backend):** MessagingRuntime REST APIs for chat operations
- **Azure Communication Services:** Chat thread management (abstracted by backend)

**Consumed by:**
- **CRM.OmniChannel.LiveChatWidget** (npm dependency) - Customer chat widget
- **omnichannel-chat-widget** (npm peer dependency) - Shared React components
- **External customers** (public npm) - Custom chat integrations

**When changing public APIs:**
- This is a **public contract** - breaking changes affect external customers
- Use semantic versioning: major version for breaking changes
- Coordinate with LiveChatWidget and chat-widget teams
- Provide migration guide in CHANGELOG.md
- Announce breaking changes in release notes

---

## Pull Request Guidelines

From copilot-instructions.md:

1. **Code standards:** Follow docs/copilot/CODING_GUIDELINES.md
2. **Commit messages:** Conventional commit format (feat:, fix:, chore:, etc.)
3. **Testing:** All tests must pass, add tests for new functionality
4. **Documentation:** Update JSDoc comments, README.md if APIs change
5. **Authorization:** Get explicit approval before implementing
6. **CHANGELOG:** Update CHANGELOG.md under [Unreleased] section:
   - **Fixed:** for bugs
   - **Changed:** for improvements or modified functionality
   - **Added:** for new features or components

---

## Common Issues & Troubleshooting

**Authentication Issues:**
- Run `vsts-npm-auth -config .npmrc` to refresh Azure DevOps authentication
- Check internal npm feed access (requires permissions)

**Build Issues:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (must match engines in package.json)

**Test Failures:**
- Check if MessagingRuntime test environment is available
- Verify test configuration in jest.config files
- Use `npm run test:debug` for debugging

**Publish Issues:**
- Ensure you're authenticated to npm registry: `npm whoami`
- Check package version doesn't already exist
- Verify no uncommitted changes: `git status`

---

## Documentation

- **[README.md](README.md)** - SDK usage, API reference, examples
- **[CHANGELOG.md](CHANGELOG.md)** - Release history, breaking changes
- **[docs/copilot/](docs/copilot/)** - Copilot coding guidelines and templates
- **[docs/](docs/)** - Additional documentation

---

## Breaking Change Protocol

**Before making breaking changes to public APIs:**

1. **Identify impact:**
   - LiveChatWidget dependency (check package.json version)
   - chat-widget dependency (peer dependency)
   - External customers (check npm download stats)

2. **Coordination:**
   - Notify LiveChatWidget and chat-widget teams
   - Create tracking work item
   - Plan migration timeline (minimum 2 release cycles for deprecation)

3. **Implementation:**
   - Add new API (backwards-compatible)
   - Mark old API as `@deprecated` in JSDoc
   - Update CHANGELOG.md with migration guide
   - After 2 releases, remove old API (major version bump)

4. **Documentation:**
   - Update README.md with new API examples
   - Add migration guide to CHANGELOG.md
   - Update TypeScript type definitions

---

**Summary:** This is a public SDK with strict ASK FIRST protocol. Follow existing Copilot instructions, maintain telemetry patterns, use ChatSDKExceptionDetails for errors, and coordinate breaking changes with consumers.
