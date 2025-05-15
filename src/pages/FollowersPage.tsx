import React, {useState} from 'react';
import {Link as RouterLink, Navigate, useLocation} from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import {useSocialStore} from '../store/socialStore';
import {UserPlus, Users} from 'lucide-react';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";

const FollowersPage: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useLensAuth();
  const { followUser } = useSocialStore();
  const [activeTab, setActiveTab] = useState(location.hash === '#following' ? 1 : 0);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const emptyStateBg = useColorModeValue('gray.50', 'gray.700');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Mock data for followers and following
  const followers = [
    /*     {
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
        }, */
  ];

  const following = [
    /*     {
          id: 'user-2',
          name: 'Jane Smith',
          username: 'janesmith',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
          isFollowing: true,
        },
     */  ];

  const handleFollow = async (userId: string) => {
    try {
      await followUser(userId);
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const EmptyFollowers = () => (
      <VStack py={12} spacing={4} color="gray.500">
        <Icon as={Users} boxSize={12} />
        <Text fontSize="lg" fontWeight="medium">No followers yet</Text>
        <Text textAlign="center">
          When someone follows you, they'll show up here. Share your moods to attract followers!
        </Text>
        <Button
            as={RouterLink}
            to="/discover"
            leftIcon={<UserPlus size={18} />}
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
        <Icon as={UserPlus} boxSize={12} />
        <Text fontSize="lg" fontWeight="medium">Not following anyone yet</Text>
        <Text textAlign="center">
          Follow people to see their daily moods and connect with them!
        </Text>
        <Button
            as={RouterLink}
            to="/discover"
            leftIcon={<UserPlus size={18} />}
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
              <Tab>Followers ({followers.length})</Tab>
              <Tab>Following ({following.length})</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                {followers.length > 0 ? (
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
                                    as={RouterLink}
                                    to={`/profile/${follower.username}`}
                                />
                                <Box>
                                  <Text fontWeight="medium">{follower.name}</Text>
                                  <Text
                                      fontSize="sm"
                                      color="gray.500"
                                      as={RouterLink}
                                      to={`/profile/${follower.username}`}
                                      _hover={{ color: 'brand.500', textDecoration: 'underline' }}
                                  >
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
                    </VStack>
                ) : (
                    <Box bg={emptyStateBg}>
                      <EmptyFollowers />
                    </Box>
                )}
              </TabPanel>

              <TabPanel p={0}>
                {following.length > 0 ? (
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
                                    as={RouterLink}
                                    to={`/profile/${followed.username}`}
                                />
                                <Box>
                                  <Text fontWeight="medium">{followed.name}</Text>
                                  <Text
                                      fontSize="sm"
                                      color="gray.500"
                                      as={RouterLink}
                                      to={`/profile/${followed.username}`}
                                      _hover={{ color: 'brand.500', textDecoration: 'underline' }}
                                  >
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
                    </VStack>
                ) : (
                    <Box bg={emptyStateBg}>
                      <EmptyFollowing />
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