import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isSameDay } from 'date-fns'
import {MoodPostType} from "../types";
import {getAccountPosts, getGlobalPosts} from "../utils/lens.utils.ts";

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
    setMoodData: (data: MoodData) => void
    resetMood: () => void
    refreshGlobalPosts: (exceptAccountAddress: string) => Promise<void>
    refreshUserPosts: (accountAddress: string) => Promise<void>

}

export const useDailyMoodStore = create<MoodState>()(
    persist(
        (set) => ({
            moodData: null,
            globalPosts: [],
            userPosts: [],
            setMoodData: (data) => {
                set({ moodData: data })
            },

            resetMood: () => {
                set({ moodData: null })
            },

            refreshGlobalPosts: async (exceptAccountAddress: string) => {
                const posts = await getGlobalPosts(exceptAccountAddress)
                set({ globalPosts: posts })
            },

            refreshUserPosts: async (accountAddress: string) => {
                const posts = await getAccountPosts(accountAddress)
                set({ globalPosts: posts })
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
