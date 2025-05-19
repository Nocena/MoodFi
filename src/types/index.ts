import { BigNumberish } from 'ethers';
import {AuthenticatedSession, SessionClient} from "@lens-protocol/client";

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
  mood: MOOD_TYPE;
  photo: string;
  reward: boolean;
  comments: Comment[];
  likes: string[];
  socialScore: number;
  isNFT: boolean;
  nftData?: NFT;
}

export type MOOD_TYPE =
    'happy' |
    'sad' |
    'fearful' |
    'neutral' |
    'angry' |
    'disgusted' |
    'surprised'

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
  mood: MOOD_TYPE;
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

export type LensAuthContextType = {
  activeSession: AuthenticatedSession | null;
  client: SessionClient | null;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  authenticate: (lensAccountAddress: string, walletAddr: string) => Promise<void>;
  disconnect: () => Promise<void>;
  restore: () => Promise<void>;
  refreshCurrentAccount: () => Promise<void>;
  onboard: (walletAddr: string) => Promise<SessionClient | null>;
  currentAccount: AccountType | null
};

export interface AccountType {
  accountAddress: string
  createdAt: string
  avatar: string
  displayName: string
  localName: string
  bio: string
  isFollowedByMe?: boolean
  chosenMood?: MOOD_TYPE
}

export interface MoodPostType {
  id: string
  author: AccountType
  content: string // item.metadata.content
  imageUrl: string // item.metadata.image.item

  // item.metadata.attributes
  moodType: MOOD_TYPE
  confidence: number
  rewardTokenAmount: number

  commentsCount: number // item.stats.comments
  likesCount: number // item.stats.upvotes
  timestamp: string // item.timestamp

  isLikedByMe?: boolean
}

export interface CommentType {
  id: string
  timestamp: string
  content: string
  author: AccountType
}

export interface AccountStatusType {
  followers: number
  following: number
  posts: number
  comments: number
  reposts: number
  quotes: number
  reacted: number
  reactions: number
  collects: number
}

export interface ProfileDataType {
  followers: number
  following: number
  accountAddress: string
  createdAt: string
  avatar: string
  displayName: string
  localName: string
  bio: string
  isMe: boolean
  isFollowedByMe: boolean
}

export type AuthorWithMood = AccountType & {
  moodType: MOOD_TYPE;          // latest post’s mood
  latestTimestamp: string;   // ISO string from latest post
};

export {}

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }

  type SpeechRecognition = any
  type SpeechRecognitionEvent = any
}


export const LOCAL_STORAGE_LAST_MOOD_TAKEN_TIME = 'last-mood-time'