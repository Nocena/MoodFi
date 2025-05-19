import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: Message[]
}

interface ChatResponse {
  message: string
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const chatService = {
  sendMessage: async (messages: Message[]): Promise<string> => {
    try {
      console.log(`📡 Sending request to ${API_URL}/api/chat`)

      try {
        const response = await api.post<ChatResponse>(
          '/api/chat',
          { messages } as ChatRequest
        )
        console.log('✅ Response received:', response.status)
        return response.data.message
      } catch (proxyError) {
        console.warn('⚠️ Proxy failed, using fallback URL:', proxyError)

        const response = await axios.post<ChatResponse>(
          `${API_URL}/api/chat`,
          { messages } as ChatRequest,
          { withCredentials: true }
        )

        return response.data.message
      }
    } catch (error) {
      console.error('❌ Error in chatService:', error)
      throw new Error('Failed to get response from AI service')
    }
  },

  testConnection: async (): Promise<boolean> => {
    try {
      try {
        await api.get('/api/test')
        console.log('✅ Backend test successful via proxy')
        return true
      } catch (proxyError) {
        console.warn('⚠️ Proxy test failed, using direct URL')
        await axios.get(`${API_URL}/api/test`, { withCredentials: true })
        console.log('✅ Backend test successful via direct URL')
        return true
      }
    } catch (error) {
      console.error('❌ Test connection failed:', error)
      return false
    }
  }
}

export default chatService
