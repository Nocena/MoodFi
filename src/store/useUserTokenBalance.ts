import {create} from 'zustand'
import {erc20Abi, formatUnits} from 'viem'
import {NOCX_ADDRESS, viemLensPublicClient} from "../constants";

interface UserTokenBalanceState {
  isRefreshing: boolean
  balanceAmount: bigint
  formattedAmount: string
  refreshTokenBalance: (address: string) => Promise<void>
}

export const useUserTokenBalance = create<UserTokenBalanceState>((set) => ({
  isRefreshing: false,
  balanceAmount: 0n,
  formattedAmount: '0',
  refreshTokenBalance: async (address) => {
    if (!address) return

    try {
      set({ isRefreshing: true })

      const balance: bigint = await viemLensPublicClient.readContract({
        address: NOCX_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      })

      set({
        balanceAmount: balance,
        formattedAmount: formatUnits(balance, 18),
        isRefreshing: false,
      })
    } catch (error) {
      console.error('Failed to fetch token balance:', error)
      set({ isRefreshing: false })
    }
  },
}))
