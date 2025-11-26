# Testing in VS Code Embedded Browser

This guide explains how to test the ARTAgent voice chat app using VS Code's embedded Simple Browser.

## Benefits

- ✅ Test without leaving VS Code
- ✅ View code and app side-by-side
- ✅ Quick preview during development
- ✅ Built-in DevTools access
- ✅ No extra configuration needed

## Setup

### 1. Install Simple Browser Extension (if needed)

VS Code includes Simple Browser by default (v1.47+), but you can install it manually:

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Simple Browser"
4. Install `Simple Browser` by Microsoft

### 2. Start Development Server

Open a terminal in VS Code:

```bash
cd samples/voice-chat-ui
npm install
npm start
```

The app will start at `http://localhost:3000`

## Open App in Embedded Browser

### Method 1: Quick Open (Recommended)

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: `Simple Browser: Show`
3. Enter the URL: `http://localhost:3000`
4. Press Enter

The app opens in a side panel within VS Code

### Method 2: Open Command

1. Create a file named `.vscode/launch.json` in your workspace
2. Add this configuration:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Open ARTAgent in Browser",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/samples/voice-chat-ui"
    }
  ]
}
```

3. Press `F5` to launch

### Method 3: VSCode Task

1. Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Open App in Simple Browser",
      "command": "code",
      "args": ["--open-url", "http://localhost:3000"],
      "runOptions": {
        "runOn": "folderOpen"
      }
    }
  ]
}
```

2. Run via `Ctrl+Shift+B`

## Using the Embedded Browser

### Layout Tips

**Side-by-Side View**:
1. Open Simple Browser on right panel
2. Keep code editor on left
3. Edit code → auto-refresh updates in browser

**Full Screen View**:
- Click maximize button in Simple Browser panel
- Edit → View → Command Palette → Toggle to side-by-side

### Developer Tools

**Open DevTools in Embedded Browser**:
1. Right-click in the Simple Browser
2. Select "Inspect Element"
3. DevTools opens at bottom of browser panel

**Alternative**:
- Press `F12` within the embedded browser
- Or `Ctrl+Shift+I`

### Reloading

- Click reload button in Simple Browser (↻)
- Or press `Ctrl+Shift+R` (hard refresh)
- Or press `F5`

## Testing Workflow

### Step 1: Prepare Workspace

```powershell
# In VS Code Terminal
cd samples/voice-chat-ui
npm install
cp .env.example .env
# Edit .env with your config
npm start
```

### Step 2: Open in Embedded Browser

1. `Ctrl+Shift+P` → "Simple Browser: Show"
2. Enter: `http://localhost:3000`
3. Press Enter

### Step 3: Test Features

**Text Chat**:
- Type in message field → Send
- Watch message appear in chat

**Voice Recording**:
- Click 🎤 button
- Speak clearly
- Click stop button
- See transcript and message

**Monitor Console**:
1. Right-click in browser
2. Select "Inspect"
3. Go to Console tab
4. Watch logs as you interact

### Step 4: Edit and Test

While browser is open:
1. Edit React component (e.g., `VoiceChatInterface.jsx`)
2. Save file (`Ctrl+S`)
3. App auto-refreshes in embedded browser
4. See changes immediately

## Troubleshooting

### "Cannot connect to localhost:3000"

**Problem**: Dev server isn't running

**Solution**:
```bash
# Check if npm start is running in terminal
# If not:
npm start

# Wait for "Compiled successfully" message
# Then retry in Simple Browser
```

### Microphone Not Working

**Problem**: Permissions issue in embedded browser

**Solutions**:
1. Try regular browser first to confirm microphone works
2. Check VS Code permissions:
   - Windows: Settings → Apps → Microphone → Enable for VS Code
   - Mac: System Preferences → Security & Privacy → Microphone
3. Try a full browser instead for voice testing

### App Doesn't Refresh

**Problem**: Changes not appearing after edits

**Solutions**:
1. Click refresh button in Simple Browser
2. Hard refresh: `Ctrl+Shift+R`
3. Check if `npm start` is still running
4. Clear browser cache: Inspect → Application → Storage → Clear All

### Cannot See DevTools

**Problem**: DevTools not opening

**Solutions**:
1. Right-click in Simple Browser → Inspect Element
2. Or press `F12`
3. If still nothing, expand the panel (Simple Browser panel divider at bottom)

### DirectLine Token Error

**Problem**: Token endpoint fails in embedded browser

**Solution**:
1. Check `.env` configuration
2. Verify CORS settings on endpoint
3. Open DevTools → Network tab
4. Look for token request → check response
5. Test endpoint directly in regular browser first

## Advanced Setup

### Create Custom VSCode Command

Add to `.vscode/settings.json`:

```json
{
  "workbench.commandPalette.experimental.suggestCommands": true,
  "python.linting.enabled": true
}
```

Then in `launch.json`, create quick launch:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ARTAgent Preview",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "preLaunchTask": "npm: start",
      "postDebugTask": "npm: stop"
    }
  ]
}
```

### Keyboard Shortcuts

Add to `.vscode/keybindings.json`:

```json
[
  {
    "key": "ctrl+alt+b",
    "command": "simpleBrowser.show",
    "args": ["http://localhost:3000"]
  },
  {
    "key": "ctrl+alt+r",
    "command": "workbench.action.webview.reloadWebviewPanels"
  }
]
```

Then:
- `Ctrl+Alt+B` → Open in Simple Browser
- `Ctrl+Alt+R` → Reload browser

## Testing Checklist in Embedded Browser

### Initial Load
- [ ] App loads without errors
- [ ] Welcome message appears
- [ ] Session ID visible in header
- [ ] Console shows initialization logs
- [ ] No red errors in console

### Text Chat
- [ ] Type message in input field
- [ ] Click Send button
- [ ] Message appears with ⌨️ badge
- [ ] Message timestamp correct
- [ ] Input field clears after send

### Voice Testing (if microphone available)
- [ ] Click 🎤 button
- [ ] Recording indicator appears
- [ ] Button turns red
- [ ] Speak a message
- [ ] Click stop button
- [ ] Transcript preview appears
- [ ] Message sent automatically
- [ ] Message has 🎤 badge

### UI Elements
- [ ] Header displays correctly
- [ ] Session info visible
- [ ] All buttons are clickable
- [ ] Messages scroll to bottom
- [ ] Styling matches design

### Console Monitoring
- [ ] No errors or warnings
- [ ] Initialization logs appear
- [ ] Message logs show when sending
- [ ] DirectLine logs show (if configured)

## Live Editing

### Edit While Testing

1. **Component Change**:
   - Edit `src/components/VoiceChatInterface.jsx`
   - Change button text or color
   - Save: `Ctrl+S`
   - Browser auto-refreshes
   - See changes instantly

2. **Style Change**:
   - Edit `src/styles/App.css`
   - Change background color
   - Save
   - Browser updates style

3. **Logic Change**:
   - Edit service files
   - Save
   - DevTools shows any new errors
   - Reload if needed

## Performance Testing in Embedded Browser

### Memory Monitor

1. Open DevTools (F12)
2. Go to Memory tab
3. Take heap snapshot
4. Send 10 messages
5. Take another snapshot
6. Compare heap sizes

### Network Monitor

1. DevTools → Network tab
2. Filter by requests
3. Send message
4. Watch:
   - Omnichannel requests
   - DirectLine requests
   - Response times
   - Error codes

## Keyboard Testing in Embedded Browser

**Tab Navigation**:
1. Click in Simple Browser
2. Press Tab repeatedly
3. Verify focus moves through:
   - Text input
   - Send button
   - Voice button
   - Call button

**Enter Key**:
1. Type message
2. Press Enter
3. Message should send

**Escape Key**:
1. During recording
2. Press Escape
3. Should stop recording (if implemented)

## Side-by-Side Development

### Ideal Setup

```
┌─────────────────────────────────┐
│       VS Code Window            │
├──────────────────┬──────────────┤
│                  │              │
│   Code Editor    │   Simple     │
│   (left 50%)     │   Browser    │
│                  │   (right 50%)│
│                  │              │
│                  │   ARTAgent   │
│                  │   Chat App   │
│                  │              │
└──────────────────┴──────────────┘
```

1. Split editor: `Ctrl+\`
2. Open Simple Browser on right
3. Edit code on left
4. Preview on right updates live

## Limitations of Simple Browser

- ⚠️ Microphone access limited (use regular browser for voice testing)
- ⚠️ Some APIs may have restrictions
- ⚠️ Performance may be slower than standalone browser
- ⚠️ Some extensions not available

**For Full Testing**: Use regular browser (Chrome, Edge)

## Comparison: Simple Browser vs Regular Browser

| Feature | Simple Browser | Regular Browser |
|---------|---|---|
| Side-by-side coding | ✅ | ❌ |
| Live reload | ✅ | ✅ |
| DevTools | ✅ | ✅ |
| Microphone access | ⚠️ Limited | ✅ Full |
| Performance | ⚠️ Slower | ✅ Faster |
| Extensions | ❌ | ✅ |
| Network inspector | ✅ | ✅ |
| Console | ✅ | ✅ |

## Workflow Tips

### Efficient Development

1. **Start of Session**:
   ```bash
   npm start
   Ctrl+Shift+P → Simple Browser: Show → http://localhost:3000
   ```

2. **During Development**:
   - Edit code
   - `Ctrl+S` to save
   - Watch changes in Simple Browser
   - Use DevTools to debug

3. **Testing Features**:
   - Text: Direct in Simple Browser
   - Voice: Switch to regular browser
   - Network: Monitor in DevTools

4. **Before Commit**:
   - Full test in regular browser
   - Run console checks
   - Verify no errors

## VS Code Extensions for Better Development

```json
// Recommended extensions in .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.simple-browser"
  ]
}
```

Install with: `Ctrl+Shift+X` → Paste extension ID

## Support

- [VS Code Simple Browser Documentation](https://github.com/microsoft/vscode/tree/main/extensions/simple-browser)
- [VS Code Testing Guide](https://code.visualstudio.com/docs/editor/debugging)
- Check project [TESTING.md](./TESTING.md) for comprehensive testing

## Next Steps

1. ✅ Follow setup above
2. ✅ Open app in Simple Browser
3. ✅ Test text messaging
4. ✅ Switch to regular browser for voice testing
5. ✅ Check console for errors
6. ✅ Use side-by-side for efficient development
