import axios from 'axios';

// Set the API base URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: Message[];
}

interface ChatResponse {
  message: string;
}

// Configure axios defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow cross-origin credentials
  withCredentials: true
});

/**
 * Service for handling chat interactions with OpenAI API via backend
 */
export const chatService = {
  /**
   * Send messages to the API to get an AI response
   * @param messages Array of chat messages
   * @returns Promise with the AI response
   */
  sendMessage: async (messages: Message[]): Promise<string> => {
    try {
      console.log(`Sending request to ${API_URL}/api/chat`);
      
      // Try using the proxy path if available (not using absolute URL)
      try {
        const response = await api.post<ChatResponse>(
          '/api/chat',
          { messages } as ChatRequest
        );
        
        console.log('Response received:', response.status);
        return response.data.message;
      } catch (proxyError) {
        console.error('Proxy request failed, trying direct URL:', proxyError);
        
        // Fall back to direct URL if proxy fails
        const response = await axios.post<ChatResponse>(
          `${API_URL}/api/chat`,
          { messages } as ChatRequest,
          { withCredentials: true }
        );
        
        return response.data.message;
      }
    } catch (error) {
      console.error('Error in chat service:', error);
      throw new Error('Failed to get response from AI service');
    }
  },
  
  /**
   * Test the connection to the backend
   * @returns Promise resolving to true if connection works
   */
  testConnection: async (): Promise<boolean> => {
    try {
      // Try proxy first
      try {
        await api.get('/api/test');
        console.log('Connection test successful using proxy');
        return true;
      } catch (proxyError) {
        console.warn('Proxy test failed, trying direct URL');
        
        // Try direct URL
        await axios.get(`${API_URL}/api/test`, { withCredentials: true });
        console.log('Connection test successful using direct URL');
        return true;
      }
    } catch (error) {
      console.error('Test connection failed:', error);
      return false;
    }
  }
};

export default chatService;