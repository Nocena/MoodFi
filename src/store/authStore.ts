import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (data: { bio: string; location: string }) => Promise<void>;
}

// Mock user data
const mockUser: User = {
  id: 'user-1',
  username: 'johndoe',
  name: 'John Doe',
  avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
  bio: 'Just a mood enthusiast exploring the world.',
  location: 'San Francisco, CA',
  followers: ['user-2', 'user-3'],
  following: ['user-2'],
  moodHistory: [
    {
      date: new Date(Date.now() - 86400000).toISOString(),
      mood: 'happy',
      photo: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600',
      reward: true,
      comments: [
        {
          id: 'comment-1',
          userId: 'user-2',
          text: 'Looking good today!',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      likes: ['user-2', 'user-3'],
    },
  ],
  isOnline: true,
  lastActive: new Date().toISOString(),
  joinedDate: new Date(Date.now() - 30 * 86400000).toISOString(),
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation (would be server-side in a real app)
      if (username === 'johndoe' && password === 'password') {
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ error: 'Invalid credentials', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Login failed', isLoading: false });
    }
  },
  signup: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll just log in the mock user
      const newUser = {
        ...mockUser,
        username,
        name: username, // In a real app, we'd have a separate name field
      };
      
      set({ user: newUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: 'Signup failed', isLoading: false });
    }
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  clearError: () => {
    set({ error: null });
  },
  updateProfile: async (data) => {
    set({ isLoading: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set(state => ({
        user: state.user ? {
          ...state.user,
          bio: data.bio,
          location: data.location,
        } : null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update profile', isLoading: false });
      throw error;
    }
  },
}));