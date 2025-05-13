import { create } from 'zustand';
import { ethers, BigNumberish } from 'ethers';
import { NFT, NFTMarketItem, MoodEntry } from '../types';

interface NFTState {
  marketItems: NFTMarketItem[];
  userNFTs: NFT[];
  isLoading: boolean;
  error: string | null;
  totalMarketItems: number;
  totalUserNFTs: number;
  
  mintNFT: (moodEntry: MoodEntry) => Promise<void>;
  listNFT: (nftId: string, price: BigNumberish) => Promise<void>;
  unlistNFT: (nftId: string) => Promise<void>;
  buyNFT: (nftId: string) => Promise<void>;
  loadMarketItems: (page: number, limit: number) => Promise<void>;
  loadUserNFTs: (page: number, limit: number) => Promise<void>;
  calculateSocialScore: (moodEntry: MoodEntry) => number;
}

// Generate mock NFTs
const generateMockNFTs = (count: number, startIndex: number = 0): NFTMarketItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    nft: {
      id: `nft-${startIndex + i + 1}`,
      tokenId: ethers.hexlify(ethers.randomBytes(32)),
      moodEntryId: `mood-${startIndex + i + 1}`,
      creatorId: 'user-2',
      ownerId: 'user-2',
      price: ethers.parseEther((0.1 + Math.random() * 0.9).toFixed(2)),
      isListed: true,
      createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      mintedAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    },
    creator: {
      id: 'user-2',
      username: 'janesmith',
      name: 'Jane Smith',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
      bio: 'NFT artist and mood creator',
      followers: ['user-1'],
      following: ['user-1'],
      moodHistory: [],
      isOnline: true,
      lastActive: new Date().toISOString(),
      joinedDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      tokenBalance: ethers.parseEther('10'),
      nfts: [],
    },
    moodEntry: {
      id: `mood-${startIndex + i + 1}`,
      date: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      mood: ['happy', 'excited', 'calm', 'neutral'][Math.floor(Math.random() * 4)] as any,
      photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
      reward: Math.random() > 0.5,
      comments: [],
      likes: [],
      socialScore: Math.floor(Math.random() * 200 + 50),
      isNFT: true,
    },
  }));
};

// Generate mock user NFTs
const generateMockUserNFTs = (count: number, startIndex: number = 0): NFT[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-nft-${startIndex + i + 1}`,
    tokenId: ethers.hexlify(ethers.randomBytes(32)),
    moodEntryId: `user-mood-${startIndex + i + 1}`,
    creatorId: 'user-1',
    ownerId: 'user-1',
    price: ethers.parseEther((0.1 + Math.random() * 0.9).toFixed(2)),
    isListed: Math.random() > 0.5,
    createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    mintedAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    lastSoldAt: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 15 * 86400000).toISOString() : undefined,
    lastSoldPrice: Math.random() > 0.7 ? ethers.parseEther((0.1 + Math.random() * 0.9).toFixed(2)) : undefined,
  }));
};

export const useNFTStore = create<NFTState>((set, get) => ({
  marketItems: [],
  userNFTs: [],
  isLoading: false,
  error: null,
  totalMarketItems: 50,
  totalUserNFTs: 30,

  calculateSocialScore: (moodEntry: MoodEntry) => {
    const likeWeight = 1;
    const commentWeight = 2;
    const recastWeight = 3;

    const likeScore = moodEntry.likes.length * likeWeight;
    const commentScore = moodEntry.comments.length * commentWeight;
    const recastScore = 0 * recastWeight;

    return likeScore + commentScore + recastScore;
  },

  mintNFT: async (moodEntry: MoodEntry) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newNFT: NFT = {
        id: `nft-${Date.now()}`,
        tokenId: ethers.hexlify(ethers.randomBytes(32)),
        moodEntryId: moodEntry.id,
        creatorId: 'user-1',
        ownerId: 'user-1',
        price: ethers.parseEther('0.1'),
        isListed: false,
        createdAt: new Date().toISOString(),
        mintedAt: new Date().toISOString(),
      };
      
      set(state => ({
        userNFTs: [...state.userNFTs, newNFT],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to mint NFT', isLoading: false });
    }
  },

  listNFT: async (nftId: string, price: BigNumberish) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set(state => ({
        userNFTs: state.userNFTs.map(nft =>
          nft.id === nftId
            ? { ...nft, isListed: true, price }
            : nft
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to list NFT', isLoading: false });
    }
  },

  unlistNFT: async (nftId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set(state => ({
        userNFTs: state.userNFTs.map(nft =>
          nft.id === nftId
            ? { ...nft, isListed: false }
            : nft
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to unlist NFT', isLoading: false });
    }
  },

  buyNFT: async (nftId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nft = get().marketItems.find(item => item.nft.id === nftId)?.nft;
      
      if (!nft) {
        throw new Error('NFT not found');
      }
      
      const updatedNFT: NFT = {
        ...nft,
        ownerId: 'user-1',
        isListed: false,
        lastSoldAt: new Date().toISOString(),
        lastSoldPrice: nft.price,
      };
      
      set(state => ({
        userNFTs: [...state.userNFTs, updatedNFT],
        marketItems: state.marketItems.filter(item => item.nft.id !== nftId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to buy NFT', isLoading: false });
    }
  },

  loadMarketItems: async (page: number, limit: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const startIndex = (page - 1) * limit;
      const mockItems = generateMockNFTs(limit, startIndex);
      
      set({ marketItems: mockItems, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load market items', isLoading: false });
    }
  },

  loadUserNFTs: async (page: number, limit: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const startIndex = (page - 1) * limit;
      const mockNFTs = generateMockUserNFTs(limit, startIndex);
      
      set({ userNFTs: mockNFTs, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load user NFTs', isLoading: false });
    }
  },
}));