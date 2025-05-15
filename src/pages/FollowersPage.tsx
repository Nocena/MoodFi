import React, {useState} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Divider,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import {useAuthStore} from '../store/authStore';
import {useSocialStore} from '../store/socialStore';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";

const FollowersPage: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useLensAuth();
  const { user } = useAuthStore();
  const { followUser } = useSocialStore();
  const [activeTab, setActiveTab] = useState(location.hash === '#following' ? 1 : 0);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  // Mock data for followers and following
  const followers = [
    {
      id: 'user-2',
      name: 'Jane Smith',
      username: 'janesmith',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
      isFollowing: true,
    },
    {
      id: 'user-3',
      name: 'Alex Chen',
      username: 'alexchen',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
      isFollowing: false,
    },
  ];

  const following = [
    {
      id: 'user-2',
      name: 'Jane Smith',
      username: 'janesmith',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
      isFollowing: true,
    },
  ];

  const handleFollow = async (userId: string) => {
    try {
      await followUser(userId);
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

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
            <Tab>Followers ({followers.length})</Tab>
            <Tab>Following ({following.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <VStack spacing={0} align="stretch" divider={<Divider />}>
                {followers.map((follower) => (
                  <Box
                    key={follower.id}
                    p={4}
                    _hover={{ bg: hoverBgColor }}
                    transition="background 0.2s"
                  >
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Avatar
                          size="md"
                          src={follower.avatar}
                          name={follower.name}
                        />
                        <Box>
                          <Text fontWeight="medium">{follower.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            @{follower.username}
                          </Text>
                        </Box>
                      </HStack>
                      <Button
                        size="sm"
                        colorScheme="brand"
                        variant={follower.isFollowing ? "outline" : "solid"}
                        onClick={() => handleFollow(follower.id)}
                      >
                        {follower.isFollowing ? "Following" : "Follow"}
                      </Button>
                    </HStack>
                  </Box>
                ))}

                {followers.length === 0 && (
                  <Box p={8} textAlign="center">
                    <Text color="gray.500">No followers yet</Text>
                  </Box>
                )}
              </VStack>
            </TabPanel>

            <TabPanel p={0}>
              <VStack spacing={0} align="stretch" divider={<Divider />}>
                {following.map((followed) => (
                  <Box
                    key={followed.id}
                    p={4}
                    _hover={{ bg: hoverBgColor }}
                    transition="background 0.2s"
                  >
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Avatar
                          size="md"
                          src={followed.avatar}
                          name={followed.name}
                        />
                        <Box>
                          <Text fontWeight="medium">{followed.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            @{followed.username}
                          </Text>
                        </Box>
                      </HStack>
                      <Button
                        size="sm"
                        colorScheme="brand"
                        variant="outline"
                        onClick={() => handleFollow(followed.id)}
                      >
                        Following
                      </Button>
                    </HStack>
                  </Box>
                ))}

                {following.length === 0 && (
                  <Box p={8} textAlign="center">
                    <Text color="gray.500">Not following anyone yet</Text>
                  </Box>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default FollowersPage;