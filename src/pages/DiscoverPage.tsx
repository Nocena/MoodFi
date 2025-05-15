import React, {useEffect} from 'react';
import {Navigate} from 'react-router-dom';
import {Avatar, Badge, Box, Button, Flex, Heading, SimpleGrid, Text, useColorModeValue,} from '@chakra-ui/react';
import {useMoodStore} from '../store/moodStore';
import {useSocialStore} from '../store/socialStore';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";

const DiscoverPage: React.FC = () => {
  const { isAuthenticated } = useLensAuth();
  const { dailyMood, getSuggestedUsers, suggestedUsers } = useMoodStore();
  const { followUser } = useSocialStore();

  // Move all useColorModeValue hooks to the top level
  const brandBg = useColorModeValue('brand.50', 'rgba(88, 28, 255, 0.15)');
  const cardBg = useColorModeValue('white', 'gray.800');
  const emptyStateBg = useColorModeValue('gray.50', 'gray.700');
  const darkTextColor = useColorModeValue('gray.600', 'gray.300');
  const bioDarkTextColor = useColorModeValue('gray.600', 'gray.400');
  
  useEffect(() => {
    if (isAuthenticated) {
      getSuggestedUsers();
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Helper function to get mood color
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return 'yellow';
      case 'sad': return 'blue';
      case 'excited': return 'pink';
      case 'calm': return 'green';
      default: return 'gray';
    }
  };
  
  const handleFollow = async (userId: string) => {
    try {
      await followUser(userId);
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };
  
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
          Today's Mood: {dailyMood?.mood.toUpperCase()}
        </Heading>
        <Text>
          Connect with others who share the same mood as you today!
        </Text>
      </Box>
      
      <Box mb={8}>
        <Heading size="md" mb={4}>
          People with Matching Moods
        </Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {suggestedUsers.map(user => (
            <Box
              key={user.id}
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
                  name={user.name}
                  mb={4}
                />
                <Heading size="md">{user.name}</Heading>
                <Text color="gray.500" mb={2}>@{user.username}</Text>
                
                {user.moodHistory.length > 0 && (
                  <Badge
                    colorScheme={getMoodColor(user.moodHistory[0].mood)}
                    mb={4}
                  >
                    {user.moodHistory[0].mood.toUpperCase()}
                  </Badge>
                )}
                
                <Text fontSize="sm" color={bioDarkTextColor} mb={4} noOfLines={2}>
                  {user.bio}
                </Text>
                
                <Button
                  colorScheme="brand"
                  variant="outline"
                  size="sm"
                  width="full"
                  onClick={() => handleFollow(user.id)}
                >
                  Follow
                </Button>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
        
        {suggestedUsers.length === 0 && (
          <Box
            p={6}
            borderRadius="lg"
            bg={emptyStateBg}
            textAlign="center"
          >
            <Text>No matching users found. Check back later!</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DiscoverPage;