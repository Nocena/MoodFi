import React, {useEffect} from 'react';
import {Navigate} from 'react-router-dom';
import {Box, Button, Flex, Grid, GridItem, Heading, Skeleton, Text, useBreakpointValue,} from '@chakra-ui/react';
import {Camera} from 'lucide-react';
import {useAuthStore} from '../store/authStore';
import {useMoodStore} from '../store/moodStore';
import MoodCard from '../components/feed/MoodCard';
import SuggestedUsers from '../components/feed/SuggestedUsers';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";

const HomePage: React.FC = () => {
  const { isAuthenticated } = useLensAuth();
  const { user } = useAuthStore();
  const { 
    dailyMood, 
    getDailyMood, 
    todaysMoodTaken, 
    userMoods,
    suggestedUsers,
    getSuggestedUsers,
  } = useMoodStore();
  
  const columnSpan = useBreakpointValue({ base: 12, md: 8, lg: 9 });
  const sidebarSpan = useBreakpointValue({ base: 12, md: 4, lg: 3 });
  
  useEffect(() => {
    if (isAuthenticated) {
      getDailyMood();
      if (todaysMoodTaken) {
        getSuggestedUsers();
      }
    }
  }, [isAuthenticated, todaysMoodTaken]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Box>
      <Grid templateColumns="repeat(12, 1fr)" gap={4}>
        <GridItem colSpan={columnSpan!}>
          {!todaysMoodTaken ? (
            <Box
              p={6}
              borderRadius="lg"
              bg="brand.50"
              _dark={{ bg: 'rgba(88, 28, 255, 0.15)' }}
              mb={6}
            >
              <Heading size="md" mb={2}>
                {dailyMood ? `Today's Mood: ${dailyMood.mood.toUpperCase()}` : 'Loading today\'s mood...'}
              </Heading>
              <Text mb={4}>
                Take a selfie to capture your mood and see if it matches today's challenge!
              </Text>
              <Button
                as="a"
                href="/camera"
                leftIcon={<Camera size={18} />}
                colorScheme="brand"
              >
                Take Selfie
              </Button>
            </Box>
          ) : (
            <Box mb={6}>
              <Heading size="md" mb={4}>
                Your Daily Mood
              </Heading>
              {user && userMoods.length > 0 && (
                <MoodCard
                  user={user}
                  moodEntry={userMoods[0]}
                  isCurrentUser={true}
                />
              )}
            </Box>
          )}
          
          <Box>
            <Heading size="md" mb={4}>
              Mood Feed
            </Heading>
            
            {todaysMoodTaken && suggestedUsers.length > 0 ? (
              suggestedUsers.map(user => (
                user.moodHistory.length > 0 && (
                  <MoodCard
                    key={user.id}
                    user={user}
                    moodEntry={user.moodHistory[0]}
                  />
                )
              ))
            ) : (
              <Flex direction="column" gap={4}>
                <Skeleton height="300px" borderRadius="lg" />
                <Skeleton height="300px" borderRadius="lg" />
              </Flex>
            )}
          </Box>
        </GridItem>
        
        <GridItem colSpan={sidebarSpan!}>
          {todaysMoodTaken && suggestedUsers.length > 0 && (
            <SuggestedUsers users={suggestedUsers} />
          )}
        </GridItem>
      </Grid>
    </Box>
  );
};

export default HomePage;