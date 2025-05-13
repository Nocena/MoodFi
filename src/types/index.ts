import { BigNumberish } from 'ethers';

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
  tokenBalance: BigNumberish;
  nfts: NFT[];
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: Mood;
  photo: string;
  reward: boolean;
  comments: Comment[];
  likes: string[];
  socialScore: number;
  isNFT: boolean;
  nftData?: NFT;
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
  type: 'follow' | 'comment' | 'like' | 'message' | 'reward' | 'match' | 'nft_sale' | 'nft_purchase';
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

export interface NFT {
  id: string;
  tokenId: string;
  moodEntryId: string;
  creatorId: string;
  ownerId: string;
  price: BigNumberish;
  isListed: boolean;
  createdAt: string;
  mintedAt: string;
  lastSoldAt?: string;
  lastSoldPrice?: BigNumberish;
}

export interface NFTMarketItem {
  nft: NFT;
  creator: User;
  moodEntry: MoodEntry;
}