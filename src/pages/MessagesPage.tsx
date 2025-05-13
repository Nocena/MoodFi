import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useAuthStore } from '../store/authStore';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';

const MessagesPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Messages</Heading>
      
      <Grid
        templateColumns={{ base: "1fr", md: "300px 1fr" }}
        gap={4}
        h={{ base: "auto", md: "calc(100vh - 200px)" }}
      >
        <GridItem
          borderRadius="lg"
          overflow="hidden"
          display={{ base: "block", md: "block" }}
        >
          <ConversationList />
        </GridItem>
        
        <GridItem
          display={{ base: "block", md: "block" }}
          h={{ base: "500px", md: "100%" }}
        >
          <ChatWindow />
        </GridItem>
      </Grid>
    </Box>
  );
};

export default MessagesPage;