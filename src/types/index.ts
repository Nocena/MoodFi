import {AuthenticatedSession, SessionClient} from "@lens-protocol/client";


export interface MoodNFT {
  tokenId: number;             // Unique token ID
  postId: string;              // Associated post ID (e.g., Lens post)
  userName: string;            // Display name of the user
  accountAddress: string;      // Pseudo-account, not the wallet address
  moodType: string;            // Mood category or type
  imageUri: string;            // Image link (IPFS, HTTPS, etc.)
  price: bigint;               // Price in NOCX tokens (use bigint for precision)
  owner: `0x${string}`;        // Current wallet address of owner
  isListed: boolean;           // Whether NFT is listed for sale
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

export const LOCAL_STORAGE_LAST_MOOD_TAKEN_TIME = 'last-mood-time'