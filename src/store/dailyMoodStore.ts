import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {isSameDay} from 'date-fns'
import {AccountType, AuthorWithMood, MOOD_TYPE, MoodPostType} from "../types";
import {
    fetchRecommendedAccounts,
    getAccountPosts,
    getGlobalPosts,
    getSimilarMoodAccounts
} from "../utils/lens.utils.ts";
import {SessionClient} from "@lens-protocol/client";

interface MoodData {
    moodTime: string
    moodType: string
    confidence: number
    rewardAmount: number
}

interface MoodState {
    moodData: MoodData | null
    todayMoodTaken: boolean
    todayMood: MOOD_TYPE | null
    globalPosts: MoodPostType[]
    userPosts: MoodPostType[]
    recommendAccounts: AccountType[]
    similarMoodAccounts: AuthorWithMood[]
    setMoodData: (data: MoodData) => void
    resetMood: () => void
    setTodayMood: (mood: MOOD_TYPE) => void
    isLoadingGlobalPosts: boolean
    isLoadingUserPosts: boolean
    isLoadingRecommendAccounts: boolean
    isLoadingSimilarAccounts: boolean
    refreshGlobalPosts: (sessionClient: SessionClient | null, exceptAccountAddress: string) => Promise<void>
    refreshUserPosts: (sessionClient: SessionClient | null, accountAddress: string) => Promise<void>
    refreshRecommendAccounts: (sessionClient: SessionClient | null, accountAddress: string) => Promise<void>
    refreshSimilarAccounts: (sessionClient: SessionClient | null, exceptAccountAddress: string, giveMoodType: MOOD_TYPE | null) => Promise<void>
}

export const useDailyMoodStore = create<MoodState>()(
    persist(
        (set) => ({
            moodData: null,
            globalPosts: [],
            userPosts: [],
            recommendAccounts: [],
            similarMoodAccounts: [],
            todayMoodTaken: false,
            todayMood: null,
            isLoadingGlobalPosts: true,
            isLoadingUserPosts: true,
            isLoadingRecommendAccounts: false,
            isLoadingSimilarAccounts: false,
            setMoodData: (data) => {
                set({ moodData: data })
            },

            resetMood: () => {
                set({ moodData: null })
            },

            refreshGlobalPosts: async (sessionClient: SessionClient | null, accountAddress: string) => {
                set({ isLoadingGlobalPosts: true })
                try {
                    const posts = await getGlobalPosts(sessionClient, accountAddress)
                    set({ globalPosts: posts })
                } catch (e) {
                    console.error('Failed to fetch global posts', e)
                } finally {
                    set({ isLoadingGlobalPosts: false })
                }
            },

            refreshUserPosts: async (sessionClient: SessionClient | null, accountAddress: string) => {
                set({ isLoadingUserPosts: true })
                try {
                    const posts = await getAccountPosts(sessionClient, accountAddress)
                    const todayMoodPost = posts.filter(post =>
                        isSameDay(new Date(post.timestamp), new Date())
                    )[0]

                    set({
                        userPosts: posts,
                        todayMoodTaken: !!todayMoodPost,
                        todayMood: todayMoodPost?.moodType ?? null
                    })
                } catch (e) {
                    console.error('Failed to fetch user posts', e)
                } finally {
                    set({ isLoadingUserPosts: false })
                }
            },

            refreshRecommendAccounts: async (sessionClient: SessionClient | null, accountAddress: string) => {
                set({ isLoadingRecommendAccounts: true })
                try {
                    const accounts = await fetchRecommendedAccounts(sessionClient, accountAddress)
                    set({ recommendAccounts: accounts })
                } catch (e) {
                    console.error('Failed to fetch recommended accounts', e)
                } finally {
                    set({ isLoadingRecommendAccounts: false })
                }
            },

            refreshSimilarAccounts: async (sessionClient: SessionClient | null, exceptAccountAddress: string, giveMoodType: MOOD_TYPE | null) => {
                set({ isLoadingSimilarAccounts: true })
                try {
                    const accounts = await getSimilarMoodAccounts(sessionClient, exceptAccountAddress, giveMoodType)
                    set({ similarMoodAccounts: accounts })
                } catch (e) {
                    console.error('Failed to fetch similar accounts', e)
                } finally {
                    set({ isLoadingSimilarAccounts: false })
                }
            },

            setTodayMood: (mood: MOOD_TYPE) => {
                set({
                    todayMood: mood,
                })
            }
        }),
        {
            name: 'mood_data',
            partialize: (state) => ({
                moodData: state.moodData,
            }),
        }
    )
)