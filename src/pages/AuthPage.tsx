import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Container,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuthStore } from '../store/authStore';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <Container maxW={'lg'} py={12}>
      <Stack spacing={8}>
        <Box textAlign="center">
          <Heading
            fontSize={'4xl'}
            bgGradient="linear(to-r, brand.400, brand.600)"
            bgClip="text"
          >
            MoodMatch
          </Heading>
          <Text fontSize={'lg'} color={'gray.600'} _dark={{ color: 'gray.300' }} mt={2}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </Text>
        </Box>
        <Flex
          align={'center'}
          justify={'center'}
        >
          {isLogin ? <LoginForm /> : <SignupForm />}
        </Flex>
      </Stack>
    </Container>
  );
};

export default AuthPage;