import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isSameDay } from 'date-fns'
import {AccountType, AuthorWithMood, MOOD_TYPE, MoodPostType} from "../types";
import {
    fetchRecommendedAccounts,
    getAccountPosts,
    getGlobalPosts,
    getSimilarMoodAccounts
} from "../utils/lens.utils.ts";

interface MoodData {
    moodTime: string
    moodType: string
    confidence: number
    rewardAmount: number
}

interface MoodState {
    moodData: MoodData | null
    globalPosts: MoodPostType[]
    userPosts: MoodPostType[]
    recommendAccounts: AccountType[]
    similarMoodAccounts: AuthorWithMood[]
    setMoodData: (data: MoodData) => void
    resetMood: () => void
    isLoadingGlobalPosts: boolean
    isLoadingUserPosts: boolean
    isLoadingRecommendAccounts: boolean
    isLoadingSimilarAccounts: boolean
    refreshGlobalPosts: (exceptAccountAddress: string) => Promise<void>
    refreshUserPosts: (accountAddress: string) => Promise<void>
    refreshRecommendAccounts: (accountAddress: string) => Promise<void>
    refreshSimilarAccounts: (exceptAccountAddress: string, giveMoodType: MOOD_TYPE | null) => Promise<void>
}

export const useDailyMoodStore = create<MoodState>()(
    persist(
        (set) => ({
            moodData: null,
            globalPosts: [],
            userPosts: [],
            recommendAccounts: [],
            similarMoodAccounts: [],
            isLoadingGlobalPosts: false,
            isLoadingUserPosts: false,
            isLoadingRecommendAccounts: false,
            isLoadingSimilarAccounts: false,
            setMoodData: (data) => {
                set({ moodData: data })
            },

            resetMood: () => {
                set({ moodData: null })
            },

            refreshGlobalPosts: async (accountAddress: string) => {
                set({ isLoadingGlobalPosts: true })
                try {
                    const posts = await getGlobalPosts(accountAddress)
                    set({ globalPosts: posts })
                } catch (e) {
                    console.error('Failed to fetch global posts', e)
                } finally {
                    set({ isLoadingGlobalPosts: false })
                }
            },

            refreshUserPosts: async (accountAddress: string) => {
                set({ isLoadingUserPosts: true })
                try {
                    const posts = await getAccountPosts(accountAddress)
                    set({ userPosts: posts })
                } catch (e) {
                    console.error('Failed to fetch user posts', e)
                } finally {
                    set({ isLoadingUserPosts: false })
                }
            },

            refreshRecommendAccounts: async (accountAddress: string) => {
                set({ isLoadingRecommendAccounts: true })
                try {
                    const accounts = await fetchRecommendedAccounts(accountAddress)
                    set({ recommendAccounts: accounts })
                } catch (e) {
                    console.error('Failed to fetch recommended accounts', e)
                } finally {
                    set({ isLoadingRecommendAccounts: false })
                }
            },

            refreshSimilarAccounts: async (exceptAccountAddress: string, giveMoodType: MOOD_TYPE | null) => {
                set({ isLoadingSimilarAccounts: true })
                try {
                    const accounts = await getSimilarMoodAccounts(exceptAccountAddress, giveMoodType)
                    set({ similarMoodAccounts: accounts })
                } catch (e) {
                    console.error('Failed to fetch similar accounts', e)
                } finally {
                    set({ isLoadingSimilarAccounts: false })
                }
            },
        }),
        {
            name: 'mood_data',
            partialize: (state) => ({
                moodData: state.moodData,
            }),
        }
    )
)

export const useTodayMoodTaken = () => {
    const moodTime = useDailyMoodStore((s) => s.moodData?.moodTime)
    return moodTime ? isSameDay(new Date(moodTime), new Date()) : false
}
