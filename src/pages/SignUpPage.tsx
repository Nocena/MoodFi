import React, { useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Avatar,
  IconButton,
  useColorModeValue,
  FormErrorMessage,
  useToast,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { Camera, ArrowLeft, Wallet } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const SignUpPage: React.FC = () => {
  const { isAuthenticated, signup } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
  });

  const [avatar, setAvatar] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image under 5MB',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWalletConnected(true);
      setWalletAddress('0x1234...5678'); // Mock wallet address
      toast({
        title: 'Wallet Connected',
        description: 'Your wallet has been successfully connected',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!avatar) {
      newErrors.avatar = 'Please upload a profile picture';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Display name is required';
    }

    if (!walletConnected) {
      newErrors.wallet = 'Please connect your wallet';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await signup(formData.username, walletAddress, '');
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="lg" py={12}>
          <VStack spacing={8} align="stretch">
            <Button
                leftIcon={<ArrowLeft />}
                variant="ghost"
                w="fit-content"
                onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>

            <Box
                bg={useColorModeValue('white', 'gray.800')}
                p={8}
                borderRadius="xl"
                boxShadow="lg"
            >
              <VStack spacing={6}>
                <Heading size="lg">Create Your Account</Heading>
                <Text color="gray.500" textAlign="center">
                  Join MoodFi and start earning rewards for sharing your daily mood
                </Text>

                <FormControl isInvalid={!!errors.avatar}>
                  <VStack spacing={2}>
                    <Avatar
                        size="2xl"
                        src={avatar || undefined}
                        cursor="pointer"
                        onClick={handleAvatarClick}
                    />
                    <IconButton
                        aria-label="Upload avatar"
                        icon={<Camera />}
                        onClick={handleAvatarClick}
                        size="sm"
                        colorScheme="brand"
                        borderRadius="full"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <FormErrorMessage>{errors.avatar}</FormErrorMessage>
                  </VStack>
                </FormControl>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  <VStack spacing={4} align="stretch">
                    <FormControl isInvalid={!!errors.username}>
                      <FormLabel>Username</FormLabel>
                      <Input
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Choose a unique username"
                      />
                      <FormErrorMessage>{errors.username}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.name}>
                      <FormLabel>Display Name</FormLabel>
                      <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your display name"
                      />
                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Bio</FormLabel>
                      <Textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Tell us about yourself"
                          resize="vertical"
                          rows={3}
                      />
                    </FormControl>

                    <FormControl isInvalid={!!errors.wallet}>
                      <FormLabel>Wallet</FormLabel>
                      <HStack>
                        {walletConnected ? (
                            <Badge
                                colorScheme="green"
                                p={2}
                                borderRadius="md"
                                fontSize="md"
                            >
                              Connected: {walletAddress}
                            </Badge>
                        ) : (
                            <Button
                                leftIcon={<Wallet />}
                                onClick={connectWallet}
                                isLoading={isLoading}
                                colorScheme="purple"
                                w="full"
                            >
                              Connect Wallet
                            </Button>
                        )}
                      </HStack>
                      <FormErrorMessage>{errors.wallet}</FormErrorMessage>
                    </FormControl>

                    <Button
                        type="submit"
                        colorScheme="brand"
                        size="lg"
                        isLoading={isLoading}
                        w="100%"
                        mt={4}
                    >
                      Create Account
                    </Button>
                  </VStack>
                </form>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
  );
};

export default SignUpPage;