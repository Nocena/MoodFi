import React, {useEffect, useState} from 'react';
import {Link as RouterLink, Navigate, useLocation, useParams} from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Divider,
    HStack,
    Icon,
    Skeleton,
    SkeletonCircle,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import {UserPlus, Users} from 'lucide-react';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";
import {fetchAccountByUserName, getAccountFollowers, getAccountFollowings} from "../utils/lens.utils.ts";
import {AccountType} from "../types";
import {follow, unfollow} from "@lens-protocol/client/actions";

const FollowersPage: React.FC = () => {
    const {name} = useParams();
    const userName = name as string
    const location = useLocation();
    const {isAuthenticated, client} = useLensAuth();
    const [activeTab, setActiveTab] = useState(location.hash === '#following' ? 1 : 0);
    const [isLoading, setIsLoading] = useState(true);
    const [followers, setFollowers] = useState<AccountType[]>([]);
    const [followings, setFollowings] = useState<AccountType[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [statusMap, setStatusMap] = useState<Record<string, boolean>>({}); // id -> true = 'followed' | 'unfollowed' | 'error'

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
    const emptyStateBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        (async () => {
            try {
                const selectedAccount = await fetchAccountByUserName(client, userName)
                if (!selectedAccount)
                    throw new Error('empty profile')

                const followerAccounts = await getAccountFollowers(client, selectedAccount.accountAddress)
                const followingAccounts = await getAccountFollowings(client, selectedAccount.accountAddress)
                setFollowers(followerAccounts)
                setFollowings(followingAccounts)

                const newStatusMap:Record<string, boolean> = {}
                followerAccounts.map(account => newStatusMap[account.accountAddress] = account.isFollowedByMe ?? false)
                followingAccounts.map(account => newStatusMap[account.accountAddress] = account.isFollowedByMe ?? false)
                setStatusMap(newStatusMap)

            } catch (e) {
                console.log("error", e)
            } finally {
                setIsLoading(false)
            }
        })()
    }, [])

    if (!isAuthenticated) {
        return <Navigate to="/login"/>;
    }

    const handleFollowToggle = async (accountAddress: string) => {
        setLoadingId(accountAddress);

        try {
            const isFollowing = statusMap[accountAddress];

            // Do your async action (API call etc.)
            if (isFollowing) {
                await unfollow(client!, {
                    account: accountAddress,
                })
                setStatusMap((prev) => ({ ...prev, [accountAddress]: false }));
            } else {
                await follow(client!, {
                    account: accountAddress,
                })
                setStatusMap((prev) => ({ ...prev, [accountAddress]: true }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingId(null);
        }
    };

    const LoadingSkeleton = () => (
        <VStack spacing={0} align="stretch" divider={<Divider/>}>
            {[1, 2, 3].map((index) => (
                <Box key={index} p={4}>
                    <HStack justify="space-between">
                        <HStack spacing={3}>
                            <SkeletonCircle size="12"/>
                            <Box flex="1">
                                <Skeleton height="20px" width="120px" mb={2}/>
                                <Skeleton height="16px" width="100px"/>
                            </Box>
                        </HStack>
                        <Skeleton height="32px" width="80px" borderRadius="md"/>
                    </HStack>
                </Box>
            ))}
        </VStack>
    );

    const EmptyFollowers = () => (
        <VStack py={12} spacing={4} color="gray.500">
            <Icon as={Users} boxSize={12}/>
            <Text fontSize="lg" fontWeight="medium">No followers yet</Text>
            <Text textAlign="center">
                When someone follows you, they'll show up here. Share your moods to attract followers!
            </Text>
            <Button
                as={RouterLink}
                to="/discover"
                leftIcon={<UserPlus size={18}/>}
                colorScheme="brand"
                size="lg"
                mt={4}
            >
                Find People to Connect
            </Button>
        </VStack>
    );

    const EmptyFollowing = () => (
        <VStack py={12} spacing={4} color="gray.500">
            <Icon as={UserPlus} boxSize={12}/>
            <Text fontSize="lg" fontWeight="medium">Not following anyone yet</Text>
            <Text textAlign="center">
                Follow people to see their daily moods and connect with them!
            </Text>
            <Button
                as={RouterLink}
                to="/discover"
                leftIcon={<UserPlus size={18}/>}
                colorScheme="brand"
                size="lg"
                mt={4}
            >
                Discover People
            </Button>
        </VStack>
    );

    return (
        <Box>
            <Box
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
            >
                <Tabs
                    isFitted
                    variant="enclosed"
                    index={activeTab}
                    onChange={(index) => setActiveTab(index)}
                >
                    <TabList>
                        <Tab>
                            {isLoading ? (
                                <Skeleton height="20px" width="100px"/>
                            ) : (
                                `Followers (${followers.length})`
                            )}
                        </Tab>
                        <Tab>
                            {isLoading ? (
                                <Skeleton height="20px" width="100px"/>
                            ) : (
                                `Following (${followings.length})`
                            )}
                        </Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel p={0}>
                            {isLoading ? (
                                <LoadingSkeleton/>
                            ) : followers.length > 0 ? (
                                <VStack spacing={0} align="stretch" divider={<Divider/>}>
                                    {followers.map((follower) => (
                                        <Box
                                            key={follower.accountAddress}
                                            p={4}
                                            _hover={{bg: hoverBgColor}}
                                            transition="background 0.2s"
                                        >
                                            <HStack justify="space-between">
                                                <HStack spacing={3}>
                                                    <Avatar
                                                        size="md"
                                                        src={follower.avatar}
                                                        name={follower.displayName}
                                                        as={RouterLink}
                                                        to={`/profile/${follower.localName}`}
                                                    />
                                                    <Box>
                                                        <Text fontWeight="medium">{follower.displayName}</Text>
                                                        <Text
                                                            fontSize="sm"
                                                            color="gray.500"
                                                            as={RouterLink}
                                                            to={`/profile/${follower.localName}`}
                                                            _hover={{color: 'brand.500', textDecoration: 'underline'}}
                                                        >
                                                            @{follower.localName}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                                <Button
                                                    size="sm"
                                                    colorScheme="brand"
                                                    variant={statusMap[follower.accountAddress] ? "solid" : "outline"}
                                                    isLoading={loadingId === follower.accountAddress}
                                                    onClick={() => handleFollowToggle(follower.accountAddress)}
                                                >
                                                    {statusMap[follower.accountAddress] ? 'Following' : 'Follow'}
                                                </Button>
                                            </HStack>
                                        </Box>
                                    ))}
                                </VStack>
                            ) : (
                                <Box bg={emptyStateBg}>
                                    <EmptyFollowers/>
                                </Box>
                            )}
                        </TabPanel>

                        <TabPanel p={0}>
                            {isLoading ? (
                                <LoadingSkeleton/>
                            ) : followings.length > 0 ? (
                                <VStack spacing={0} align="stretch" divider={<Divider/>}>
                                    {followings.map((followed) => (
                                        <Box
                                            key={followed.accountAddress}
                                            p={4}
                                            _hover={{bg: hoverBgColor}}
                                            transition="background 0.2s"
                                        >
                                            <HStack justify="space-between">
                                                <HStack spacing={3}>
                                                    <Avatar
                                                        size="md"
                                                        src={followed.avatar}
                                                        name={followed.displayName}
                                                        as={RouterLink}
                                                        to={`/profile/${followed.localName}`}
                                                    />
                                                    <Box>
                                                        <Text fontWeight="medium">{followed.displayName}</Text>
                                                        <Text
                                                            fontSize="sm"
                                                            color="gray.500"
                                                            as={RouterLink}
                                                            to={`/profile/${followed.localName}`}
                                                            _hover={{color: 'brand.500', textDecoration: 'underline'}}
                                                        >
                                                            @{followed.localName}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                                <Button
                                                    size="sm"
                                                    colorScheme="brand"
                                                    variant={"outline"}
                                                >
                                                    Following
                                                </Button>
                                            </HStack>
                                        </Box>
                                    ))}
                                </VStack>
                            ) : (
                                <Box bg={emptyStateBg}>
                                    <EmptyFollowing/>
                                </Box>
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Box>
    );
};

export default FollowersPage;