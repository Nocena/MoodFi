import React, {useEffect} from 'react';
import {Navigate} from 'react-router-dom';
import {Avatar, Box, Divider, Flex, Heading, Text, useColorModeValue, VStack,} from '@chakra-ui/react';
import {Award, Bell, Heart, MessageCircle, UserPlus} from 'lucide-react';
import {useSocialStore} from '../store/socialStore';
import {Notification} from '../types';
import {useLensAuth} from "../providers/LensAuthProvider";

const NotificationsPage: React.FC = () => {
  const { isAuthenticated } = useLensAuth();
  const { markNotificationsAsRead } = useSocialStore();
  
  // Mock notifications
  const notifications: Notification[] = [
    {
      id: 'notif-1',
      type: 'follow',
      userId: 'user-2',
      text: 'Jane Smith started following you',
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      read: false,
    },
    {
      id: 'notif-2',
      type: 'comment',
      userId: 'user-2',
      targetId: new Date(Date.now() - 86400000).toISOString(),
      text: 'Jane Smith commented on your mood',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      read: false,
    },
    {
      id: 'notif-3',
      type: 'reward',
      userId: 'system',
      text: 'You earned a reward for matching today\'s mood!',
      timestamp: new Date(Date.now() - 20 * 3600000).toISOString(),
      read: true,
    },
    {
      id: 'notif-4',
      type: 'match',
      userId: 'system',
      text: 'You matched with 5 people who have the same mood today',
      timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
      read: false,
    },
    {
      id: 'notif-5',
      type: 'like',
      userId: 'user-3',
      targetId: new Date(Date.now() - 86400000).toISOString(),
      text: 'Alex Chen liked your mood',
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
      read: false,
    },
  ];
  
  useEffect(() => {
    if (isAuthenticated) {
      // Mark notifications as read when the page is visited
      markNotificationsAsRead();
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  };
  
  // Function to get user avatar
  const getUserAvatar = (userId: string) => {
    if (userId === 'user-2') {
      return 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600';
    } else if (userId === 'user-3') {
      return 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600';
    } else if (userId === 'system') {
      return '';
    }
    
    return '';
  };
  
  // Function to get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus size={20} />;
      case 'comment':
        return <MessageCircle size={20} />;
      case 'like':
        return <Heart size={20} />;
      case 'reward':
        return <Award size={20} />;
      case 'match':
        return <Bell size={20} />;
      default:
        return <Bell size={20} />;
    }
  };
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Notifications</Heading>
      
      <Box
        borderRadius="lg"
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow="sm"
        overflow="hidden"
      >
        <VStack
          spacing={0}
          divider={<Divider />}
          align="stretch"
        >
          {notifications.map((notification) => (
            <Flex
              key={notification.id}
              p={4}
              bg={!notification.read ? useColorModeValue('gray.50', 'gray.700') : 'transparent'}
            >
              {notification.userId === 'system' ? (
                <Box
                  borderRadius="full"
                  bg="brand.100"
                  p={2}
                  mr={4}
                  color="brand.500"
                >
                  {getNotificationIcon(notification.type)}
                </Box>
              ) : (
                <Avatar
                  size="sm"
                  src={getUserAvatar(notification.userId)}
                  mr={4}
                />
              )}
              
              <Box flex={1}>
                <Text>{notification.text}</Text>
                <Text fontSize="sm" color="gray.500">
                  {formatTime(notification.timestamp)}
                </Text>
              </Box>
            </Flex>
          ))}
          
          {notifications.length === 0 && (
            <Box p={4} textAlign="center">
              <Text color="gray.500">No notifications yet</Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default NotificationsPage;