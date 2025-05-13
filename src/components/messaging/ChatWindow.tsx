import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  IconButton,
  Avatar,
  VStack,
  useColorModeValue,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { Send } from 'lucide-react';
import { useSocialStore } from '../../store/socialStore';
import { useAuthStore } from '../../store/authStore';

const ChatWindow: React.FC = () => {
  const [message, setMessage] = useState('');
  const { 
    activeConversation,
    messages,
    sendMessage,
  } = useSocialStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];
  
  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = () => {
    if (!message.trim() || !activeConversation) return;
    
    // Find the conversation to get the receiver ID
    const conversation = useSocialStore.getState().conversations.find(
      c => c.id === activeConversation
    );
    
    if (!conversation) return;
    
    const receiverId = conversation.participants.find(id => id !== user?.id);
    
    if (!receiverId) return;
    
    sendMessage(receiverId, message);
    setMessage('');
  };
  
  // Mock function to get user details
  const getOtherUser = () => {
    if (!activeConversation) return null;
    
    const conversation = useSocialStore.getState().conversations.find(
      c => c.id === activeConversation
    );
    
    if (!conversation) return null;
    
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
  
  const otherUser = getOtherUser();
  
  if (!activeConversation) {
    return (
      <Flex
        h="full"
        align="center"
        justify="center"
        bg={useColorModeValue('white', 'gray.800')}
        borderWidth="1px"
        borderRadius="lg"
        p={4}
      >
        <Text color="gray.500">Select a conversation to start chatting</Text>
      </Flex>
    );
  }
  
  return (
    <Flex
      direction="column"
      h="full"
      bg={useColorModeValue('white', 'gray.800')}
      borderWidth="1px"
      borderRadius="lg"
    >
      {/* Chat header */}
      <Flex
        align="center"
        p={4}
        borderBottomWidth="1px"
        bg={useColorModeValue('gray.50', 'gray.700')}
        borderTopRadius="lg"
      >
        <Avatar
          size="sm"
          src={otherUser?.avatar}
          name={otherUser?.name}
          mr={3}
        />
        <Text fontWeight="medium">{otherUser?.name}</Text>
      </Flex>
      
      {/* Messages area */}
      <Box
        flex={1}
        overflowY="auto"
        p={4}
        bg={useColorModeValue('gray.50', 'gray.700')}
      >
        <VStack spacing={3} align="stretch">
          {activeMessages.map((msg) => {
            const isSentByMe = msg.senderId === user?.id;
            
            return (
              <Flex
                key={msg.id}
                justify={isSentByMe ? 'flex-end' : 'flex-start'}
              >
                <Box
                  maxW="70%"
                  bg={isSentByMe
                    ? useColorModeValue('brand.500', 'brand.400')
                    : useColorModeValue('gray.100', 'gray.600')
                  }
                  color={isSentByMe ? 'white' : undefined}
                  borderRadius="lg"
                  px={3}
                  py={2}
                >
                  <Text>{msg.text}</Text>
                  <Text
                    fontSize="xs"
                    color={isSentByMe ? 'whiteAlpha.800' : 'gray.500'}
                    textAlign="right"
                    mt={1}
                  >
                    {formatTime(msg.timestamp)}
                  </Text>
                </Box>
              </Flex>
            );
          })}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>
      
      {/* Input area */}
      <Flex p={4} borderTopWidth="1px">
        <InputGroup size="md">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <InputRightElement>
            <IconButton
              aria-label="Send message"
              icon={<Send size={18} />}
              size="sm"
              colorScheme="brand"
              isDisabled={!message.trim()}
              onClick={handleSendMessage}
            />
          </InputRightElement>
        </InputGroup>
      </Flex>
    </Flex>
  );
};

export default ChatWindow;