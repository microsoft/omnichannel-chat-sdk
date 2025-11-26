# ARTAgent - Voice Chat Interface

A modern React-based voice and chat interface for Dynamics 365 Omnichannel Services, built with the Omnichannel Chat SDK. This interface enables real-time voice interactions with Copilot Studio bots and escalation to live agents.

## Features

- **Voice Input**: Record and transcribe voice messages using Web Speech API
- **Text Chat**: Send and receive text messages
- **Real-time Transcription**: Automatic speech-to-text conversion
- **Bot Integration**: Connect with Copilot Studio bots
- **Agent Escalation**: Seamlessly escalate to live agents
- **Voice/Video Calling**: Initiate escalation calls with agents (web only)
- **Session Management**: Active session tracking and status indicators
- **Modern UI**: Purple-themed interface with smooth animations
- **Responsive Design**: Works on desktop and mobile devices

## Installation

1. Clone the repository and navigate to this directory:
```bash
cd samples/voice-chat-ui
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your Omnichannel settings in the `.env` file:
```
REACT_APP_ORG_URL=https://your-org.crm.oc.crmlivetie.com
REACT_APP_ORG_ID=your-org-id
REACT_APP_WIDGET_ID=your-widget-id
REACT_APP_CPS_BOT_ID=your-copilot-studio-bot-id
```

## Getting Started

1. Start the development server:
```bash
npm start
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Allow microphone access when prompted

4. Start speaking or typing messages to interact with the bot

## Architecture

### Components

- **VoiceChatInterface**: Main chat interface component
- **MessageDisplay**: Renders chat messages with timestamps
- **VoiceControls**: Voice recording and call controls
- **TextInput**: Text message input field
- **SessionInfo**: Displays active session ID and agent status

### Services

- **OmnichannelChatManager**: Manages Omnichannel Chat SDK integration
- **VoiceRecorder**: Handles microphone input and audio recording
- **SpeechToText**: Converts audio to text using Web Speech API

## Usage

### Voice Input
1. Click the microphone button to start recording
2. Speak your message
3. Click the stop button when done
4. The message will be automatically transcribed and sent

### Text Input
1. Type your message in the text field
2. Press Enter or click Send
3. The message will be sent to the bot

### Escalation to Agent
1. Click the phone button to initiate a call
2. The system will connect you with an available agent
3. Voice and video call controls will appear

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_ORG_URL` | Your Dynamics 365 organization URL | Yes |
| `REACT_APP_ORG_ID` | Your organization ID | Yes |
| `REACT_APP_WIDGET_ID` | Your chat widget ID | Yes |
| `REACT_APP_CPS_BOT_ID` | Your Copilot Studio bot ID | No |
| `REACT_APP_SPEECH_KEY` | Azure Speech Services key | No |
| `REACT_APP_SPEECH_REGION` | Azure Speech Services region | No |

## Browser Support

- Chrome/Edge 88+
- Firefox 90+
- Safari 14+

Note: Voice features require HTTPS in production.

## Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test
```

### Styling

The interface uses custom CSS with:
- Modern gradient backgrounds (purple theme)
- Smooth animations and transitions
- Responsive design with mobile support
- Accessibility features

## Voice Features

### Microphone Access
The application requests microphone permissions on first use. The audio is processed locally and sent to Omnichannel services.

### Transcription
Current implementation uses the Web Speech API. For production, consider integrating:
- Azure Speech Services
- Google Cloud Speech-to-Text
- AWS Transcribe
- Azure Cognitive Services

## Troubleshooting

### Microphone Not Working
1. Check browser permissions for microphone access
2. Ensure HTTPS is used (required in production)
3. Check browser console for errors

### Messages Not Sending
1. Verify Omnichannel configuration in `.env`
2. Check network tab in browser developer tools
3. Ensure chat session is initialized

### Transcription Issues
1. Speak clearly and at normal pace
2. Check for background noise
3. Try alternative speech-to-text service

## Integration with Omnichannel Chat SDK

This interface uses the Omnichannel Chat SDK v2. Key methods used:

```typescript
// Initialize
await chatSDK.initialize();

// Start chat
await chatSDK.startChat();

// Send message
await chatSDK.sendMessage({ content: 'Your message' });

// Subscribe to messages
chatSDK.onNewMessage((message) => {
  // Handle incoming message
});

// Escalate to voice/video
const voiceVideoSDK = await chatSDK.getVoiceVideoCalling();
```

## Contributing

When contributing to this sample:

1. Follow the project's coding guidelines
2. Test on multiple browsers
3. Ensure responsive design
4. Add comments for complex logic
5. Update documentation as needed

## License

This sample is provided as part of the Omnichannel Chat SDK project under the Microsoft license.

## Support

For issues and questions:
1. Check the [Omnichannel Chat SDK documentation](../../README.md)
2. Review troubleshooting guides
3. Check browser console for errors
4. Open an issue on GitHub

## Next Steps

- [ ] Integrate Azure Speech Services for advanced transcription
- [ ] Add support for file attachments
- [ ] Implement chat transcript download
- [ ] Add chat history persistence
- [ ] Support for multiple languages
- [ ] Add accessibility features (ARIA labels)
