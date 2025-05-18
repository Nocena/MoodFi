import React, {useEffect, useState} from 'react';
import {Navigate} from 'react-router-dom';
import {
    Avatar,
    Badge,
    Box,
    Button,
    Flex,
    Heading, Icon,
    SimpleGrid,
    Skeleton,
    Text,
    useColorModeValue, VStack,
} from '@chakra-ui/react';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";
import {getMoodColor} from "../utils/common.utils.ts";
import {useDailyMoodStore} from "../store/dailyMoodStore.ts";
import {follow, unfollow} from "@lens-protocol/client/actions";
import {Users} from "lucide-react";

const DiscoverPage: React.FC = () => {
    const {isAuthenticated, currentAccount, client} = useLensAuth();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [statusMap, setStatusMap] = useState<Record<string, boolean>>({}); // id -> true = 'followed' | 'unfollowed' | 'error'

    const {
        todayMood,
        isLoadingSimilarAccounts,
        similarMoodAccounts,
        refreshSimilarAccounts,
    } = useDailyMoodStore()

    useEffect(() => {
        if (currentAccount) {
            setStatusMap({})
            refreshSimilarAccounts(client, currentAccount.accountAddress, null)
        }
    }, [client, currentAccount, refreshSimilarAccounts])

    useEffect(() => {
        const newStatusMap: Record<string, boolean> = {}
        similarMoodAccounts.map(account => newStatusMap[account.accountAddress] = account.isFollowedByMe ?? false)
        setStatusMap(newStatusMap)
    }, [similarMoodAccounts])


    const handleFollowToggle = async (accountAddress: string) => {
        setLoadingId(accountAddress);

        try {
            const isFollowing = statusMap[accountAddress];

            // Do your async action (API call etc.)
            if (isFollowing) {
                await unfollow(client!, {
                    account: accountAddress,
                })
                setStatusMap((prev) => ({...prev, [accountAddress]: false}));
            } else {
                await follow(client!, {
                    account: accountAddress,
                })
                setStatusMap((prev) => ({...prev, [accountAddress]: true}));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingId(null);
        }
    };


    // Move all useColorModeValue hooks to the top level
    const brandBg = useColorModeValue('brand.50', 'rgba(88, 28, 255, 0.15)');
    const cardBg = useColorModeValue('white', 'gray.800');
    const darkTextColor = useColorModeValue('gray.600', 'gray.300');
    const bioDarkTextColor = useColorModeValue('gray.600', 'gray.400');

    if (!isAuthenticated) {
        return <Navigate to="/login"/>;
    }

    return (
        <Box>
            <Box mb={8}>
                <Heading mb={2}>Discover</Heading>
                <Text color={darkTextColor}>
                    Find people who share your mood today
                </Text>
            </Box>

            <Box
                p={6}
                borderRadius="lg"
                bg={brandBg}
                mb={8}
            >
                <Heading size="md" mb={2}>
                    Today's Mood: {(todayMood ?? '???').toUpperCase()}
                </Heading>
                <Text>
                    Connect with others who share the same mood as you today!
                </Text>
            </Box>

            <Box mb={8}>
                <Heading size="md" mb={4}>
                    People with Matching Moods
                </Heading>

                {
                    isLoadingSimilarAccounts ? (
                        <SimpleGrid columns={{base: 1, md: 2, lg: 3}} spacing={4}>
                            <Skeleton height="240px" width={["90vw", "25vw"]} borderRadius="lg"/>
                            <Skeleton height="240px" width={["90vw", "25vw"]} borderRadius="lg"/>
                            <Skeleton height="240px" width={["90vw", "25vw"]} borderRadius="lg"/>
                        </SimpleGrid>
                    ) : (
                        similarMoodAccounts.length > 0 ? (
                            <SimpleGrid columns={{base: 1, md: 2, lg: 3}} spacing={4}>
                                {
                                    similarMoodAccounts.map(user => (
                                        <Box
                                            key={user.accountAddress}
                                            p={4}
                                            borderRadius="lg"
                                            bg={cardBg}
                                            boxShadow="sm"
                                            transition="transform 0.2s"
                                            _hover={{
                                                transform: 'translateY(-2px)',
                                                boxShadow: 'md',
                                            }}
                                        >
                                            <Flex direction="column" align="center" textAlign="center">
                                                <Avatar
                                                    size="xl"
                                                    src={user.avatar}
                                                    name={user.displayName}
                                                    mb={4}
                                                />
                                                <Heading size="md">{user.displayName}</Heading>
                                                <Text color="gray.500" mb={2}>@{user.localName}</Text>

                                                <Badge
                                                    colorScheme={getMoodColor(user.moodType)}
                                                    mb={4}
                                                >
                                                    {user.moodType?.toUpperCase()}
                                                </Badge>

                                                <Text fontSize="sm" color={bioDarkTextColor} mb={4} noOfLines={2}>
                                                    {user.bio}
                                                </Text>

                                                <Button
                                                    size="sm"
                                                    colorScheme="brand"
                                                    variant={statusMap[user.accountAddress] ? "solid" : "outline"}
                                                    isLoading={loadingId === user.accountAddress}
                                                    onClick={() => handleFollowToggle(user.accountAddress)}
                                                >
                                                    {statusMap[user.accountAddress] ? 'Following' : 'Follow'}
                                                </Button>
                                            </Flex>
                                        </Box>
                                    ))
                                }
                            </SimpleGrid>
                        ) : (
                            <VStack py={12} spacing={4} color="gray.500">
                                <Icon as={Users} boxSize={12}/>
                                <Text fontSize="lg" fontWeight="medium">No matching users found. Check back
                                    later!</Text>
                            </VStack>
                        )
                    )
                }
            </Box>
        </Box>
    )
        ;
};

export default DiscoverPage;