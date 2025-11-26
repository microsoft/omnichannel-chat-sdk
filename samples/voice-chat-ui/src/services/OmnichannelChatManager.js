import OmnichannelChatSDK from '@microsoft/omnichannel-chat-sdk';
import DirectLineService from './DirectLineService';

class OmnichannelChatManager {
  constructor(omnichannelConfig) {
    this.omnichannelConfig = omnichannelConfig;
    this.chatSDK = null;
    this.voiceVideoSDK = null;
    this.directLineService = null;
    this.directLineConversationId = null;
    this.directLineUserId = null;
  }

  async initialize() {
    try {
      const chatSDKConfig = {
        dataMasking: {
          disable: false,
          maskingCharacter: '#'
        }
      };

      this.chatSDK = new OmnichannelChatSDK.OmnichannelChatSDK(
        this.omnichannelConfig,
        chatSDKConfig
      );

      await this.chatSDK.initialize();
      console.log('Omnichannel Chat SDK initialized successfully');

      // Initialize DirectLine service if token endpoint is configured
      if (process.env.REACT_APP_DIRECTLINE_TOKEN_URL) {
        this.directLineService = new DirectLineService(
          process.env.REACT_APP_DIRECTLINE_TOKEN_URL
        );
        console.log('DirectLine service initialized');

        // Initialize DirectLine conversation
        await this.initializeDirectLine();
      }
    } catch (error) {
      console.error('Failed to initialize Omnichannel Chat SDK:', error);
      throw error;
    }
  }

  /**
   * Initialize DirectLine conversation
   */
  async initializeDirectLine() {
    try {
      if (!this.directLineService) {
        console.warn('DirectLine service not configured');
        return;
      }

      // Create user ID
      this.directLineUserId = process.env.REACT_APP_DIRECTLINE_USER_ID || 'user-' + Date.now();

      // Create DirectLine conversation
      const conversation = await this.directLineService.createConversation(this.directLineUserId);
      this.directLineConversationId = conversation.conversationId;

      console.log('DirectLine conversation initialized:', this.directLineConversationId);
      return conversation;
    } catch (error) {
      console.error('Failed to initialize DirectLine:', error);
      // Don't throw - DirectLine is optional
    }
  }

  /**
   * Get DirectLine service instance
   */
  getDirectLineService() {
    return this.directLineService;
  }

  /**
   * Get DirectLine conversation ID
   */
  getDirectLineConversationId() {
    return this.directLineConversationId;
  }

  async startChat(optionalParams = {}) {
    try {
      await this.chatSDK.startChat(optionalParams);
      
      const liveChatContext = await this.chatSDK.getCurrentLiveChatContext();
      
      return {
        sessionId: liveChatContext?.chatId || Date.now().toString(),
        context: liveChatContext
      };
    } catch (error) {
      console.error('Failed to start chat:', error);
      throw error;
    }
  }

  async sendMessage(content) {
    try {
      const messageToSend = {
        content: content
      };

      await this.chatSDK.sendMessage(messageToSend);

      // Also send via DirectLine if available
      if (this.directLineService && this.directLineConversationId) {
        try {
          await this.directLineService.sendMessage(
            this.directLineConversationId,
            this.directLineUserId,
            content
          );
          console.log('Message sent via DirectLine');
        } catch (error) {
          console.warn('Failed to send message via DirectLine:', error);
          // Continue with Omnichannel even if DirectLine fails
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Send message via DirectLine only
   */
  async sendMessageViaDirectLine(content) {
    try {
      if (!this.directLineService || !this.directLineConversationId) {
        throw new Error('DirectLine not initialized');
      }

      return await this.directLineService.sendMessage(
        this.directLineConversationId,
        this.directLineUserId,
        content
      );
    } catch (error) {
      console.error('Failed to send DirectLine message:', error);
      throw error;
    }
  }

  /**
   * Get messages from DirectLine
   */
  async getDirectLineMessages(watermark = null) {
    try {
      if (!this.directLineService || !this.directLineConversationId) {
        throw new Error('DirectLine not initialized');
      }

      return await this.directLineService.getMessages(
        this.directLineConversationId,
        watermark
      );
    } catch (error) {
      console.error('Failed to get DirectLine messages:', error);
      throw error;
    }
  }

  async getMessages() {
    try {
      return await this.chatSDK.getMessages();
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw error;
    }
  }

  async sendTypingEvent() {
    try {
      await this.chatSDK.sendTypingEvent();
    } catch (error) {
      console.error('Failed to send typing event:', error);
    }
  }

  async endChat() {
    try {
      await this.chatSDK.endChat();
    } catch (error) {
      console.error('Failed to end chat:', error);
      throw error;
    }
  }

  async initiateVoiceVideoCall() {
    try {
      const VoiceVideoCallingSDK = await this.chatSDK.getVoiceVideoCalling();
      console.log('Voice & Video Calling SDK loaded');
      
      const chatToken = await this.chatSDK.getChatToken();
      
      await VoiceVideoCallingSDK.initialize({
        chatToken,
        selfVideoHTMLElementId: 'selfVideo',
        remoteVideoHTMLElementId: 'remoteVideo',
        OCClient: this.chatSDK.OCClient
      });

      this.voiceVideoSDK = VoiceVideoCallingSDK;
      return VoiceVideoCallingSDK;
    } catch (error) {
      if (error.message === 'UnsupportedPlatform') {
        console.warn('Voice & Video Calling is not supported on this platform');
      } else if (error.message === 'FeatureDisabled') {
        console.warn('Voice & Video Calling feature is disabled');
      } else {
        console.error('Failed to initialize Voice & Video Calling:', error);
      }
      throw error;
    }
  }

  async downloadTranscript() {
    try {
      return await this.chatSDK.getLiveChatTranscript();
    } catch (error) {
      console.error('Failed to download transcript:', error);
      throw error;
    }
  }

  async emailTranscript(emailAddress, attachmentMessage = '') {
    try {
      await this.chatSDK.emailLiveChatTranscript({
        emailAddress,
        attachmentMessage
      });
    } catch (error) {
      console.error('Failed to email transcript:', error);
      throw error;
    }
  }

  onNewMessage(callback) {
    if (this.chatSDK) {
      this.chatSDK.onNewMessage(callback);
    }
  }

  onTypingEvent(callback) {
    if (this.chatSDK) {
      this.chatSDK.onTypingEvent(callback);
    }
  }

  onAgentEndSession(callback) {
    if (this.chatSDK) {
      this.chatSDK.onAgentEndSession(callback);
    }
  }
}

export default OmnichannelChatManager;
