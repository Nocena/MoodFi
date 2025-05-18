import {APP_ADDRESS, FEED_ADDRESS, lensPublicClient} from "../constants";
import {AccountStatusType, AccountType, AuthorWithMood, CommentType, MOOD_TYPE, MoodPostType} from "../types";
import {
    addReaction,
    fetchAccount, fetchAccountRecommendations,
    fetchAccountsAvailable,
    fetchAccountStats,
    fetchFollowers,
    fetchFollowing, fetchPost, fetchPostReferences,
    fetchPosts,
    lastLoggedInAccount,
    post, undoReaction,
} from "@lens-protocol/client/actions";
import {type EvmAddress} from '@lens-protocol/types'
import {image, MediaImageMimeType, MetadataAttributeType, textOnly,} from "@lens-protocol/metadata"
import {uploadMediaToGrove, uploadMetadataToGrove} from "./grove.utils";
import {SessionClient, uri, postId} from "@lens-protocol/client";
import {PostReactionType, PostReferenceType} from "@lens-protocol/graphql";

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
        imageUrl: item?.metadata?.image?.item ?? '',
        moodType,
        confidence,
        rewardTokenAmount,
        commentsCount: item.stats?.comments ?? 0,
        likesCount: item.stats?.upvotes ?? 0,
        timestamp: item.timestamp ?? (new Date()).toString(),
        isLikedByMe: item.operations?.hasUpvoted ?? false,
    }
}

const getMoodCommentDataByRaw = (item: any): CommentType => {
    return {
        id: item.id,
        author: getAccountDataByRaw(item.author),
        timestamp: item.timestamp ?? (new Date()).toString(),
        content: item?.metadata?.content ?? '',
    }
}

export const fetchAvailableLensAccounts = async (sessionClient: SessionClient | null, walletAddress: string): Promise<AccountType[]> => {
    if (!walletAddress) {
        return [];
    }
    const result = await fetchAccountsAvailable(sessionClient ?? sessionClient ?? lensPublicClient, {
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

export const fetchRecommendedAccounts = async (sessionClient: SessionClient | null, accountAddress: string): Promise<AccountType[]> => {
    if (!accountAddress) {
        return [];
    }
    const result = await fetchAccountRecommendations(sessionClient ?? lensPublicClient, {
        account: accountAddress,
        shuffle: true,
    });

    if (result.isErr()) {
        console.error(result.error)
        return []
    }

    const value = result.value
    if (!value)
        return []

    return value.items.slice(0, 5).map((item) => {
        return getAccountDataByRaw(item)
    })
}

export const fetchAccountByUserName = async (sessionClient: SessionClient | null, userName: string): Promise<AccountType | null> => {
    if (!userName) {
        return null;
    }
    const result = await fetchAccount(sessionClient ?? lensPublicClient, {
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

export const getLastLoggedInAccount = async (sessionClient: SessionClient | null, walletAddress: string): Promise<AccountType | null> => {
    if (!walletAddress) {
        return null;
    }

    try {
        const result = await lastLoggedInAccount(sessionClient ?? lensPublicClient, {
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

export const getAccountStats = async (sessionClient: SessionClient | null, accountAddress: string): Promise<AccountStatusType | null> => {
    if (!accountAddress) {
        return null;
    }

    try {
        const result = await fetchAccountStats(sessionClient ?? lensPublicClient, {
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

export const getAccountFollowers = async (sessionClient: SessionClient | null, accountAddress: string): Promise<AccountType[]> => {
    if (!accountAddress) {
        return [];
    }

    try {
        const result = await fetchFollowers(sessionClient ?? lensPublicClient, {
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

export const getAccountFollowings = async (sessionClient: SessionClient | null, accountAddress: string): Promise<AccountType[]> => {
    if (!accountAddress) {
        return [];
    }

    try {
        const result = await fetchFollowing(sessionClient ?? lensPublicClient, {
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

export const commentOnPost = async (
    sessionClient: SessionClient,
    id: string,
    comment: string) => {
    try {
        const metadata = textOnly({
            content: comment,
        });

        const metadataURI = await uploadMetadataToGrove(metadata);
        const result = await post(sessionClient, {
            commentOn: {
                post: postId(id),
            },
            contentUri: uri(metadataURI.uri),
            feed: FEED_ADDRESS,
        });
        return !result.isErr();
    } catch (e) {
        console.log('error', e)
    }

    return false
}

export const addReactionToPost = async (
    sessionClient: SessionClient,
    id: string,
    isLike: boolean) => {
    try {
        let result = null
        if (isLike) {
            result = await addReaction(sessionClient, {
                post: postId(id),
                reaction: PostReactionType.Upvote
            });
        } else {
            result = await undoReaction(sessionClient, {
                post: postId(id),
                reaction: PostReactionType.Upvote
            });
        }
        return !result?.isErr();
    } catch (e) {
        console.log('error', e)
    }

    return false
}

export const getGlobalPosts = async (sessionClient: SessionClient | null, exceptAccountAddress: string): Promise<MoodPostType[]> => {
    try {
        const result = await fetchPosts(sessionClient ?? lensPublicClient, {
            pageSize: "TEN",
            filter: {
                feeds: [{
                    feed: FEED_ADDRESS as EvmAddress,
                }],
                postTypes: ["ROOT"],
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

export const getAccountPosts = async (sessionClient: SessionClient | null, accountAddress: string): Promise<MoodPostType[]> => {
    try {
        const result = await fetchPosts(sessionClient ?? lensPublicClient, {
            pageSize: "TEN",
            filter: {
                authors: [accountAddress],
                feeds: [{
                    feed: FEED_ADDRESS as EvmAddress,
                }],
                postTypes: ["ROOT"],
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

export const getPostByPostId = async (sessionClient: SessionClient | null, id: string): Promise<MoodPostType | null> => {
    try {
        const result = await fetchPost(sessionClient ?? lensPublicClient, {
            post: postId(id),
        });

        if (result.isErr()) {
            console.error(result.error)
            return null
        }

        if (!result.value)
            return null
        return getMoodPostDataByRaw(result.value)
    } catch (e) {
        console.log("error getPostByPostId", e)
        return null;
    }
}

export const getCommentsOfPostByPostId = async (sessionClient: SessionClient | null, id: string): Promise<CommentType[]> => {
    try {
        const result = await fetchPostReferences(sessionClient ?? lensPublicClient, {
            pageSize: 'FIFTY',
            relevancyFilter: 'RELEVANT',
            visibilityFilter: 'VISIBLE',
            referenceTypes: [PostReferenceType.CommentOn],
            referencedPost: postId(id),
        });

        if (result.isErr()) {
            console.error(result.error)
            return []
        }

        const items = result.value.items
        if (!items)
            return []

        return items.map((item) => getMoodCommentDataByRaw(item))
    } catch (e) {
        console.log("error getCommentsOfPostByPostId", e)
        return [];
    }
}

export const getSimilarMoodAccounts = async (sessionClient: SessionClient | null, exceptAccountAddress: string, givenMoodType: MOOD_TYPE | null): Promise<AuthorWithMood[]> => {
    try {
        const result = await fetchPosts(sessionClient ?? lensPublicClient, {
            pageSize: "FIFTY",
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

        const posts = items.map((item) => getMoodPostDataByRaw(item)).filter(item => item.author.accountAddress !== exceptAccountAddress)

        const authorMap = new Map<string, AuthorWithMood>();

        for (const post of posts) {
            const {
                author,
                moodType,
                timestamp,
            } = post;

            const existing = authorMap.get(author.accountAddress);

            // If we’ve never seen this author or this post is newer → update
            if (
                !existing ||
                new Date(timestamp).getTime() > new Date(existing.latestTimestamp).getTime()
            ) {
                authorMap.set(author.accountAddress, {
                    ...author,
                    moodType,
                    latestTimestamp: timestamp,
                });
            }
        }

        // Convert to array and sort
        return Array.from(authorMap.values()).sort((a, b) => {
            const aIsPriority = a.moodType === givenMoodType ? 0 : 1;
            const bIsPriority = b.moodType === givenMoodType ? 0 : 1;

            if (aIsPriority !== bIsPriority) {
                return aIsPriority - bIsPriority;           // 0 before 1 → priority first
            }
            // tie‑breaker: newest author first
            return new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime();
        });

    } catch (e) {
        console.log("error getSimilarMoodAccounts", e)
        return [];
    }
}
