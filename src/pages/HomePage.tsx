import React, {useEffect} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {Box, Button, Flex, Grid, GridItem, Heading, Skeleton, Text, useBreakpointValue,} from '@chakra-ui/react';
import {Camera} from 'lucide-react';
import MoodCard from '../components/feed/MoodCard';
import SuggestedUsers from '../components/feed/SuggestedUsers';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";
import {getGlobalPosts} from "../utils/lens.utils.ts";
import {useDailyMoodStore, useTodayMoodTaken} from "../store/dailyMoodStore.ts";

const HomePage: React.FC = () => {
    const {isAuthenticated, currentAccount} = useLensAuth();
    const navigate = useNavigate()
    const todayMoodTaken = useTodayMoodTaken()
    const {
        moodData,
        globalPosts,
        userPosts,
        refreshGlobalPosts,
        refreshUserPosts,
    } = useDailyMoodStore()

    const columnSpan = useBreakpointValue({base: 12, md: 8, lg: 9});

    useEffect(() => {
        if (currentAccount) {
            refreshGlobalPosts('')
            refreshUserPosts(currentAccount.accountAddress)
        }
    }, [currentAccount])


    if (!isAuthenticated) {
        return <Navigate to="/login"/>;
    }

    return (
        <Box>
            <Grid templateColumns="repeat(12, 1fr)" gap={4}>
                <GridItem colSpan={columnSpan!}>
                    {!todayMoodTaken ? (
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
                    )}

                    <Box>
                        <Heading size="md" mb={4}>
                            Mood Feed
                        </Heading>

                        {globalPosts.length > 0 ? (
                            globalPosts.map(post => (
                                <MoodCard
                                    key={post.id}
                                    user={post.author}
                                    moodEntry={post}
                                />
                            ))
                        ) : (
                            <Flex direction="column" gap={4}>
                                <Skeleton height="300px" borderRadius="lg"/>
                                <Skeleton height="300px" borderRadius="lg"/>
                            </Flex>
                        )}
                    </Box>
                </GridItem>

{/*
                <GridItem colSpan={sidebarSpan!}>
                    {todayMoodTaken && suggestedUsers.length > 0 && (
                        <SuggestedUsers users={suggestedUsers}/>
                    )}
                </GridItem>
*/}
            </Grid>
        </Box>
    )
        ;
};

export default HomePage;