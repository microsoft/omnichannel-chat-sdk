# Adding Your Copilot Studio Bot

This guide explains how to connect your Copilot Studio bot to the ARTAgent voice chat interface for both direct chat and DirectLine integration.

## Prerequisites

1. A Copilot Studio bot already created and published
2. Dynamics 365 Omnichannel configured with a chat widget
3. Your bot IDs and connection information

## Step 1: Get Your Copilot Studio Bot IDs

### From Copilot Studio Portal:

1. Go to [Copilot Studio](https://web.powerva.microsoft.com/)
2. Select your bot
3. Go to **Settings** → **Bot Details**
4. Copy your **Bot ID** (UUID format)

You'll need:
- **Bot ID**: The unique identifier for your bot
- **Environment ID**: Optional, for multi-environment setups (found in Settings → General)
- **Tenant ID**: Your Azure Tenant ID (found in Azure Portal)

### From Azure:

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "Bot Service" or "Azure Bot Service"
3. Find your bot service
4. Under **Settings**, you'll find:
   - **Microsoft App ID** (Application ID)
   - **Microsoft App Password** (Client Secret)

## Step 2: Configure Omnichannel

### In Dynamics 365 Omnichannel:

1. Go to **Omnichannel Administration** → **Workstreams**
2. Create or edit your chat workstream
3. Under **Bot Settings**:
   - Enable bot engagement
   - Select your Copilot Studio bot
   - Configure bot escalation rules
   - Set escalation thresholds

### Find Your Configuration Details:

1. Go to **Omnichannel Administration** → **Settings** → **Chat Widget**
2. Copy:
   - **Organization URL** (`REACT_APP_ORG_URL`)
   - **Organization ID** (`REACT_APP_ORG_ID`)
   - **Widget ID** (`REACT_APP_WIDGET_ID`)

Example:
```
Org URL: https://yourorg.crm.oc.crmlivetie.com
Org ID: 00000000-0000-0000-0000-000000000000
Widget ID: 11111111-1111-1111-1111-111111111111
```

## Step 3: Configure Environment Variables

### 1. Copy the example file:

```bash
cd samples/voice-chat-ui
cp .env.example .env
```

### 2. Edit `.env` with your configuration:

```dotenv
# Omnichannel Configuration (Required)
REACT_APP_ORG_URL=https://yourorg.crm.oc.crmlivetie.com
REACT_APP_ORG_ID=00000000-0000-0000-0000-000000000000
REACT_APP_WIDGET_ID=11111111-1111-1111-1111-111111111111

# Copilot Studio Bot (Optional but recommended)
REACT_APP_CPS_BOT_ID=22222222-2222-2222-2222-222222222222

# DirectLine Integration (Optional)
REACT_APP_DIRECTLINE_TOKEN_URL=https://yourorg.crm.oc.crmlivetie.com/api/v1/directline/tokens
REACT_APP_DIRECTLINE_BOT_ID=your-directline-bot-id

# Azure Speech Services (Optional - for advanced transcription)
REACT_APP_SPEECH_KEY=your-azure-speech-key
REACT_APP_SPEECH_REGION=your-azure-region
```

## Step 4: Update Application Code

### Using Bot ID in Chat SDK:

The `REACT_APP_CPS_BOT_ID` is already integrated in `OmnichannelChatManager.js`:

```javascript
const omnichannelConfig = {
  orgUrl: process.env.REACT_APP_ORG_URL,
  orgId: process.env.REACT_APP_ORG_ID,
  widgetId: process.env.REACT_APP_WIDGET_ID,
  cpsBotId: process.env.REACT_APP_CPS_BOT_ID  // Your bot ID
};
```

### For DirectLine (Optional):

If you want to use DirectLine protocol for more control, update `OmnichannelChatManager.js`:

```javascript
async createDirectLineAdapter() {
  try {
    // Get DirectLine token
    const tokenResponse = await fetch(process.env.REACT_APP_DIRECTLINE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_DIRECTLINE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get DirectLine token');
    }

    const { token } = await tokenResponse.json();

    // Create adapter
    const chatAdapter = await this.chatSDK.createChatAdapter();
    return {
      adapter: chatAdapter,
      token: token,
      botId: process.env.REACT_APP_DIRECTLINE_BOT_ID
    };
  } catch (error) {
    console.error('Failed to create DirectLine adapter:', error);
    throw error;
  }
}
```

## Step 5: Configure Bot Escalation

### In Omnichannel:

1. **Bot Routing**:
   - Set your Copilot Studio bot as the default engagement
   - Configure escalation conditions (e.g., no match, user request)

2. **Queue Configuration**:
   - Create a queue for human agents
   - Assign agents to the queue
   - Configure skills and routing rules

3. **Context Variables**:
   - Bot name
   - Skill requirements
   - Priority level

### In Your Application:

Monitor escalation events:

```javascript
chatManager.onNewMessage((message) => {
  if (message.type === 'PartyJoined' && message.sender !== 'customer') {
    // Agent has joined - escalation occurred
    console.log('Agent joined the conversation');
    setIsAgentConnected(true);
  }
});
```

## Step 6: Test Your Configuration

### 1. Start the development server:

```bash
npm install
npm start
```

### 2. Test bot interaction:

- Say or type: "Hello"
- Wait for bot response
- Verify bot is responding correctly

### 3. Test escalation:

- Say or type: "Talk to an agent"
- System should escalate to human agent queue
- Verify agent receives chat

### 4. Check console for errors:

- Open browser Developer Tools (F12)
- Go to Console tab
- Look for any errors or warnings

## Common Bot IDs and Configurations

### Copilot Studio Bot:

```javascript
{
  cpsBotId: "22222222-2222-2222-2222-222222222222",
  botName: "CustomerService Bot",
  enableEscalation: true
}
```

### DirectLine Bot:

```javascript
{
  directlineToken: "eyJ0eXAiOiJKV1QiLCJhbGc...",
  botId: "your-directline-bot-id",
  userId: "customer-id"
}
```

## Troubleshooting

### Bot Not Responding

**Problem**: Messages sent but no bot response

**Solutions**:
1. Verify `REACT_APP_CPS_BOT_ID` is correct
2. Check bot is published in Copilot Studio
3. Verify workstream is configured in Omnichannel
4. Check browser console for errors
5. Verify network requests in Network tab

### Escalation Not Working

**Problem**: User cannot reach agents

**Solutions**:
1. Verify agents are online and available
2. Check queue is configured correctly
3. Verify escalation rules in workstream
4. Check agent availability settings
5. Monitor OC Client logs

### DirectLine Issues

**Problem**: DirectLine adapter not connecting

**Solutions**:
1. Verify DirectLine token endpoint is correct
2. Check token expiration
3. Verify bot ID matches DirectLine configuration
4. Test token generation endpoint separately

## Advanced Configuration

### Multiple Bots

To support multiple Copilot Studio bots:

```javascript
const BOTS = {
  sales: {
    id: "bot-id-sales",
    name: "Sales Assistant"
  },
  support: {
    id: "bot-id-support", 
    name: "Support Assistant"
  }
};

// Select bot based on routing
const selectedBot = BOTS[userRoute];
```

### Bot Metadata

Pass custom context to your bot:

```javascript
await chatSDK.startChat({
  customContext: {
    'botType': { value: 'copilot', isDisplayable: true },
    'department': { value: 'support', isDisplayable: false },
    'priority': { value: 'high', isDisplayable: false }
  }
});
```

### Authentication

For authenticated bot interactions:

```javascript
const chatSDKConfig = {
  getAuthToken: async () => {
    const response = await fetch('/api/auth/token');
    return await response.text();
  }
};
```

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use environment-specific secrets** for production
3. **Rotate tokens regularly** (especially DirectLine)
4. **Use HTTPS only** in production
5. **Validate all input** before sending to bot
6. **Implement rate limiting** to prevent abuse
7. **Monitor bot interactions** for security issues

## Resources

- [Copilot Studio Documentation](https://learn.microsoft.com/en-us/power-virtual-agents/)
- [Omnichannel Chat SDK Docs](../README.md)
- [DirectLine API Reference](https://learn.microsoft.com/en-us/azure/bot-service/bot-api-direct-line)
- [Bot Framework Documentation](https://learn.microsoft.com/en-us/azure/bot-service/)

## Support

For issues:
1. Check the [Troubleshooting Guide](../docs/TROUBLESHOOTING_GUIDE.md)
2. Review console errors
3. Check network requests in browser DevTools
4. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - `.env` configuration (redacted)
   - Console logs
