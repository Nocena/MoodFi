import React, { useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Avatar,
  Flex,
  useColorModeValue,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { Conversation } from '../../types';
import { useSocialStore } from '../../store/socialStore';
import { useAuthStore } from '../../store/authStore';

const ConversationList: React.FC = () => {
  const { 
    conversations, 
    activeConversation, 
    setActiveConversation, 
    loadConversations,
    isLoading,
  } = useSocialStore();
  const { user } = useAuthStore();
  
  // Move useColorModeValue hooks outside of the map function
  const activeBgColor = useColorModeValue('brand.50', 'rgba(88, 28, 255, 0.15)');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  useEffect(() => {
    loadConversations();
  }, []);
  
  // Mock function to get user details
  const getOtherUser = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find(id => id !== user?.id);
    
    // Mock user data
    if (otherUserId === 'user-2') {
      return {
        name: 'Jane Smith',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
      };
    } else if (otherUserId === 'user-3') {
      return {
        name: 'Alex Chen',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
      };
    }
    
    return {
      name: 'Unknown User',
      avatar: '',
    };
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (isLoading) {
    return (
      <Box p={4}>
        <Text>Loading conversations...</Text>
      </Box>
    );
  }
  
  return (
    <VStack
      spacing={0}
      divider={<Divider />}
      align="stretch"
      maxH="100%"
      overflow="auto"
    >
      {conversations.map((conversation) => {
        const otherUser = getOtherUser(conversation);
        const isActive = activeConversation === conversation.id;
        
        return (
          <Box
            key={conversation.id}
            p={4}
            bg={isActive ? activeBgColor : 'transparent'}
            _hover={{
              bg: !isActive ? hoverBgColor : undefined,
            }}
            cursor="pointer"
            onClick={() => setActiveConversation(conversation.id)}
          >
            <Flex align="center">
              <Avatar size="md" src={otherUser.avatar} name={otherUser.name} mr={3} />
              <Box flex={1}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="medium">{otherUser.name}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {formatTime(conversation.lastMessage.timestamp)}
                  </Text>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" color="gray.500" noOfLines={1}>
                    {conversation.lastMessage.senderId === user?.id ? 'You: ' : ''}
                    {conversation.lastMessage.text}
                  </Text>
                  
                  {conversation.unreadCount > 0 && (
                    <Badge
                      borderRadius="full"
                      colorScheme="brand"
                      fontSize="xs"
                      px={2}
                    >
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </Flex>
              </Box>
            </Flex>
          </Box>
        );
      })}
      
      {conversations.length === 0 && (
        <Box p={4} textAlign="center">
          <Text color="gray.500">No conversations yet</Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Connect with users who share your mood
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default ConversationList;