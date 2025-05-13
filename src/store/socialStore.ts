import { create } from 'zustand';
import { Comment, Message, Conversation, Notification } from '../types';

interface SocialState {
  feed: any[]; // Simplified for this demo
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Record<string, Message[]>;
  notifications: Notification[];
  unreadNotifications: number;
  isLoading: boolean;
  error: string | null;
  
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  likePost: (userId: string, date: string) => Promise<void>;
  unlikePost: (userId: string, date: string) => Promise<void>;
  addComment: (userId: string, date: string, text: string) => Promise<void>;
  sendMessage: (receiverId: string, text: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  markNotificationsAsRead: () => void;
}

// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['user-1', 'user-2'],
    lastMessage: {
      id: 'msg-3',
      senderId: 'user-2',
      receiverId: 'user-1',
      text: 'Looking forward to seeing your mood tomorrow!',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      read: false,
    },
    unreadCount: 1,
  },
  {
    id: 'conv-2',
    participants: ['user-1', 'user-3'],
    lastMessage: {
      id: 'msg-6',
      senderId: 'user-1',
      receiverId: 'user-3',
      text: 'Thanks for the follow!',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      read: true,
    },
    unreadCount: 0,
  },
];

// Mock data for messages in conversations
const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      senderId: 'user-1',
      receiverId: 'user-2',
      text: 'Hi Jane! I noticed we both had the same mood today.',
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      read: true,
    },
    {
      id: 'msg-2',
      senderId: 'user-2',
      receiverId: 'user-1',
      text: 'Hey John! Yes, that\'s awesome! How\'s your day going?',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      read: true,
    },
    {
      id: 'msg-3',
      senderId: 'user-2',
      receiverId: 'user-1',
      text: 'Looking forward to seeing your mood tomorrow!',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      read: false,
    },
  ],
  'conv-2': [
    {
      id: 'msg-4',
      senderId: 'user-3',
      receiverId: 'user-1',
      text: 'Hey, I just followed you!',
      timestamp: new Date(Date.now() - 25 * 3600000).toISOString(),
      read: true,
    },
    {
      id: 'msg-5',
      senderId: 'user-3',
      receiverId: 'user-1',
      text: 'We both seem to be happy today.',
      timestamp: new Date(Date.now() - 24.5 * 3600000).toISOString(),
      read: true,
    },
    {
      id: 'msg-6',
      senderId: 'user-1',
      receiverId: 'user-3',
      text: 'Thanks for the follow!',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      read: true,
    },
  ],
};

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'follow',
    userId: 'user-2',
    text: 'Jane Smith started following you',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'comment',
    userId: 'user-2',
    targetId: new Date(Date.now() - 86400000).toISOString(),
    text: 'Jane Smith commented on your mood',
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'reward',
    userId: 'system',
    text: 'You earned a reward for matching today\'s mood!',
    timestamp: new Date(Date.now() - 20 * 3600000).toISOString(),
    read: true,
  },
];

export const useSocialStore = create<SocialState>((set, get) => ({
  feed: [],
  conversations: [],
  activeConversation: null,
  messages: {},
  notifications: [],
  unreadNotifications: 0,
  isLoading: false,
  error: null,
  
  followUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, we're not actually updating any user data
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to follow user', isLoading: false });
    }
  },
  
  unfollowUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, we're not actually updating any user data
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to unfollow user', isLoading: false });
    }
  },
  
  likePost: async (userId: string, date: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // For demo purposes, we're not actually updating any post data
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to like post', isLoading: false });
    }
  },
  
  unlikePost: async (userId: string, date: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // For demo purposes, we're not actually updating any post data
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Failed to unlike post', isLoading: false });
    }
  },
  
  addComment: async (userId: string, date: string, text: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        userId: 'user-1', // Current user
        text,
        timestamp: new Date().toISOString(),
      };
      
      // For demo purposes, we're not actually updating any post data
      set({ isLoading: false });
      
      return newComment;
    } catch (error) {
      set({ error: 'Failed to add comment', isLoading: false });
      throw new Error('Failed to add comment');
    }
  },
  
  sendMessage: async (receiverId: string, text: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const activeConversationId = get().activeConversation;
      
      if (!activeConversationId) {
        throw new Error('No active conversation');
      }
      
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: 'user-1', // Current user
        receiverId,
        text,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      set(state => ({
        messages: {
          ...state.messages,
          [activeConversationId]: [
            ...state.messages[activeConversationId],
            newMessage,
          ],
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to send message', isLoading: false });
    }
  },
  
  loadConversations: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ 
        conversations: mockConversations,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to load conversations', isLoading: false });
    }
  },
  
  loadMessages: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      set({ 
        messages: {
          ...get().messages,
          [conversationId]: mockMessages[conversationId] || [],
        },
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to load messages', isLoading: false });
    }
  },
  
  setActiveConversation: (conversationId: string | null) => {
    set({ activeConversation: conversationId });
    
    if (conversationId) {
      get().loadMessages(conversationId);
    }
  },
  
  markNotificationsAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notif => ({ ...notif, read: true })),
      unreadNotifications: 0,
    }));
  },
}));