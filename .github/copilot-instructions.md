# GitHub Copilot Instructions for Omnichannel Chat SDK

## Pull Request Guidelines

When creating pull requests, follow these guidelines:

1. **Code Standards**: Ensure your code adheres to the project's coding standards defined in `docs/copilot/CODING_GUIDELINES.md`
2. **Commit Messages**: Write clear and concise commit messages following conventional commit format
3. **Testing**: Include comprehensive tests for any new functionality or bug fixes
4. **Documentation**: Update documentation if necessary, including JSDoc comments
5. **Test Verification**: Ensure all tests pass before submitting the pull request
6. **Collaboration**: When reacting to comments, ask for confirmation before proceeding with changes
7. **Clarification**: If you are not sure about something, ask for clarification in the pull request comments
8. **Incremental Changes**: Consider breaking significant changes into smaller pull requests for easier review
9. **Bug Fixes**: Include a description of the issue and how it was resolved
10. **Changelog**: Always include a one-line summary of the change at the top of CHANGELOG.md under [Unreleased] section:
    - **Fixed**: for bugs
    - **Changed**: for improvements or modified functionality  
    - **Added**: for new features or components
11. **Testing Strategy**: Suggest manual tests and possible edge cases
12. **Documentation**: Add diagrams and explanations to help reviewers understand entry points and follow changes

## Coding Standards

### Essential Requirements
- **MUST follow**: All patterns and guidelines specified in `docs/copilot/CODING_GUIDELINES.md`
- **MUST use**: Prompt templates from `docs/copilot/PROMPT_TEMPLATES.md` when working with Copilot
- **Code Quality**: Write clear, concise, and well-documented code
- **Comments**: Add meaningful comments to explain complex business logic
- **Testing**: Include comprehensive unit tests to verify functionality
- **Error Handling**: Handle errors gracefully with proper telemetry logging
- **Review Process**: Code must be reviewed by at least one other developer before merging

### Omnichannel Chat SDK Specific Requirements
- **Telemetry**: Always implement the startScenario() → completeScenario()/failScenario() pattern
- **Error Structure**: Use ChatSDKExceptionDetails structure for all error handling
- **Type Safety**: Follow strict TypeScript practices with proper type definitions
- **Platform Compatibility**: Consider cross-platform compatibility (Browser, Node.js, React Native)
- **Method Structure**: Follow the standard async method pattern defined in coding guidelines
- **Configuration**: Respect feature flags and disable patterns throughout the codebase

### Development Workflow
- **Dependencies**: Suggest library updates or new dependencies, but do not implement unless explicitly requested
- **Test Coverage**: Ensure unit tests pass and maintain coverage standards
- **Component Dependencies**: When changes affect multiple components, clearly highlight this with warnings and impact analysis
- **Breaking Changes**: Identify and document any breaking changes with migration guidance

### Prohibited Actions
- **No Silent Changes**: Do not make dependency updates without explicit approval
- **No Silent Failures**: Every error must be properly logged with telemetry
- **No Type Safety Violations**: Avoid using 'any' type without proper justification
- **No Inconsistent Patterns**: Follow established patterns consistently across the codebase

## Reference Documents
- **Coding Guidelines**: `docs/copilot/CODING_GUIDELINES.md` - Comprehensive coding standards and patterns
- **Prompt Templates**: `docs/copilot/PROMPT_TEMPLATES.md` - Ready-to-use templates for common development tasks
- **Development Guide**: `docs/DEVELOPMENT_GUIDE.md` - General development setup and guidelines
- **Troubleshooting**: `docs/TROUBLESHOOTING_GUIDE.md` - Common issues and solutions 


