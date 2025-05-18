import React, {useEffect} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {
    Box,
    Button,
    Flex,
    Grid,
    GridItem,
    Heading,
    Icon,
    Skeleton,
    Text,
    useBreakpointValue,
    VStack,
} from '@chakra-ui/react';
import {Camera, Podcast} from 'lucide-react';
import MoodCard from '../components/feed/MoodCard';
import SuggestedUsers from '../components/feed/SuggestedUsers';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";
import {useDailyMoodStore} from "../store/dailyMoodStore.ts";

const HomePage: React.FC = () => {
    const {isAuthenticated, currentAccount, client} = useLensAuth();
    const navigate = useNavigate()
    const {
        globalPosts,
        userPosts,
        todayMoodTaken,
        isLoadingUserPosts,
        isLoadingGlobalPosts,
        refreshGlobalPosts,
        refreshUserPosts,
    } = useDailyMoodStore()

    const columnSpan = useBreakpointValue({base: 12, md: 8, lg: 9});
    const sidebarSpan = useBreakpointValue({base: 12, md: 4, lg: 3});

    useEffect(() => {
        if (currentAccount) {
            refreshGlobalPosts(client, currentAccount.accountAddress)
            refreshUserPosts(client, currentAccount.accountAddress)
        }
    }, [client, currentAccount, refreshGlobalPosts, refreshUserPosts])

    if (!isAuthenticated) {
        return <Navigate to="/login"/>;
    }

    return (
        <Box>
            <Grid templateColumns="repeat(12, 1fr)" gap={4}>
                <GridItem colSpan={columnSpan!}>
                    {isLoadingUserPosts ? (
                        <Flex direction="column" gap={4} mb={4}>
                            <Skeleton height="150px" borderRadius="lg"/>
                        </Flex>
                    ) : (
                        !todayMoodTaken ? (
                            <Box
                                p={6}
                                borderRadius="lg"
                                bg="brand.50"
                                _dark={{bg: 'rgba(88, 28, 255, 0.15)'}}
                                mb={6}
                            >
                                <Heading size="md" mb={2}>
                                    Today's Mood: ??? :)
                                </Heading>
                                <Text mb={4}>
                                    Take a selfie to capture your mood and see if it matches today's challenge!
                                </Text>
                                <Button
                                    as="a"
                                    onClick={() => navigate('/camera')}
                                    leftIcon={<Camera size={18}/>}
                                    colorScheme="brand"
                                    cursor="pointer"
                                >
                                    Take Selfie
                                </Button>
                            </Box>
                        ) : (
                            <Box mb={6}>
                                <Heading size="md" mb={4}>
                                    Your Daily Mood
                                </Heading>
                                {currentAccount && userPosts.length > 0 && (
                                    <MoodCard
                                        user={userPosts[0].author}
                                        moodEntry={userPosts[0]}
                                    />
                                )}
                            </Box>
                        )
                    )}

                    <Box>
                        <Heading size="md" mb={4}>
                            Mood Feed
                        </Heading>

                        {!isLoadingGlobalPosts ? (
                            globalPosts.length > 0 ? (
                                globalPosts.map(post => (
                                    <MoodCard
                                        key={post.id}
                                        user={post.author}
                                        moodEntry={post}
                                    />
                                ))
                            ) : (
                                <VStack py={12} spacing={4} color="gray.500">
                                    <Icon as={Podcast} boxSize={12}/>
                                    <Text fontSize="lg" fontWeight="medium">No feeds yet</Text>
                                </VStack>
                            )
                        ) : (
                            <Flex direction="column" gap={4}>
                                <Skeleton height="300px" borderRadius="lg"/>
                                <Skeleton height="300px" borderRadius="lg"/>
                            </Flex>
                        )}
                    </Box>
                </GridItem>

                <GridItem colSpan={sidebarSpan!}>
                    <SuggestedUsers/>
                </GridItem>
            </Grid>
        </Box>
    )
        ;
};

export default HomePage;