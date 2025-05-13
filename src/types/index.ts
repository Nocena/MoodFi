export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  location?: string;
  followers: string[];
  following: string[];
  moodHistory: MoodEntry[];
  isOnline: boolean;
  lastActive: string;
  joinedDate: string;
}

export interface MoodEntry {
  date: string;
  mood: Mood;
  photo: string;
  reward: boolean;
  comments: Comment[];
  likes: string[];
}

export type Mood = 'happy' | 'sad' | 'excited' | 'calm' | 'neutral';

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'follow' | 'comment' | 'like' | 'message' | 'reward' | 'match';
  userId: string;
  targetId?: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface DailyMood {
  date: string;
  mood: Mood;
}