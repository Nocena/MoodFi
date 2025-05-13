import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Container,
} from '@chakra-ui/react';
import { useAuthStore } from '../store/authStore';
import CameraComponent from '../components/camera/CameraComponent';

const CameraPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Container maxW="container.md" py={8}>
      <Box textAlign="center" mb={8}>
        <Heading mb={2}>Capture Your Mood</Heading>
        <Text color="gray.600" _dark={{ color: 'gray.300' }}>
          Take a selfie to see if your mood matches today's challenge!
        </Text>
      </Box>
      
      <CameraComponent />
    </Container>
  );
};

export default CameraPage;