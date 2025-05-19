import {marketplaceAbi} from '../constants/marketplaceAbi';
import {create} from 'zustand';
import {MoodNFT} from '../types';
import {MARKETPLACE_ADDRESS, NOCX_ADDRESS, viemLensPublicClient} from "../constants";
import {writeContract} from "@wagmi/core";
import {walletConfig} from "../providers/WalletProvider";
import {erc20Abi, parseEther} from "viem";

interface NFTState {
    allNFTs: MoodNFT[]
    isLoading: boolean;
    error: string | null;
    fetchListings: () => Promise<MoodNFT[]>
    fetchAccountNFTs: (accountAddress: string) => Promise<MoodNFT[]>
    mintMoodNFT: ({
                      postId,
                      userName,
                      accountAddress,
                      moodType,
                      imageUri,
                      price,
                  }: {
        postId: string
        userName: string
        accountAddress: string
        moodType: string
        imageUri: string
        price: string // or number, in NOCX token units
    }) => Promise<void>
    buyNFT: (tokenId: number, price: bigint) => Promise<void>
    updateNFTPrice: (tokenId: number, newPrice: bigint) => Promise<void>
    unlistNFT: (tokenId: number) => Promise<void>
}

export const useNFTStore = create<NFTState>((set, get) => ({
    allNFTs: [],
    isLoading: false,
    error: null,

    fetchListings: async () => {
        set({isLoading: true, error: null});
        try {
            const result = await viemLensPublicClient.readContract({
                address: MARKETPLACE_ADDRESS,
                abi: marketplaceAbi,
                functionName: 'getAllNFTs',
            });

            set({allNFTs: result as MoodNFT[], isLoading: false});
            return result as MoodNFT[]
        } catch (err: any) {
            set({error: err.message, isLoading: false});
        }

        return []
    },

    fetchAccountNFTs: async (accountAddress: string) => {
        try {
            const result = await viemLensPublicClient.readContract({
                address: MARKETPLACE_ADDRESS,
                abi: marketplaceAbi,
                functionName: 'getNFTsByAccountAddress',
                args: [accountAddress],
            });

            return result as MoodNFT[];
        } catch (err: any) {
            console.log('error', err)
        }

        return []
    },

    mintMoodNFT: async ({
                            postId,
                            userName,
                            accountAddress,
                            moodType,
                            imageUri,
                            price,
                        }) => {
        const txHash = await writeContract(walletConfig, {
            address: MARKETPLACE_ADDRESS,
            abi: marketplaceAbi,
            functionName: 'mintMoodNFT',
            args: [
                postId,
                userName,
                accountAddress,
                moodType,
                imageUri,
                parseEther(price.toString()), // converts "1.5" -> 1.5 * 10^18
            ],
        })
        console.log('TX Hash:', txHash)
        get().fetchListings()
    },

    buyNFT: async (tokenId, price) => {
        // Step 1: Approve token spending
        await writeContract(walletConfig, {
            address: NOCX_ADDRESS,
            abi: erc20Abi,
            functionName: 'approve',
            args: [MARKETPLACE_ADDRESS, price],
        });

        // Step 2: Call buyNFT
        await writeContract(walletConfig, {
            address: MARKETPLACE_ADDRESS,
            abi: marketplaceAbi,
            functionName: 'buyNFT',
            args: [tokenId],
        });
    },

    updateNFTPrice: async (tokenId, newPrice) => {
        await writeContract(walletConfig, {
            address: MARKETPLACE_ADDRESS,
            abi: marketplaceAbi,
            functionName: 'updateNFTPrice',
            args: [tokenId, newPrice],
        });
    },

    unlistNFT: async (tokenId) => {
         await writeContract(walletConfig, {
            address: MARKETPLACE_ADDRESS,
            abi: marketplaceAbi,
            functionName: 'unlistNFT',
            args: [tokenId],
        });
    }
}));