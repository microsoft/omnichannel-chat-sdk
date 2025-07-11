# GitHub Copilot Prompt Templates for Omnichannel Chat SDK

This document provides ready-to-use prompt templates for developers when creating issues, tasks, or working with GitHub Copilot in the Omnichannel Chat SDK repository. These templates ensure consistency and help generate high-quality code that follows the established patterns.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Feature Development Templates](#feature-development-templates)
- [Bug Fix Templates](#bug-fix-templates)
- [Refactoring Templates](#refactoring-templates)
- [Testing Templates](#testing-templates)
- [Documentation Templates](#documentation-templates)
- [Code Review Templates](#code-review-templates)
- [Integration Templates](#integration-templates)

## Quick Reference

### Essential Context for All Prompts

**REQUIRED**: Always include this context when working with GitHub Copilot:

```
MANDATORY: Follow the coding guidelines in docs/copilot/CODING_GUIDELINES.md

Context: Working on Omnichannel Chat SDK
- MUST follow all patterns specified in docs/copilot/CODING_GUIDELINES.md
- Use telemetry pattern: startScenario() → completeScenario()/failScenario()
- Include proper error handling with ChatSDKExceptionDetails structure
- Follow TypeScript best practices with strict type safety
- Maintain consistent formatting (4 spaces indentation)
- Reference the coding guidelines document for all implementation details
```

## Feature Development Templates

### 1. New Public API Method

```
REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md for all implementation patterns

Create a new public async method for [FEATURE_NAME] in OmnichannelChatSDK class:

Requirements:
- Method name: [METHOD_NAME]
- Parameters: [PARAMETER_TYPES]
- Return type: Promise<[RETURN_TYPE]>
- MUST follow the standard method structure pattern from docs/copilot/CODING_GUIDELINES.md
- Include telemetry with TelemetryEvent.[EVENT_NAME]
- Add initialization check with exceptionThrowers.throwUninitializedChatSDK
- Include proper error handling with try-catch and failScenario
- Add JSDoc documentation with parameter descriptions
- Handle platform compatibility if needed
- Include input validation

MANDATORY REFERENCE: docs/copilot/CODING_GUIDELINES.md method structure pattern
Context: Omnichannel Chat SDK following established patterns
```

### 2. New Configuration Feature

```
REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md for all implementation patterns

Implement a new configuration feature for [FEATURE_NAME]:

Requirements:
- Add to ChatSDKConfig interface: [CONFIG_PROPERTY]
- Create feature flag handling pattern
- Add configuration validation
- Include backward compatibility
- Follow disable flag pattern (disable: true means feature is disabled)
- Add default values
- Include TypeScript strict typing

MANDATORY REFERENCE: docs/copilot/CODING_GUIDELINES.md configuration section
Context: Follow existing configuration patterns in the codebase
```

### 3. New External Service Integration

```
REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md for all implementation patterns

Create integration for [SERVICE_NAME]:

Requirements:
- Create service client class with proper error handling
- Implement telemetry for all service operations
- Add platform compatibility checks
- Include authentication handling if needed
- Follow async/await patterns consistently
- Add proper TypeScript interfaces for service responses
- Include connection management and cleanup
- Add timeout and retry logic

MANDATORY REFERENCE: docs/copilot/CODING_GUIDELINES.md
Context: Omnichannel Chat SDK external service integration
Additional Reference: Existing patterns in src/external/ directory
```

## Bug Fix Templates

### 1. Error Handling Bug Fix

```
REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md for all implementation patterns

Fix error handling issue in [METHOD/COMPONENT]:

Problem: [DESCRIBE_ISSUE]

Requirements:
- Identify and fix the error handling pattern
- Ensure proper telemetry logging (failScenario with ExceptionDetails)
- Add missing try-catch blocks if needed
- Use ChatSDKExceptionDetails structure
- Include proper error propagation
- Add defensive programming checks
- Maintain backward compatibility

MANDATORY REFERENCE: docs/copilot/CODING_GUIDELINES.md error handling section
Ensure: No silent failures, proper telemetry, consistent error structure
```

### 2. Telemetry Bug Fix

```
REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md for all implementation patterns

Fix telemetry issue in [COMPONENT]:

Problem: [DESCRIBE_TELEMETRY_ISSUE]

Requirements:
- Ensure startScenario() has matching completeScenario() or failScenario()
- Include proper context (RequestId, ChatId) in telemetry calls
- Use correct TelemetryEvent enum values
- Fix telemetry event naming consistency
- Add missing telemetry for error scenarios
- Ensure ExceptionDetails structure is correct

MANDATORY REFERENCE: docs/copilot/CODING_GUIDELINES.md telemetry patterns
Additional Reference: Existing telemetry implementations in the codebase
```

### 3. Type Safety Bug Fix

```
REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md for all implementation patterns

Fix TypeScript type safety issues in [COMPONENT]:

Problem: [DESCRIBE_TYPE_ISSUE]

Requirements:
- Remove any usage of 'any' type
- Add proper type guards and validation
- Use optional chaining (?.) and nullish coalescing (??) appropriately
- Add proper interface definitions
- Include input validation
- Fix type casting issues
- Ensure strict TypeScript compliance

MANDATORY REFERENCE: docs/copilot/CODING_GUIDELINES.md type safety section
Ensure: Strict typing, proper validation, no runtime type errors
```

## Refactoring Templates

### 1. Extract Utility Function

```
REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md for all implementation patterns

Extract utility function from [SOURCE_METHOD]:

Requirements:
- Create reusable utility function for [FUNCTIONALITY]
- Move to appropriate utils/ directory
- Add proper TypeScript typing
- Include JSDoc documentation
- Add unit tests for the utility
- Update all usages to use the new utility
- Follow naming conventions (camelCase)
- Handle edge cases and error scenarios

MANDATORY REFERENCE: docs/copilot/CODING_GUIDELINES.md code organization section
Additional Reference: Follow utility patterns in src/utils/
```

### 2. Simplify Complex Conditional Logic

```
REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md for all implementation patterns

Refactor complex conditional logic in [METHOD_NAME]:

Current issue: [DESCRIBE_COMPLEXITY]

Requirements:
- Break down complex conditions into descriptive variables
- Add clear comments explaining business rules
- Use early returns to reduce nesting
- Follow the conditional logic patterns from docs/copilot/CODING_GUIDELINES.md
- Maintain the same functionality while improving readability
- Add unit tests to verify behavior remains unchanged

MANDATORY REFERENCE: docs/copilot/CODING_GUIDELINES.md conditional logic section
Goal: Improve readability while maintaining functionality
```

## Testing Templates

### 1. Unit Test for New Feature

```
REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md for all implementation patterns

Create comprehensive unit tests for [FEATURE/METHOD]:

Requirements:
- Follow AAA pattern (Arrange, Act, Assert)
- Test both success and failure scenarios
- Mock external dependencies appropriately
- Use descriptive test names
- Include edge cases and boundary conditions
- Follow existing test patterns in __tests__/ directory
- Mock telemetry and verify telemetry calls
- Test error handling and exception scenarios
- Use jest.fn() for mocks with proper cleanup

MANDATORY REFERENCE: docs/copilot/CODING_GUIDELINES.md testing section
Additional Reference: Existing test files in __tests__/ directory
```

### 2. Integration Test

```
REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md for all implementation patterns

Create integration tests for [COMPONENT/FEATURE]:

Requirements:
- Test real integration scenarios
- Use appropriate test environment setup
- Include positive and negative test cases
- Test platform compatibility scenarios
- Verify telemetry in integration scenarios
- Include timeout and retry scenarios
- Test configuration variations
- Follow existing integration test patterns

MANDATORY REFERENCE: docs/copilot/CODING_GUIDELINES.md testing section
Additional Reference: Existing integration tests and patterns
```

## Documentation Templates

### 1. API Documentation

```
Create comprehensive API documentation for [API/METHOD]:

Requirements:
- Include clear method description and purpose
- Document all parameters with types and descriptions
- Include return type and description
- Add usage examples with code snippets
- Document error scenarios and exceptions
- Include platform compatibility notes
- Add JSDoc comments in the code
- Follow existing documentation patterns

Context: API documentation for Omnichannel Chat SDK
Style: Follow existing documentation in docs/ directory
```

### 2. Troubleshooting Guide

```
Create troubleshooting guide for [ISSUE/FEATURE]:

Requirements:
- Identify common issues and symptoms
- Provide step-by-step resolution steps
- Include diagnostic information to collect
- Add code examples for solutions
- Include telemetry analysis tips
- Document known limitations
- Add links to related documentation

Context: Troubleshooting guide for Omnichannel Chat SDK
Reference: Existing docs/TROUBLESHOOTING_GUIDE.md
```

## Code Review Templates

### 1. Code Review Checklist

```
Review the following code changes for [FEATURE/FIX]:

Checklist items to verify:
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

Reference: Code review checklist in docs/copilot/CODING_GUIDELINES.md
```

### 2. Performance Review

```
Review performance implications of [FEATURE/CHANGE]:

Areas to check:
- Memory usage and potential leaks
- API call efficiency and batching
- Async operation patterns
- Resource cleanup
- Caching implementation
- Network request optimization
- Large object handling

Context: Performance considerations for Omnichannel Chat SDK
Reference: docs/copilot/CODING_GUIDELINES.md performance section
```

## Integration Templates

### 1. CI/CD Pipeline Integration

```
Update CI/CD pipeline for [CHANGE/FEATURE]:

Requirements:
- Add necessary build steps
- Include new test categories
- Update linting and type checking
- Add performance benchmarks if needed
- Include security scanning for new dependencies
- Update deployment configurations
- Add monitoring and alerting

Context: CI/CD for Omnichannel Chat SDK
Reference: Existing azure-pipelines.yml
```

### 2. External Library Integration

```
Integrate new external library [LIBRARY_NAME]:

Requirements:
- Add to package.json with appropriate version
- Create wrapper/adapter following existing patterns
- Add proper error handling and telemetry
- Include TypeScript type definitions
- Add platform compatibility checks
- Create unit tests for integration
- Update documentation
- Add security and licensing review

Context: External library integration for Omnichannel Chat SDK
Reference: Existing patterns in src/external/
```

## Issue Templates

### 1. Bug Report Template

```
**Bug Description**
Brief description of the bug

**Environment**
- SDK Version: 
- Platform: [Browser/Node.js/React Native]
- TypeScript Version:

**Steps to Reproduce**
1. 
2. 
3. 

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Code Context**
Reference to relevant files and methods

**Copilot Instructions**
REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md for all implementation patterns

Fix this issue following the coding guidelines:
- Include proper telemetry logging
- Add comprehensive error handling
- Maintain backward compatibility
- Include unit tests for the fix

MANDATORY REFERENCE: docs/copilot/CODING_GUIDELINES.md
```

### 2. Feature Request Template

```
**Feature Description**
Clear description of the requested feature

**Use Case**
Why this feature is needed

**Proposed Implementation**
High-level approach

**Acceptance Criteria**
- [ ] Functional requirement 1
- [ ] Functional requirement 2
- [ ] Performance requirements
- [ ] Compatibility requirements

**Copilot Instructions**
REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md for all implementation patterns

Implement this feature following the coding guidelines:
- Follow the standard method structure pattern
- Include comprehensive telemetry
- Add proper TypeScript typing
- Include platform compatibility checks
- Add comprehensive unit tests
- Update documentation

MANDATORY REFERENCE: docs/copilot/CODING_GUIDELINES.md
```

## Usage Instructions

1. **MANDATORY**: Always reference `docs/copilot/CODING_GUIDELINES.md` in every prompt
2. **Copy the appropriate template** for your task
3. **Fill in the specific details** for your use case
4. **Include "REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md"** at the start of every prompt
5. **Use the template in your GitHub Copilot prompt** or issue description
6. **Verify the output follows the coding guidelines** before submitting

## Contributing to Templates

When adding new templates:

- **MUST include**: "REQUIRED: Follow docs/copilot/CODING_GUIDELINES.md" at the start
- Follow the existing format and structure
- Include comprehensive requirements
- Reference the coding guidelines document explicitly
- Provide specific context for the SDK
- Include quality checkpoints
- Add examples where helpful

---

**IMPORTANT**: Every template in this document requires explicit reference to `docs/copilot/CODING_GUIDELINES.md`. This ensures consistent code quality and adherence to established patterns.

*Last updated: July 2025*  
*For questions about these templates, refer to the development team or the coding guidelines document.*
