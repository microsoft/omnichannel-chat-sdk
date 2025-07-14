# Call Coordination Feature Demonstration

This document demonstrates how the new call coordination feature works in the Omnichannel Chat SDK.

## Problem Solved

Before this feature, calling `startChat` and `endChat` in quick succession could cause race conditions:

```typescript
// ❌ This could cause issues before the fix
sdk.startChat();
sdk.endChat(); // Could fail if startChat hasn't finished

// Or vice versa:
sdk.endChat();
sdk.startChat(); // Could fail if endChat hasn't finished
```

## Solution Implemented

The new `CallCoordinator` ensures that:
1. Opposite calls wait for completion before proceeding
2. Same-type concurrent calls are prevented
3. Comprehensive telemetry tracks coordination events
4. Error handling works regardless of success/failure

## Usage Examples

### Basic Usage (No Change Required)
```typescript
const sdk = new OmnichannelChatSDK(omnichannelConfig);
await sdk.initialize();

// These now work safely regardless of timing
await sdk.startChat();
await sdk.endChat();
```

### Concurrent Calls (Now Coordinated)
```typescript
// ✅ This now works perfectly - endChat waits for startChat to complete
const startPromise = sdk.startChat();
const endPromise = sdk.endChat(); // Will wait for startChat to finish

await Promise.all([startPromise, endPromise]);
```

### Same-Type Protection
```typescript
// ✅ This prevents issues by throwing an error for the second call
const startPromise1 = sdk.startChat();
try {
    const startPromise2 = sdk.startChat(); // Throws: "StartChat is already in progress"
} catch (error) {
    console.log(error.message); // "StartChat is already in progress"
}
await startPromise1;
```

## Telemetry Events

New telemetry events are logged when coordination occurs:

### StartChatCoordinationHold
Logged when `startChat` waits for `endChat` to complete:
```json
{
    "Event": "StartChatCoordinationHold_Start",
    "RequestId": "req-123",
    "ChatId": "chat-456",
    "HoldReason": "Waiting for EndChat to complete",
    "OppositeCallType": "EndChat"
}
```

### EndChatCoordinationHold  
Logged when `endChat` waits for `startChat` to complete:
```json
{
    "Event": "EndChatCoordinationHold_Complete", 
    "RequestId": "req-789",
    "ChatId": "chat-456",
    "HoldReason": "StartChat completed, proceeding with EndChat",
    "OppositeCallType": "StartChat",
    "ElapsedTimeInMilliseconds": 1250
}
```

## Implementation Details

### CallCoordinator Class
- **Location**: `src/core/CallCoordinator.ts`
- **Purpose**: Manages coordination between startChat and endChat
- **Integration**: Minimal - only 2 lines added to each method

### Key Methods
1. `coordinateCall(callType, requestId, chatId)` - Checks coordination before proceeding
2. `completeCall(callType)` - Marks call as completed and releases waiting calls

### Error Handling
The coordinator is **error-agnostic** - it coordinates regardless of whether the calls succeed or fail:

```typescript
try {
    await sdk.startChat(); // May succeed or fail
} catch (error) {
    // Coordination still works for subsequent calls
    await sdk.endChat(); // This will work properly
}
```

## Backward Compatibility

✅ **100% backward compatible** - existing code continues to work without any changes
✅ **No breaking changes** - all existing APIs remain unchanged  
✅ **Performance impact**: Minimal - coordination only occurs when needed
✅ **Test coverage**: Comprehensive unit and integration tests ensure reliability

## Benefits

1. **Eliminates race conditions** between startChat and endChat
2. **Improves reliability** of chat session management
3. **Provides detailed telemetry** for debugging coordination issues
4. **Maintains simplicity** - no API changes required
5. **Follows existing patterns** - uses established telemetry and error handling