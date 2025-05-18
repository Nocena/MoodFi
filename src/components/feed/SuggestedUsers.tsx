import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Avatar,
    Badge,
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Skeleton,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import {getMoodColor} from "../../utils/common.utils";
import {useDailyMoodStore} from "../../store/dailyMoodStore";
import {useLensAuth} from "../../providers/LensAuthProvider";
import {follow, unfollow} from "@lens-protocol/client/actions";

const SuggestedUsers: React.FC = () => {
    const {currentAccount, client} = useLensAuth();
    const navigate = useNavigate()
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [statusMap, setStatusMap] = useState<Record<string, boolean>>({}); // id -> true = 'followed' | 'unfollowed' | 'error'

    const {
        isLoadingRecommendAccounts,
        recommendAccounts,
        refreshRecommendAccounts,
        isLoadingSimilarAccounts,
        similarMoodAccounts,
        refreshSimilarAccounts,
    } = useDailyMoodStore()

    useEffect(() => {
        if (currentAccount) {
            setStatusMap({})
            refreshRecommendAccounts(client, currentAccount.accountAddress)
            refreshSimilarAccounts(client, currentAccount.accountAddress, null)
        }
    }, [client, currentAccount, refreshRecommendAccounts, refreshSimilarAccounts])


    useEffect(() => {
        const newStatusMap:Record<string, boolean> = {}
        recommendAccounts.map(account => newStatusMap[account.accountAddress] = account.isFollowedByMe ?? false)
        similarMoodAccounts.map(account => newStatusMap[account.accountAddress] = account.isFollowedByMe ?? false)
        setStatusMap(newStatusMap)
    }, [recommendAccounts, similarMoodAccounts])

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

    return (
        <VStack spacing={4}>
            <Box
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                width="100%"
                boxShadow="sm"
            >
                <Box p={4} bg={useColorModeValue('brand.50', 'rgba(88, 28, 255, 0.15)')}>
                    <Text fontSize="lg" fontWeight="bold">
                        Same Mood Friends
                    </Text>
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                        People who are sharing your mood today
                    </Text>
                </Box>

                {
                    isLoadingSimilarAccounts ? (
                        <Flex margin="2" direction="column" gap={4}>
                            <Skeleton height="60px" borderRadius="lg"/>
                        </Flex>
                    ) : (
                        <VStack spacing={0} divider={<Divider/>}>

                            {similarMoodAccounts.map((user) => (
                                <Flex
                                    key={user.accountAddress}
                                    p={4}
                                    w="100%"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <HStack>
                                        <Avatar size="md" src={user.avatar} name={user.displayName}/>
                                        <VStack spacing={0} alignItems="flex-start">
                                            <Text fontWeight="medium">{user.displayName}</Text>
                                            <Text
                                                cursor="pointer"
                                                fontSize="sm"
                                                color="gray.500"
                                                className="username-ellipsis"
                                                onClick={() => navigate(`/profile/${user.localName}`)}
                                                _hover={{color: 'gray.700'}}>@{user.localName}</Text>
                                            <Badge
                                                colorScheme={getMoodColor(user.moodType)}
                                                mt={1}
                                                size="sm"
                                            >
                                                {user.moodType.toUpperCase()}
                                            </Badge>
                                        </VStack>
                                    </HStack>

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
                            ))}

                            {similarMoodAccounts.length === 0 && (
                                <Box p={4} textAlign="center">
                                    <Text color="gray.500">No similar users found</Text>
                                </Box>
                            )}
                        </VStack>
                    )
                }
            </Box>

            <Box
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="sm"
                width="100%"
            >
                <Box p={4} bg={useColorModeValue('brand.50', 'rgba(88, 28, 255, 0.15)')}>
                    <Text fontSize="lg" fontWeight="bold">
                        Recommended Users
                    </Text>
                </Box>

                {
                    isLoadingRecommendAccounts ? (
                        <Flex margin="2" direction="column" gap={4}>
                            <Skeleton height="60px" borderRadius="lg"/>
                            <Skeleton height="60px" borderRadius="lg"/>
                        </Flex>
                    ) : (
                        <VStack spacing={0} divider={<Divider/>}>

                            {recommendAccounts.map((user) => (
                                <Flex
                                    key={user.accountAddress}
                                    p={4}
                                    w="100%"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <HStack>
                                        <Avatar size="md" src={user.avatar} name={user.displayName}/>
                                        <VStack spacing={0} alignItems="flex-start">
                                            <Text fontWeight="medium">{user.displayName}</Text>
                                            <Text
                                                cursor="pointer"
                                                fontSize="sm"
                                                color="gray.500"
                                                className="username-ellipsis"
                                                onClick={() => navigate(`/profile/${user.localName}`)}
                                                _hover={{color: 'gray.700'}}>@{user.localName}</Text>
                                        </VStack>
                                    </HStack>

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
                            ))}

                            {recommendAccounts.length === 0 && (
                                <Box p={4} textAlign="center">
                                    <Text color="gray.500">No recommended users found</Text>
                                </Box>
                            )}
                        </VStack>
                    )
                }
            </Box>
            {/*
          <Box
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              overflow="hidden"
              boxShadow="sm"
          >
            <Box p={4} bg={useColorModeValue('brand.50', 'rgba(88, 28, 255, 0.15)')}>
              <Text fontSize="lg" fontWeight="bold">
                Same Mood Friends
              </Text>
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                People who are sharing your mood today
              </Text>
            </Box>

            <VStack spacing={0} divider={<Divider/>}>
              {users.map((user) => (
                  <Flex
                      key={user.id}
                      p={4}
                      w="100%"
                      justifyContent="space-between"
                      alignItems="center"
                  >
                    <HStack>
                      <Avatar size="md" src={user.avatar} name={user.name}/>
                      <VStack spacing={0} alignItems="flex-start">
                        <Text fontWeight="medium">{user.name}</Text>
                        <Text fontSize="sm" color="gray.500">@{user.username}</Text>
                        <Badge
                            colorScheme={getMoodColor(user.moodHistory[0]?.mood)}
                            mt={1}
                            size="sm"
                        >
                          {user.moodHistory[0]?.mood.toUpperCase()}
                        </Badge>
                      </VStack>
                    </HStack>

                    <Button
                        size="sm"
                        colorScheme="brand"
                        variant="outline"
                        onClick={() => handleFollow(user.id)}
                    >
                      Follow
                    </Button>
                  </Flex>
              ))}

              {users.length === 0 && (
                  <Box p={4} textAlign="center">
                    <Text color="gray.500">No matching users found</Text>
                  </Box>
              )}
            </VStack>
          </Box>
*/}

        </VStack>
    );
};


export default SuggestedUsers;