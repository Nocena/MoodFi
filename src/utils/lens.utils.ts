import {APP_ADDRESS, FEED_ADDRESS, lensPublicClient} from "../constants";
import {AccountStatusType, AccountType, MOOD_TYPE, MoodPostType} from "../types";
import {
    fetchAccount,
    fetchAccountsAvailable,
    fetchAccountStats,
    fetchFollowers,
    fetchFollowing,
    fetchPosts,
    lastLoggedInAccount,
    post,
} from "@lens-protocol/client/actions";
import {type EvmAddress} from '@lens-protocol/types'
import {image, MediaImageMimeType, MetadataAttributeType,} from "@lens-protocol/metadata"
import {uploadMediaToGrove, uploadMetadataToGrove} from "./grove.utils.ts";
import {SessionClient, uri} from "@lens-protocol/client";

const getAccountDataByRaw = (rawData: any): AccountType => {
    return {
        accountAddress: rawData.address,
        createdAt: rawData.createdAt,
        avatar: rawData.metadata?.picture ?? '',
        displayName: rawData.metadata?.name ?? '',
        localName: rawData.username?.localName ?? '',
        bio: rawData.metadata?.bio ?? '',
        isFollowedByMe: rawData.operations?.isFollowedByMe ?? false,
    }

}

const getMoodPostDataByRaw = (item: any): MoodPostType => {
    const attributes = item.metadata.attributes
    const moodType = attributes.filter((attribute: any) => attribute.key === 'moodType')[0]?.value ?? 'neutral'
    const confidence = Number(attributes.filter((attribute: any) => attribute.key === 'confidence')[0]?.value ?? 0)
    const rewardTokenAmount = Number(attributes.filter((attribute: any) => attribute.key === 'rewardTokenAmount')[0]?.value ?? 0)

    return {
        id: item.id,
        author: getAccountDataByRaw(item.author),
        content: item?.metadata?.content ?? '',
        imageUrl: item?.metadata?.image.item ?? '',
        moodType,
        confidence,
        rewardTokenAmount,
        commentsCount: item.stats?.comments ?? 0,
        likesCount: item.stats?.upvotes ?? 0,
        timestamp: item.timestamp ?? (new Date()).toString(),
    }
}

export const fetchAvailableLensAccounts = async (walletAddress: string): Promise<AccountType[]> => {
    if (!walletAddress) {
        return [];
    }
    const result = await fetchAccountsAvailable(lensPublicClient, {
        managedBy: walletAddress,
        includeOwned: true,
    });

    if (result.isErr()) {
        console.error(result.error)
        return []
    }

    return result.value.items.map((item) => {
        return getAccountDataByRaw(item.account)
    })
}

export const fetchAccountByUserName = async (userName: string): Promise<AccountType | null> => {
    if (!userName) {
        return null;
    }
    const result = await fetchAccount(lensPublicClient, {
        username: {
            localName: userName,
        },
    });

    if (result.isErr()) {
        console.error(result.error)
        return null
    }

    const item = result.value
    if (!item)
        return null

    return getAccountDataByRaw(item)
}

export const getLastLoggedInAccount = async (walletAddress: string): Promise<AccountType | null> => {
    if (!walletAddress) {
        return null;
    }

    try {
        const result = await lastLoggedInAccount(lensPublicClient, {
            app: APP_ADDRESS,
            address: walletAddress,
        });

        if (result.isErr()) {
            console.error(result.error)
            return null
        }

        const item = result.value
        if (!item)
            return null

        return getAccountDataByRaw(item)
    } catch (e) {
        console.log("error getLastLoggedInAccount", e)
        return null;
    }
}

export const getAccountStats = async (accountAddress: string): Promise<AccountStatusType | null> => {
    if (!accountAddress) {
        return null;
    }

    try {
        const result = await fetchAccountStats(lensPublicClient, {
            account: accountAddress,
        });

        if (result.isErr()) {
            console.error(result.error)
            return null
        }

        const item = result.value
        if (!item)
            return null

        return {
            followers: item!.graphFollowStats.followers,
            following: item!.graphFollowStats.following,
            posts: item!.feedStats.posts,
            comments: item!.feedStats.comments,
            reposts: item!.feedStats.reposts,
            quotes: item!.feedStats.quotes,
            reacted: item!.feedStats.reacted,
            reactions: item!.feedStats.reactions,
            collects: item!.feedStats.collects,
        }
    } catch (e) {
        console.log("error getAccountStats", e)
        return null;
    }
}

export const getAccountFollowers = async (accountAddress: string): Promise<AccountType[]> => {
    if (!accountAddress) {
        return [];
    }

    try {
        const result = await fetchFollowers(lensPublicClient, {
            account: accountAddress,
        });

        if (result.isErr()) {
            console.error(result.error)
            return []
        }

        const items = result.value.items
        if (!items)
            return []

        return items.map((item) => {
            return getAccountDataByRaw(item.follower)
        })
    } catch (e) {
        console.log("error getAccountFollowers", e)
        return [];
    }
}

export const getAccountFollowings = async (accountAddress: string): Promise<AccountType[]> => {
    if (!accountAddress) {
        return [];
    }

    try {
        const result = await fetchFollowing(lensPublicClient, {
            account: accountAddress,
        });

        if (result.isErr()) {
            console.error(result.error)
            return []
        }

        const items = result.value.items
        if (!items)
            return []

        return items.map((item) => {
            return getAccountDataByRaw(item.following)
        })
    } catch (e) {
        console.log("error getAccountFollowers", e)
        return [];
    }
}

export const postDailyMood = async (
    sessionClient: SessionClient,
    imageFile: File,
    moodType: MOOD_TYPE,
    confidence: number,
    rewardTokenAmount: number,
    content: string | null) => {
    try {
        const imageURI = await uploadMediaToGrove(imageFile)
        const metadata = image({
            ...(content ? {content} : {}),
            attributes: [
                {
                    value: moodType,
                    type: MetadataAttributeType.STRING,
                    key: 'moodType',
                },
                {
                    value: confidence.toString(),
                    type: MetadataAttributeType.NUMBER,
                    key: 'confidence',
                },
                {
                    value: rewardTokenAmount.toString(),
                    type: MetadataAttributeType.NUMBER,
                    key: 'rewardTokenAmount',
                },
            ],
            image: {
                item: imageURI.uri,
                type: imageFile.type as MediaImageMimeType,
            },
        });

        const metadataURI = await uploadMetadataToGrove(metadata);
        const result = await post(sessionClient, {
            contentUri: uri(metadataURI.uri),
            feed: FEED_ADDRESS,
        });
        return !result.isErr();
    } catch (e) {
        console.log('error', e)
    }

    return false
}

export const getGlobalPosts = async (exceptAccountAddress: string): Promise<MoodPostType[]> => {
    try {
        const result = await fetchPosts(lensPublicClient, {
            pageSize: "TEN",
            filter: {
                feeds: [{
                    feed: FEED_ADDRESS as EvmAddress,
                }],
            },
        });

        if (result.isErr()) {
            console.error(result.error)
            return []
        }

        const items = result.value.items
        if (!items)
            return []

        return items.map((item) => getMoodPostDataByRaw(item)).filter(item => item.author.accountAddress !== exceptAccountAddress)
    } catch (e) {
        console.log("error getGlobalPosts", e)
        return [];
    }
}

export const getAccountPosts = async (accountAddress: string): Promise<MoodPostType[]> => {
    try {
        const result = await fetchPosts(lensPublicClient, {
            pageSize: "TEN",
            filter: {
                authors: [accountAddress],
                feeds: [{
                    feed: FEED_ADDRESS as EvmAddress,
                }],
            },
        });

        if (result.isErr()) {
            console.error(result.error)
            return []
        }

        const items = result.value.items
        if (!items)
            return []

        return items.map((item) => getMoodPostDataByRaw(item))
    } catch (e) {
        console.log("error getAccountPosts", e)
        return [];
    }
}
