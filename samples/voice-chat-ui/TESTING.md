# Testing Guide for ARTAgent Voice Chat Interface

This guide covers how to test the voice chat application locally and in production.

## Prerequisites

Before testing, ensure you have:
- Node.js 14+ installed
- Your `.env` file configured with:
  - Omnichannel configuration (ORG_URL, ORG_ID, WIDGET_ID)
  - Copilot Studio Bot ID (CPS_BOT_ID)
  - DirectLine Token Endpoint (optional but recommended)
- A microphone and speakers (for voice testing)
- A modern web browser (Chrome, Edge, Firefox, Safari)

## Quick Start

### 1. Install and Configure

```bash
# Navigate to the project
cd samples/voice-chat-ui

# Install dependencies
npm install

# Create and configure environment
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### 3. Allow Permissions

When prompted:
- ✅ Allow microphone access
- ✅ Allow notification permissions

## Testing Scenarios

### Scenario 1: Basic Text Chat

**Objective**: Verify text messaging works

**Steps**:
1. App loads with "Hello! I'm ARTAgent..." message
2. Type in the text input field: "Hello, how can you help?"
3. Press Enter or click Send
4. Verify:
   - ✅ Message appears on the right (user bubble)
   - ✅ Message timestamp is correct
   - ✅ Bot responds with a message
   - ✅ Bot message appears on the left (bot bubble)

**Expected Result**: Text messages send and receive successfully

---

### Scenario 2: Voice Input

**Objective**: Verify voice recording and transcription

**Steps**:
1. Click the microphone button (purple voice button)
2. Verify:
   - ✅ Button turns red
   - ✅ Recording indicator shows "Recording..."
   - ✅ Pulse animation appears
3. Speak clearly: "What are your business hours?"
4. Click the stop button (⏹)
5. Wait for transcription (2-5 seconds)
6. Verify:
   - ✅ Transcript preview appears
   - ✅ Message is auto-sent
   - ✅ Your spoken message appears in chat
   - ✅ Bot responds

**Expected Result**: Voice is recorded, transcribed, and sent successfully

**Troubleshooting**:
- **Microphone not working**: Check browser permissions → Settings → Microphone
- **No transcription**: Ensure you're using Chrome/Edge (requires Web Speech API)
- **Transcription incorrect**: Speak more clearly at normal pace

---

### Scenario 3: Session Information Display

**Objective**: Verify session tracking

**Steps**:
1. Look at the header
2. Verify:
   - ✅ "Active Session" shows a session ID (first 24 characters visible)
   - ✅ "Bot Mode" indicator shows (yellow dot)
   - ✅ Status text displays "Bot Mode"

**Expected Result**: Session information displays correctly

---

### Scenario 4: Message Display Features

**Objective**: Verify message UI elements

**Steps**:
1. Send a text message
2. Send a voice message
3. Verify:
   - ✅ Text message has ⌨️ badge
   - ✅ Voice message has 🎤 badge
   - ✅ Timestamps are accurate
   - ✅ Messages are properly aligned (user right, bot left)
   - ✅ Messages are readable and styled correctly

**Expected Result**: All message types display with correct badges and styling

---

### Scenario 5: Loading and Error States

**Objective**: Verify app handles loading and errors gracefully

**Steps**:
1. **Loading State**:
   - Clear browser cache and hard refresh (Ctrl+Shift+R)
   - Watch for loading spinner
   - Verify "Initializing chat service..." message

2. **Error Handling**:
   - Open DevTools (F12) → Console
   - Temporarily modify `.env` with wrong credentials
   - Restart dev server
   - Verify error message displays: "Failed to initialize chat service"

**Expected Result**: Appropriate loading and error states display

---

### Scenario 6: Responsive Design

**Objective**: Verify app works on different screen sizes

**Steps**:
1. Open DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M)
2. Test on different device sizes:
   - Mobile (375px): iPhone SE
   - Tablet (768px): iPad
   - Desktop (1920px): Full screen

3. Verify:
   - ✅ Chat window stays centered and readable
   - ✅ Text input is accessible
   - ✅ Buttons are tap-friendly (48px minimum)
   - ✅ Header adjusts properly
   - ✅ No horizontal scrolling

**Expected Result**: App is fully responsive on all screen sizes

---

### Scenario 7: Browser Compatibility

**Objective**: Test across different browsers

**Browsers to Test**:
- ✅ Chrome 88+
- ✅ Firefox 90+
- ✅ Safari 14+
- ✅ Edge 88+

**Steps**:
1. Open app in each browser
2. Test:
   - Text messaging
   - Voice recording
   - Message display
   - Styling/animations

**Known Issues**:
- Voice transcription requires Chrome/Edge (Web Speech API)
- Firefox may have different animation performance

---

### Scenario 8: DirectLine Integration (if configured)

**Objective**: Verify DirectLine token endpoint works

**Steps**:
1. Ensure `.env` has `REACT_APP_DIRECTLINE_TOKEN_URL`
2. Open DevTools → Network tab
3. Send a message
4. Look for network requests to:
   - `powervirtualagents/botsbyschema/.../directline/token`
   - `directline.botframework.com`
5. Verify:
   - ✅ Token request returns 200 status
   - ✅ Response includes `token` field
   - ✅ Message sent via DirectLine

**Expected Result**: DirectLine integration works without errors

**Debugging DirectLine**:
```javascript
// In browser console:
const chatManager = window.chatManager;
const dlService = chatManager.getDirectLineService();
const token = await dlService.getToken();
console.log('DirectLine Token:', token);
console.log('Conversation ID:', chatManager.getDirectLineConversationId());
```

---

### Scenario 9: Conversation Controls

**Objective**: Verify control buttons work

**Steps**:
1. **Refresh Button** (↻):
   - Click refresh button
   - Verify it's clickable (doesn't do anything yet, placeholder)

2. **Microphone Button** (🎤):
   - Click to start recording
   - Speak and click to stop
   - Verify transcription

3. **Send Button** (⬆):
   - Type text and click
   - Verify message sends

4. **Call Button** (☎):
   - Click call button
   - Verify:
     - System message "Initiating voice call with agent..."
     - Button remains clickable
     - No errors in console

**Expected Result**: All buttons are functional and responsive

---

### Scenario 10: Edge Cases

**Objective**: Test app under stress conditions

**Tests**:
1. **Long Messages**:
   - Send a very long message (500+ characters)
   - Verify it wraps correctly

2. **Rapid Clicking**:
   - Click send button 10 times rapidly
   - Verify no crashes

3. **Rapid Voice Recording**:
   - Start/stop recording quickly 5 times
   - Verify no errors

4. **Network Issues**:
   - Open DevTools → Network tab
   - Set throttling to "Slow 3G"
   - Send messages
   - Verify graceful loading/error handling

5. **Special Characters**:
   - Send: "Hello! @#$%^&*()"
   - Send: "Chinese: 你好"
   - Send: "Emoji: 😊🎉🚀"

**Expected Result**: App handles edge cases gracefully

---

## Console Testing

Open browser DevTools (F12) → Console tab:

### Test Direct Service Methods

```javascript
// Get chat manager instance (expose it first for testing)
const chatManager = window.chatManager;

// Test Omnichannel
await chatManager.sendMessage('Test message');
console.log('Message sent');

// Test DirectLine (if configured)
const dlService = chatManager.getDirectLineService();
if (dlService) {
  const token = await dlService.getToken();
  console.log('DirectLine token:', token);
  
  const convId = chatManager.getDirectLineConversationId();
  const messages = await dlService.getMessages(convId);
  console.log('Messages:', messages);
}
```

### Monitor Network Activity

```javascript
// In DevTools Network tab, filter by:
// - XHR/Fetch requests
// - Search: "directline" or your org URL
// - Check response status (200 = success)
```

---

## Performance Testing

### Check App Performance

1. Open DevTools → Lighthouse tab
2. Click "Analyze page load"
3. Review metrics:
   - First Contentful Paint (FCP): < 2s
   - Largest Contentful Paint (LCP): < 3s
   - Cumulative Layout Shift (CLS): < 0.1

### Memory Leaks

```javascript
// In DevTools → Memory tab:
1. Take heap snapshot
2. Send 10 messages
3. Take another snapshot
4. Compare: memory should not double
```

---

## Accessibility Testing

### Keyboard Navigation

**Steps**:
1. Disable mouse - use only Tab key
2. Verify:
   - ✅ Can tab through all buttons
   - ✅ Voice button focus is visible
   - ✅ Send button is accessible
   - ✅ Text input field is focusable
   - ✅ Can submit with Enter key

### Screen Reader

**Steps** (Windows):
1. Enable Narrator (Win + Ctrl + Enter)
2. Or use NVDA (free screen reader)
3. Verify:
   - ✅ Button labels are announced
   - ✅ Messages are read aloud
   - ✅ Status updates are announced

---

## Debugging Guide

### Enable Console Logging

Most debugging info is logged to console:

```
✓ Omnichannel Chat SDK initialized successfully
✓ DirectLine service initialized
✓ DirectLine conversation initialized: conv-id-123
✓ Voice recording started
✓ Voice recording stopped
✓ Message sent via DirectLine
```

### Check Network Requests

1. Open DevTools → Network tab
2. Send a message
3. Look for:
   - **Omnichannel**: Requests to your org URL
   - **DirectLine**: Requests to `directline.botframework.com`
   - Check response headers and body

### Inspect Elements

```javascript
// In Console:
// Get chat messages
document.querySelectorAll('.message-text');

// Get input field
document.querySelector('.text-input');

// Get active session ID
document.querySelector('.session-value');
```

---

## Test Checklist

### Before Deployment

- [ ] Text messaging works end-to-end
- [ ] Voice recording and transcription work
- [ ] Messages display correctly with badges
- [ ] Session information displays
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] No console errors
- [ ] DirectLine token fetches successfully
- [ ] Messages send via both Omnichannel and DirectLine
- [ ] Accessibility keyboard navigation works
- [ ] Error states display gracefully
- [ ] Loading states display during initialization
- [ ] Buttons are all functional
- [ ] Timestamps are accurate
- [ ] Auto-scroll to latest message works

### Performance Checklist

- [ ] Initial load time < 3 seconds
- [ ] Message send time < 1 second
- [ ] Voice transcription < 5 seconds
- [ ] No memory leaks after 20 messages
- [ ] No console warnings
- [ ] Smooth animations (60fps)

---

## Common Issues & Solutions

### Issue: "Microphone permission denied"
**Solution**: 
- Check browser permissions
- Refresh page
- Try different browser
- Check: `chrome://settings/content/microphone`

### Issue: "No bot response"
**Solution**:
- Verify bot ID in `.env`
- Check bot is published in Copilot Studio
- Check Omnichannel workstream configuration
- Open DevTools → look for 400/500 errors

### Issue: "DirectLine token error"
**Solution**:
- Verify token endpoint URL is correct
- Check endpoint is accessible (test in browser address bar)
- Verify API version matches: `2022-03-01-preview`

### Issue: "App won't load"
**Solution**:
- Hard refresh: Ctrl+Shift+R
- Clear cache: DevTools → Application → Clear storage
- Check `.env` configuration
- Check console for errors

### Issue: "Slow message sending"
**Solution**:
- Check network throttling (DevTools → Network)
- Test with Slow 3G to simulate
- Check network requests for bottlenecks

---

## Integration Testing

### Test with Real Bot

1. Configure with your actual bot credentials
2. Send sample messages that trigger bot flows
3. Test escalation to agent (if configured)
4. Monitor logs in Omnichannel Administration

### Test with Mock Bot

For development without real bot:
```javascript
// Mock bot responses in console
chatManager.onNewMessage((msg) => {
  if (msg.sender !== 'customer') {
    console.log('Bot said:', msg.content);
  }
});
```

---

## Continuous Testing

### Automated Tests (Optional)

```bash
# Run unit tests (if configured)
npm test

# Run integration tests
npm run test:integration

# Run accessibility tests
npm run test:a11y
```

---

## Reporting Issues

When reporting problems, include:

1. **Environment**:
   - Browser and version
   - OS (Windows/Mac/Linux)
   - Screen size

2. **Configuration** (redacted):
   - Which services are enabled (Omnichannel/DirectLine)
   - API versions being used

3. **Steps to Reproduce**:
   - Exact steps that cause the issue
   - Expected vs actual behavior

4. **Evidence**:
   - Console errors/warnings
   - Network requests (screenshots)
   - Screenshots of UI
   - Browser DevTools logs

---

## Support

- Check [Omnichannel Documentation](../README.md)
- Review [DirectLine Guide](./DIRECTLINE_INTEGRATION.md)
- Check [Copilot Studio Setup](./COPILOT_STUDIO_SETUP.md)
- Open issue on GitHub with test results
