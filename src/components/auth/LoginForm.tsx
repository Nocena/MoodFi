import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  FormErrorMessage,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAuthStore } from '../../store/authStore';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      // Error is already handled in the store
    }
  };
  
  return (
    <Box
      rounded={'lg'}
      bg={useColorModeValue('white', 'gray.700')}
      boxShadow={'lg'}
      p={8}
      width="100%"
      maxW="md"
    >
      <Stack spacing={4}>
        <Heading fontSize={'2xl'} textAlign="center">
          Sign in to your account
        </Heading>
        
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="username" isInvalid={!!errors.username}>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <FormErrorMessage>{errors.username}</FormErrorMessage>
            </FormControl>
            
            <FormControl id="password" isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
            
            <Button
              colorScheme="brand"
              isLoading={isLoading}
              type="submit"
            >
              Sign in
            </Button>
          </Stack>
        </form>
        
        <Stack pt={6}>
          <Text align={'center'}>
            Don't have an account?{' '}
            <RouterLink to="/signup" style={{ color: useColorModeValue('#581cff', '#7245ff') }}>
              Sign up
            </RouterLink>
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
};

export default LoginForm;