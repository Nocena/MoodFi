import { create } from 'zustand';
import { User, Mood, MoodEntry, DailyMood } from '../types';

interface MoodState {
  dailyMood: DailyMood | null;
  userMoods: MoodEntry[];
  todaysMoodTaken: boolean;
  suggestedUsers: User[];
  isProcessing: boolean;
  error: string | null;
  detectMood: (photoUrl: string) => Promise<Mood>;
  submitMood: (mood: Mood, photoUrl: string) => Promise<void>;
  getDailyMood: () => Promise<void>;
  getSuggestedUsers: () => Promise<void>;
  resetError: () => void;
}

// Mock data for suggested users
const mockSuggestedUsers: User[] = [
  {
    id: 'user-2',
    username: 'janesmith',
    name: 'Jane Smith',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
    bio: 'Photographer and design enthusiast',
    followers: ['user-1', 'user-3'],
    following: ['user-1'],
    moodHistory: [
      {
        date: new Date().toISOString(),
        mood: 'happy',
        photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
        reward: true,
        comments: [],
        likes: ['user-1'],
      },
    ],
    isOnline: true,
    lastActive: new Date().toISOString(),
    joinedDate: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'user-3',
    username: 'alexchen',
    name: 'Alex Chen',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
    bio: 'Music lover and coffee addict',
    followers: ['user-1'],
    following: ['user-1', 'user-2'],
    moodHistory: [
      {
        date: new Date().toISOString(),
        mood: 'happy',
        photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
        reward: true,
        comments: [],
        likes: [],
      },
    ],
    isOnline: false,
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    joinedDate: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
];

// Function to determine if user already took today's mood
const hasTakenTodayMood = (moodHistory: MoodEntry[]): boolean => {
  if (!moodHistory.length) return false;
  
  const today = new Date().toISOString().split('T')[0];
  return moodHistory.some(entry => {
    const entryDate = new Date(entry.date).toISOString().split('T')[0];
    return entryDate === today;
  });
};

export const useMoodStore = create<MoodState>((set, get) => ({
  dailyMood: {
    date: new Date().toISOString(),
    mood: 'happy', // Today's selected mood is "happy"
  },
  userMoods: [],
  todaysMoodTaken: false,
  suggestedUsers: [],
  isProcessing: false,
  error: null,
  
  detectMood: async (photoUrl: string) => {
    set({ isProcessing: true, error: null });
    
    try {
      // Simulate mood detection API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we're returning a random mood
      // In a real app, this would be determined by AI analysis
      const moods: Mood[] = ['happy', 'sad', 'excited', 'calm', 'neutral'];
      const detectedMood = moods[Math.floor(Math.random() * moods.length)];
      
      set({ isProcessing: false });
      return detectedMood;
    } catch (error) {
      set({ error: 'Failed to detect mood', isProcessing: false });
      throw new Error('Mood detection failed');
    }
  },
  
  submitMood: async (mood: Mood, photoUrl: string) => {
    set({ isProcessing: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dailyMood = get().dailyMood;
      const isReward = dailyMood?.mood === mood;
      
      const newMoodEntry: MoodEntry = {
        date: new Date().toISOString(),
        mood,
        photo: photoUrl,
        reward: isReward,
        comments: [],
        likes: [],
      };
      
      set(state => ({ 
        userMoods: [newMoodEntry, ...state.userMoods],
        todaysMoodTaken: true,
        isProcessing: false 
      }));
      
      // After submitting mood, get suggested users
      get().getSuggestedUsers();
    } catch (error) {
      set({ error: 'Failed to submit mood', isProcessing: false });
    }
  },
  
  getDailyMood: async () => {
    set({ isProcessing: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, we're using a fixed mood
      // In a real app, this would be determined by the server
      set({ 
        dailyMood: {
          date: new Date().toISOString(),
          mood: 'happy',
        },
        isProcessing: false 
      });
    } catch (error) {
      set({ error: 'Failed to get daily mood', isProcessing: false });
    }
  },
  
  getSuggestedUsers: async () => {
    set({ isProcessing: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, we would filter users based on today's mood
      set({ suggestedUsers: mockSuggestedUsers, isProcessing: false });
    } catch (error) {
      set({ error: 'Failed to get suggested users', isProcessing: false });
    }
  },
  
  resetError: () => set({ error: null }),
}));