# Omnichannel Chat SDK - GitHub Copilot Coding Guidelines

This document provides comprehensive coding guidelines and best practices for GitHub Copilot when working on the Omnichannel Chat SDK. These guidelines ensure consistency with the existing codebase patterns and maintain high code quality standards.

## Table of Contents

- [Code Structure & Organization](#code-structure--organization)
- [Error Handling & Telemetry](#error-handling--telemetry)
- [Method Structure Pattern](#method-structure-pattern)
- [Type Safety & Validation](#type-safety--validation)
- [Conditional Logic & Comments](#conditional-logic--comments)
- [Configuration & Feature Flags](#configuration--feature-flags)
- [Async Operations & Promises](#async-operations--promises)
- [Testing Considerations](#testing-considerations)
- [Platform Compatibility](#platform-compatibility)
- [Performance & Resource Management](#performance--resource-management)
- [Documentation & Comments](#documentation--comments)
- [Security & Authentication](#security--authentication)
- [Naming Conventions](#naming-conventions)
- [Code Review Checklist](#code-review-checklist)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

## Code Structure & Organization

- Follow the existing class-based architecture with clear separation between public and private methods
- Group related functionality together (e.g., all telemetry operations, all authentication methods)
- Use descriptive method names that clearly indicate their purpose and scope
- Maintain consistent indentation (4 spaces) and formatting throughout
- Organize imports logically and remove unused imports
- Keep classes focused on a single responsibility

## Error Handling & Telemetry

**Always** implement comprehensive telemetry logging for all operations:

- Wrap operations in try-catch blocks with proper telemetry logging
- Use the scenario marker pattern: `startScenario()` → `completeScenario()` or `failScenario()`
- Follow the telemetry event naming convention from `TelemetryEvent` enum
- Include relevant context in telemetry calls (RequestId, ChatId, etc.)
- Use `exceptionThrowers` utility for consistent error handling and telemetry
- Structure exception details with `response`, `message`, and `errorObject` properties

### Example Exception Details Structure

```typescript
const exceptionDetails: ChatSDKExceptionDetails = {
    response: 'SpecificErrorType',
    message: 'Human-readable error description',
    errorObject: String(error)
};
```

## Method Structure Pattern

Follow this consistent pattern for all public async methods:

```typescript
public async methodName(params: Type): Promise<ReturnType> {
    this.scenarioMarker.startScenario(TelemetryEvent.MethodName, {
        RequestId: this.requestId,
        ChatId: this.chatToken.chatId as string
    });

    if (!this.isInitialized) {
        exceptionThrowers.throwUninitializedChatSDK(this.scenarioMarker, TelemetryEvent.MethodName);
    }

    try {
        // Main logic here
        
        this.scenarioMarker.completeScenario(TelemetryEvent.MethodName, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });

        return result;
    } catch (error) {
        // Handle specific error cases
        this.scenarioMarker.failScenario(TelemetryEvent.MethodName, {
            RequestId: this.requestId,
            ChatId: this.chatToken.chatId as string
        });
        
        throw error; // or handle appropriately
    }
}
```

## Type Safety & Validation

- Use TypeScript interfaces and types consistently
- Validate inputs and check for required conditions before processing
- Use optional chaining (`?.`) and nullish coalescing (`??`) operators appropriately
- Cast types only when necessary and use `as` assertions sparingly
- Prefer `Boolean()` constructor over `!!` for explicit boolean conversion
- Define clear interfaces for method parameters and return types

### Example Type Usage

```typescript
// Good
const isLivechatContextPresent = Boolean(liveChatContext && Object.keys(liveChatContext).length > 0);

// Avoid
const isLivechatContextPresent = !!(liveChatContext && Object.keys(liveChatContext).length > 0);
```

## Conditional Logic & Comments

- Write clear, descriptive comments for complex conditional logic
- Use positive conditions when possible for better readability
- For complex conditions, break them down with descriptive variable names
- Document the intent of conditional checks, especially for business rules
- Use early returns to reduce nesting and improve readability

### Example Complex Conditional Logic

```typescript
const isLivechatContextPresent = Boolean(liveChatContext && Object.keys(liveChatContext).length > 0);
const isReconnectIdPresent = Boolean(this.reconnectId && this.reconnectId.trim().length > 0);

/**
 * Only cleanup if it's a MessagingClientConversationJoinFailure on a freshly created conversation
 *
 * DO NOT continue if:
 * - The error is not a ChatSDKError or not related to conversation join failure
 * - The conversation is not freshly created (i.e., if `useCreateConversation` is disabled)
 * - The conversation was previously created (i.e., if `isLivechatContextPresent` is true)
 * - The error is related to a reconnect attempt (i.e., if `isReconnectIdPresent` is true)
 */
if (!(error instanceof ChatSDKError &&
    error?.message === ChatSDKErrorName.MessagingClientConversationJoinFailure &&
    !this.chatSDKConfig.useCreateConversation?.disable &&
    !isLivechatContextPresent &&
    !isReconnectIdPresent)) {
    return;
}
```

## Configuration & Feature Flags

- Check feature flags and configuration before executing functionality
- Use the existing patterns for optional parameters and default values
- Respect disable flags (`disable: true` means feature is disabled)
- Handle backward compatibility considerations appropriately

### Example Feature Flag Check

```typescript
if (this.chatSDKConfig.persistentChat?.disable) {
    // Skip persistent chat functionality
    return;
}
```

## Async Operations & Promises

- Use `async/await` consistently rather than mixing with `.then()`
- Handle Promise rejections appropriately with try-catch
- Don't use `async` in arrow functions unless necessary
- Use `Promise.all()` for parallel operations when appropriate
- Avoid async promise executors (use regular Promise constructor when needed)

## Testing Considerations

- Structure code to be easily testable with dependency injection
- Use the existing mocking patterns for external dependencies
- Write unit tests that cover both success and failure scenarios
- Test edge cases and boundary conditions
- Mock external services and focus on testing the logic
- Follow the existing test file naming conventions (`*.spec.ts`)

## Platform Compatibility

- Use the `platform` utility to check for Node.js, React Native, or browser environments
- Implement platform-specific logic when needed
- Throw appropriate errors for unsupported platforms
- Use feature detection rather than platform detection when possible

### Example Platform Check

```typescript
if (platform.isNode() || platform.isReactNative()) {
    const message = "Feature is only supported on browser";
    exceptionThrowers.throwUnsupportedPlatform(this.scenarioMarker, TelemetryEvent.MethodName, message);
}
```

## Performance & Resource Management

- Avoid memory leaks by properly cleaning up resources
- Use lazy initialization for expensive operations
- Cache results when appropriate (following existing patterns)
- Be mindful of repeated network calls and batch when possible
- Don't hold references to large objects unnecessarily

## Documentation & Comments

- Use JSDoc comments for public methods with parameter descriptions
- Include examples in complex method documentation
- Comment the "why" not just the "what" for business logic
- Keep comments up-to-date with code changes
- Use TODO comments sparingly and with context

### Example JSDoc

```typescript
/**
 * Gets PreChat Survey.
 * @param parse Whether to parse PreChatSurvey to JSON or not.
 * @returns Promise resolving to the pre-chat survey response
 */
public async getPreChatSurvey(parse = true): Promise<GetPreChatSurveyResponse> {
    // Implementation
}
```

## Security & Authentication

- Handle authentication tokens securely
- Validate user inputs appropriately
- Use the existing authentication patterns and flows
- Don't log sensitive information in telemetry or console outputs
- Follow the principle of least privilege for API calls

## Naming Conventions

- Use camelCase for variables and methods
- Use PascalCase for classes, interfaces, and enums
- Use descriptive names that indicate purpose and type
- Prefix private methods with descriptive context
- Use consistent naming patterns across similar functionality

### Examples

```typescript
// Variables and methods
const isLivechatContextPresent = Boolean(...);
public async startChat(): Promise<void> { }
private async cleanupFailedConversation(): Promise<void> { }

// Classes and interfaces
class OmnichannelChatSDK { }
interface StartChatOptionalParams { }
enum TelemetryEvent { }
```

## Code Review Checklist

- [ ] Proper telemetry logging (start/complete/fail)
- [ ] Error handling with appropriate exception details
- [ ] Input validation and initialization checks
- [ ] Platform compatibility considerations
- [ ] Type safety and proper TypeScript usage
- [ ] Clear, descriptive comments for complex logic
- [ ] Consistent formatting and naming conventions
- [ ] No sensitive information in logs
- [ ] Appropriate use of async/await patterns
- [ ] Resource cleanup and memory management
- [ ] Unit tests covering success and failure scenarios
- [ ] Documentation updated for public API changes

## Anti-Patterns to Avoid

### Logging and Debugging

- ❌ Don't use `console.log` for production logging (use telemetry)
- ❌ Don't log sensitive information (tokens, personal data)

### Error Handling

- ❌ Don't ignore Promise rejections or catch blocks
- ❌ Don't mix different error handling patterns in the same codebase
- ❌ Don't swallow errors without proper logging

### Type Safety

- ❌ Don't use `any` type unless absolutely necessary
- ❌ Don't use excessive type assertions without validation

### Configuration

- ❌ Don't hardcode values that should be configurable
- ❌ Don't break existing API contracts without versioning considerations

### Async Operations

- ❌ Don't use async Promise executors
- ❌ Don't mix async/await with .then() chains

### Code Organization

- ❌ Don't create overly large methods or classes
- ❌ Don't duplicate code that could be extracted into utilities

## Examples from Codebase

### Good Conditional Logic Pattern

```typescript
const isLivechatContextPresent = Boolean(liveChatContext && Object.keys(liveChatContext).length > 0);
const isReconnectIdPresent = Boolean(this.reconnectId && this.reconnectId.trim().length > 0);

if (!(error instanceof ChatSDKError &&
    error?.message === ChatSDKErrorName.MessagingClientConversationJoinFailure &&
    !this.chatSDKConfig.useCreateConversation?.disable &&
    !isLivechatContextPresent &&
    !isReconnectIdPresent)) {
    return;
}
```

### Good Exception Handling Pattern

```typescript
const exceptionDetails: ChatSDKExceptionDetails = {
    response: 'ConversationCleanupFailure',
    message: 'Failed to cleanup conversation after join failure',
    errorObject: String(cleanupError)
};

this.scenarioMarker.failScenario(TelemetryEvent.CleanupFailedStartchat, {
    ExceptionDetails: JSON.stringify(exceptionDetails)
});
```

## GitHub Copilot Integration

When using GitHub Copilot for development in this repository, ensure it follows these coding guidelines by:

### Using This Document as Context

- Reference this document (`docs/copilot/CODING_GUIDELINES.md`) when asking Copilot for code suggestions
- Copy relevant sections from this guide into your prompts for better code generation
- Use the provided patterns and examples as templates for new implementations

### Best Practices for Copilot Prompts

- Include specific context about the existing codebase patterns (e.g., "Follow the telemetry pattern with startScenario/completeScenario")
- Reference the method structure pattern when generating new public async methods
- Specify error handling requirements (e.g., "Include proper exception details structure")
- Mention platform compatibility needs when generating cross-platform code

### Example Copilot Prompt

```
Generate a new public async method following the Omnichannel Chat SDK patterns:
- Use the standard method structure pattern with telemetry
- Include proper error handling with ChatSDKExceptionDetails
- Follow TypeScript best practices with proper type safety
- Reference the coding guidelines in docs/copilot/CODING_GUIDELINES.md
```

## Conclusion

These guidelines ensure that code contributions to the Omnichannel Chat SDK maintain consistency, reliability, and quality. When in doubt, follow the patterns established in the existing codebase and prioritize clear, maintainable code over clever solutions.

**For GitHub Copilot users**: Always reference this document (`docs/copilot/CODING_GUIDELINES.md`) when generating code to ensure consistency with established patterns.

For questions or clarifications on these guidelines, refer to existing code examples in the repository or consult with the development team.
