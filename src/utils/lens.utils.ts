import {APP_ADDRESS, lensPublicClient} from "../constants";
import {AccountStatusType, AccountType} from "../types";
import {
    fetchAccount,
    fetchAccountsAvailable,
    fetchAccountStats,
    lastLoggedInAccount,
    fetchFollowing,
    fetchFollowers,
} from "@lens-protocol/client/actions";

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
        return {
            accountAddress: item.account.address,
            createdAt: item.account.createdAt,
            avatar: item.account.metadata?.picture ?? '',
            displayName: item.account.metadata?.name ?? '',
            localName: item!.account.username?.localName ?? '',
            bio: item.account.metadata?.bio ?? '',
        }
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

    return {
        accountAddress: item!.address,
        createdAt: item!.createdAt,
        avatar: item!.metadata?.picture ?? '',
        displayName: item!.metadata?.name ?? '',
        localName: item!.username?.localName ?? '',
        bio: item!.metadata?.bio ?? '',
        isFollowedByMe: item!.operations?.isFollowedByMe ?? false,
    }
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

        return {
            accountAddress: item!.address,
            createdAt: item!.createdAt,
            avatar: item!.metadata?.picture ?? '',
            displayName: item!.metadata?.name ?? '',
            localName: item!.username?.localName ?? '',
            bio: item!.metadata?.bio ?? '',
        }
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
            return {
                accountAddress: item.follower.address,
                createdAt: item.follower.createdAt,
                avatar: item.follower.metadata?.picture ?? '',
                displayName: item.follower.metadata?.name ?? '',
                bio: item.follower.metadata?.bio ?? '',
                localName: item.follower.username?.localName ?? '',
                isFollowedByMe: item.follower.operations?.isFollowedByMe ?? false,
            }
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
            return {
                accountAddress: item.following.address,
                createdAt: item.following.createdAt,
                avatar: item.following.metadata?.picture ?? '',
                displayName: item.following.metadata?.name ?? '',
                bio: item.following.metadata?.bio ?? '',
                localName: item.following.username?.localName ?? '',
                isFollowedByMe: item.following.operations?.isFollowedByMe ?? false,
            }
        })
    } catch (e) {
        console.log("error getAccountFollowers", e)
        return [];
    }
}
