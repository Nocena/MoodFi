import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Box,
    Flex,
    Text,
    Avatar,
    Button,
    useColorModeValue,
    VStack,
    HStack,
    Badge,
    Divider, Skeleton,
} from '@chakra-ui/react';
import {useSocialStore} from '../../store/socialStore';
import {getMoodColor} from "../../utils/common.utils.ts";
import {useDailyMoodStore} from "../../store/dailyMoodStore.ts";
import {useLensAuth} from "../../providers/LensAuthProvider.tsx";

const SuggestedUsers: React.FC = () => {
    const {currentAccount} = useLensAuth();
    const {followUser} = useSocialStore()
    const navigate = useNavigate()
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

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
            refreshRecommendAccounts(currentAccount.accountAddress)
            refreshSimilarAccounts(currentAccount.accountAddress, null)
        }
    }, [currentAccount, refreshRecommendAccounts, refreshSimilarAccounts])


    const handleFollow = async (userId: string) => {
        try {
            await followUser(userId);
        } catch (error) {
            console.error('Failed to follow user:', error);
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
                                        variant="outline"
                                        onClick={() => handleFollow(user.accountAddress)}
                                    >
                                        Follow
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
                                        variant="outline"
                                        onClick={() => handleFollow(user.accountAddress)}
                                    >
                                        Follow
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