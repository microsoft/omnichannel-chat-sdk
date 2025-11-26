# DirectLine Integration Guide

This guide explains how to use the DirectLine integration with your Copilot Studio bot.

## What is DirectLine?

DirectLine is the Bot Framework protocol that allows direct, secure communication with your bot. It provides:
- Lower latency than Omnichannel
- Direct control over message routing
- Advanced analytics and logging
- Token-based authentication
- Support for rich media and attachments

## Setup

### 1. Get Your DirectLine Token Endpoint

Your Copilot Studio bot has a built-in DirectLine endpoint:

```
https://c8ab89428f6be002b5247b562aa5f2.19.environment.api.powerplatform.com/powervirtualagents/botsbyschema/cra6f_frontierFirmRoadShow/directline/token?api-version=2022-03-01-preview
```

This endpoint returns a token that authenticates your application to communicate with the bot via DirectLine.

### 2. Add to `.env` file

```dotenv
# DirectLine Token Endpoint (from your Copilot Studio bot)
REACT_APP_DIRECTLINE_TOKEN_URL=https://c8ab89428f6be002b5247b562aa5f2.19.environment.api.powerplatform.com/powervirtualagents/botsbyschema/cra6f_frontierFirmRoadShow/directline/token?api-version=2022-03-01-preview

# Optional: Custom user ID (defaults to timestamp-based ID)
# REACT_APP_DIRECTLINE_USER_ID=my-custom-user-id
```

### 3. Usage

The DirectLine integration is automatically initialized when the app starts:

```javascript
// In your component
import OmnichannelChatManager from '../services/OmnichannelChatManager';

const chatManager = new OmnichannelChatManager(omnichannelConfig);
await chatManager.initialize(); // DirectLine initializes here

// Send message via both Omnichannel and DirectLine
await chatManager.sendMessage('Hello bot!');

// Or send only via DirectLine
await chatManager.sendMessageViaDirectLine('Hello via DirectLine!');

// Get DirectLine conversation ID
const conversationId = chatManager.getDirectLineConversationId();

// Get DirectLine service for advanced operations
const directLineService = chatManager.getDirectLineService();
```

## Architecture

### DirectLineService Class

The `DirectLineService` class handles all DirectLine communication:

```javascript
class DirectLineService {
  // Get or refresh authentication token
  async getToken()

  // Create new conversation
  async createConversation(userId)

  // Send message
  async sendMessage(conversationId, userId, text)

  // Retrieve messages
  async getMessages(conversationId, watermark)

  // Reconnect to existing conversation
  async reconnect(conversationId)

  // End conversation
  async endConversation(conversationId)

  // Check token expiration
  isTokenExpired()
}
```

### Token Management

Tokens are automatically:
- Fetched from your Copilot Studio bot endpoint
- Cached to reduce API calls
- Refreshed when expired (30-minute default lifespan)
- Validated before each request

### Message Flow

```
User Input
    ↓
VoiceChatInterface Component
    ↓
OmnichannelChatManager.sendMessage()
    ↓
  ┌─────────────────┬──────────────────┐
  ↓                 ↓
Omnichannel       DirectLine
Chat SDK          Service
  ↓                 ↓
  └─────────────────┴──────────────────┘
           ↓
    Copilot Studio Bot
```

## Advanced Usage

### Using DirectLine Directly

```javascript
// Get the DirectLine service
const directLineService = chatManager.getDirectLineService();

// Get token
const token = await directLineService.getToken();

// Create custom conversation
const conversation = await directLineService.createConversation('my-user-id');

// Send message
await directLineService.sendMessage(
  conversation.conversationId,
  'my-user-id',
  'Your message'
);

// Retrieve messages with pagination
const messages = await directLineService.getMessages(
  conversation.conversationId,
  watermark  // optional pagination marker
);

// Reconnect to existing conversation
await directLineService.reconnect(conversationId);

// End conversation
await directLineService.endConversation(conversationId);
```

### Hybrid Mode (Omnichannel + DirectLine)

By default, messages are sent via both Omnichannel and DirectLine:

```javascript
// This sends to both services
await chatManager.sendMessage('Hello!');

// Console output:
// ✓ Message sent via Omnichannel Chat SDK
// ✓ Message sent via DirectLine
```

### DirectLine Only Mode

```javascript
// Send only via DirectLine
await chatManager.sendMessageViaDirectLine('Hello DirectLine!');
```

## Error Handling

### Token Expiration

The service automatically handles token refresh:

```javascript
// If a request gets a 401/403 error, the token is automatically refreshed
try {
  await directLineService.sendMessage(conversationId, userId, 'message');
  // Retry automatically handles refresh
} catch (error) {
  console.error('Failed after retry:', error);
}
```

### Connection Issues

Monitor connection health:

```javascript
// Check if token is valid
if (directLineService.isTokenExpired()) {
  console.log('Token expired, refresh needed');
}

// Get fresh token
const newToken = await directLineService.refreshToken();
```

## Conversation Lifecycle

```javascript
// 1. Initialize (automatic)
await chatManager.initialize();
const conversationId = chatManager.getDirectLineConversationId();
// Conversation created and ready

// 2. Send/Receive messages
await chatManager.sendMessage('Hello');
const messages = await chatManager.getDirectLineMessages();

// 3. Reconnect if needed
await directLineService.reconnect(conversationId);

// 4. End conversation
await directLineService.endConversation(conversationId);
```

## Performance Tips

1. **Token Caching**: Tokens are cached for 30 minutes - reuse them
2. **Message Batching**: Get messages with watermark for pagination
3. **Connection Pooling**: Reuse DirectLineService instances
4. **Error Retry**: Automatic retry on token expiration
5. **Async Operations**: Use async/await to prevent blocking

## Debugging

### Enable Detailed Logging

```javascript
// Add to your component
const directLineService = chatManager.getDirectLineService();

// Check token status
console.log('Token valid:', !directLineService.isTokenExpired());
console.log('Conversation ID:', chatManager.getDirectLineConversationId());
```

### Monitor Network Requests

Open browser DevTools (F12) → Network tab:
1. Look for requests to `directline.botframework.com`
2. Check response headers and status codes
3. Verify token is being sent in Authorization header

### Common Issues

**Problem**: "No token returned from DirectLine endpoint"
- **Solution**: Verify the token endpoint URL is correct and accessible

**Problem**: "401 Unauthorized"
- **Solution**: Token may be expired, refresh with `getToken()`

**Problem**: "Conversation creation failed"
- **Solution**: Check that DirectLine service initialized successfully

**Problem**: "Failed to send message after token refresh"
- **Solution**: Verify token endpoint is still accessible and valid

## Copilot Studio Bot Endpoint Format

The DirectLine token endpoint follows this pattern:

```
https://{environment-id}.{regional-id}.environment.api.powerplatform.com
  /powervirtualagents/botsbyschema/{bot-id}
  /directline/token
  ?api-version=2022-03-01-preview
```

Components:
- `{environment-id}`: Your environment identifier
- `{regional-id}`: The regional deployment (19 = US, etc.)
- `{bot-id}`: Your Copilot Studio bot ID
- `api-version`: DirectLine API version

## Integration Examples

### Example 1: Simple Chat

```javascript
// Send message
await chatManager.sendMessage('I need help with my order');

// Receive response via onNewMessage callback
chatManager.onNewMessage((message) => {
  console.log('Bot says:', message.content);
});
```

### Example 2: Check Conversation Status

```javascript
// Get DirectLine service
const dlService = chatManager.getDirectLineService();
const conversationId = chatManager.getDirectLineConversationId();

// Check if conversation is still valid
try {
  const messages = await dlService.getMessages(conversationId);
  console.log('Conversation active, messages count:', messages.activities.length);
} catch (error) {
  console.log('Conversation may have ended');
}
```

### Example 3: Custom User ID

```dotenv
# In .env
REACT_APP_DIRECTLINE_USER_ID=john.doe@company.com
```

```javascript
// User ID is automatically used for all DirectLine operations
await chatManager.initialize();
// Uses 'john.doe@company.com' as the user ID
```

## Testing

```bash
# Start the app
npm start

# Test in browser console
const chatManager = window.chatManager; // Expose globally for testing
const token = await chatManager.getDirectLineService().getToken();
console.log('Token:', token);

const messages = await chatManager.getDirectLineMessages();
console.log('Messages:', messages);
```

## Support

- Check [DirectLine Documentation](https://learn.microsoft.com/en-us/azure/bot-service/bot-api-direct-line)
- Review [Bot Framework Documentation](https://learn.microsoft.com/en-us/azure/bot-service/)
- See [Copilot Studio DirectLine Docs](https://learn.microsoft.com/en-us/power-virtual-agents/advanced-use-bot-framework)
