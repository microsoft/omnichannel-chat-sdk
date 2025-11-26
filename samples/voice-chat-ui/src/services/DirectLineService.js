class DirectLineService {
  constructor(tokenEndpoint) {
    this.tokenEndpoint = tokenEndpoint;
    this.token = null;
    this.tokenExpiration = null;
    this.directLineClient = null;
  }

  /**
   * Get a fresh DirectLine token from the Copilot Studio bot endpoint
   * @returns {Promise<string>} DirectLine token
   */
  async getToken() {
    try {
      // Check if token is still valid (with 5 min buffer)
      if (this.token && this.tokenExpiration && Date.now() < this.tokenExpiration - 5 * 60 * 1000) {
        console.log('Using cached DirectLine token');
        return this.token;
      }

      console.log('Fetching new DirectLine token from:', this.tokenEndpoint);

      const response = await fetch(this.tokenEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get DirectLine token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error('No token returned from DirectLine endpoint');
      }

      // Store token and calculate expiration (typically 30 minutes)
      this.token = data.token;
      this.tokenExpiration = Date.now() + (data.expires_in || 1800) * 1000;

      console.log('DirectLine token obtained successfully');
      return this.token;
    } catch (error) {
      console.error('Failed to get DirectLine token:', error);
      throw error;
    }
  }

  /**
   * Refresh the DirectLine token
   * @returns {Promise<string>} New DirectLine token
   */
  async refreshToken() {
    this.token = null;
    this.tokenExpiration = null;
    return this.getToken();
  }

  /**
   * Check if current token is expired
   * @returns {boolean} True if token is expired or about to expire
   */
  isTokenExpired() {
    if (!this.token || !this.tokenExpiration) {
      return true;
    }
    // Consider expired if less than 5 minutes left
    return Date.now() >= this.tokenExpiration - 5 * 60 * 1000;
  }

  /**
   * Create a DirectLine conversation
   * @param {string} userId Optional user ID for the conversation
   * @returns {Promise<Object>} Conversation details
   */
  async createConversation(userId = 'user-' + Date.now()) {
    try {
      const token = await this.getToken();

      const response = await fetch('https://directline.botframework.com/v3/directline/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bot: {
            id: 'copilot-studio-bot'
          },
          user: {
            id: userId,
            name: userId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create DirectLine conversation: ${response.status}`);
      }

      const conversation = await response.json();
      console.log('DirectLine conversation created:', conversation.conversationId);
      return conversation;
    } catch (error) {
      console.error('Failed to create DirectLine conversation:', error);
      throw error;
    }
  }

  /**
   * Send a message via DirectLine
   * @param {string} conversationId DirectLine conversation ID
   * @param {string} userId User ID
   * @param {string} text Message text
   * @returns {Promise<Object>} Response from DirectLine
   */
  async sendMessage(conversationId, userId, text) {
    try {
      const token = await this.getToken();

      const response = await fetch(
        `https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'message',
            from: {
              id: userId,
              name: userId
            },
            text: text
          })
        }
      );

      if (!response.ok) {
        // If token expired, try refreshing and retrying once
        if (response.status === 401 || response.status === 403) {
          console.log('Token may have expired, refreshing...');
          const newToken = await this.refreshToken();
          
          const retryResponse = await fetch(
            `https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                type: 'message',
                from: {
                  id: userId,
                  name: userId
                },
                text: text
              })
            }
          );

          if (!retryResponse.ok) {
            throw new Error(`Failed to send message after token refresh: ${retryResponse.status}`);
          }

          return await retryResponse.json();
        }

        throw new Error(`Failed to send DirectLine message: ${response.status}`);
      }

      const result = await response.json();
      console.log('DirectLine message sent:', result.id);
      return result;
    } catch (error) {
      console.error('Failed to send DirectLine message:', error);
      throw error;
    }
  }

  /**
   * Get messages from DirectLine conversation
   * @param {string} conversationId DirectLine conversation ID
   * @param {string} watermark Optional watermark for pagination
   * @returns {Promise<Object>} Messages from the conversation
   */
  async getMessages(conversationId, watermark = null) {
    try {
      const token = await this.getToken();

      let url = `https://directline.botframework.com/v3/directline/conversations/${conversationId}/activities`;
      if (watermark) {
        url += `?watermark=${watermark}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get DirectLine messages: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Retrieved ${result.activities.length} messages from DirectLine`);
      return result;
    } catch (error) {
      console.error('Failed to get DirectLine messages:', error);
      throw error;
    }
  }

  /**
   * Reconnect to an existing DirectLine conversation
   * @param {string} conversationId DirectLine conversation ID
   * @param {string} token Optional reconnect token
   * @returns {Promise<Object>} Reconnection details
   */
  async reconnect(conversationId, token = null) {
    try {
      const directLineToken = token || (await this.getToken());

      const response = await fetch(
        `https://directline.botframework.com/v3/directline/conversations/${conversationId}`,
        {
          headers: {
            'Authorization': `Bearer ${directLineToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to reconnect to DirectLine conversation: ${response.status}`);
      }

      const result = await response.json();
      console.log('Reconnected to DirectLine conversation');
      return result;
    } catch (error) {
      console.error('Failed to reconnect to DirectLine:', error);
      throw error;
    }
  }

  /**
   * End a DirectLine conversation
   * @param {string} conversationId DirectLine conversation ID
   * @returns {Promise<void>}
   */
  async endConversation(conversationId) {
    try {
      const token = await this.getToken();

      await fetch(
        `https://directline.botframework.com/v3/directline/conversations/${conversationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('DirectLine conversation ended');
    } catch (error) {
      console.error('Failed to end DirectLine conversation:', error);
      throw error;
    }
  }
}

export default DirectLineService;
