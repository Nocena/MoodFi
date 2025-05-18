import React, {useRef, useState} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import {ArrowLeft, Camera} from 'lucide-react';
import {ConnectKitButton} from "connectkit";
import {useLensAuth} from "../providers/LensAuthProvider.tsx";
import {useAccount} from "wagmi";
import {uploadMediaToGrove, uploadMetadataToGrove} from "../utils/grove.utils.ts";
import {account as accountMetadata} from "@lens-protocol/metadata";
import {createAccountWithUsername} from "@lens-protocol/client/actions"
import {uri} from "@lens-protocol/client"
import {fetchAccountByUserName} from "../utils/lens.utils.ts";

const SignUpPage: React.FC = () => {
  const { isAuthenticated, onboard, refreshCurrentAccount, disconnect } = useLensAuth();
  const { address: walletAddress, isConnected: walletConnected } = useAccount()
  const [avatar, setAvatar] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

    if (!formData.bio.trim()) {
      newErrors.bio = 'bio is required';
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

    if (!validateForm() || !walletAddress) {
      return;
    }

    try {
      setIsLoading(true);
      const existingAccount = await fetchAccountByUserName(formData.username)
      if (existingAccount) {
        setErrors({
          username: 'This username is already in use',
        })
        setIsLoading(false);
        return
      }

      setErrors({})
      const newClient = await onboard(walletAddress)

      if (!newClient)
        throw new Error(`Can't onboard user`)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const avatarURI = await uploadMediaToGrove(fileInputRef.current.files[0])
      const metadata = accountMetadata({
        name: formData.name,
        bio: formData.bio,
        picture: avatarURI.uri,
      });
      const metadataURI = await uploadMetadataToGrove(metadata);
      const result = await createAccountWithUsername(newClient, {
        username: { localName: formData.username },
        metadataUri: uri(metadataURI.uri),
      });
      console.log("Account created successfully", result);
      await refreshCurrentAccount()
      navigate('/');
    } catch (error) {
      console.error("Failed to create Account", error);
      toast({
        title: 'Error',
        description: 'Failed to create account(please check if you have enough wallet balance to create your profile). Please try again.',
        status: 'error',
        duration: 5000,
      });
      await disconnect()
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

                    <FormControl isInvalid={!!errors.bio}>
                      <FormLabel>Bio</FormLabel>
                      <Textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Tell us about yourself"
                          resize="vertical"
                          rows={3}
                      />
                      <FormErrorMessage>{errors.bio}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.wallet}>
                      <FormLabel>Wallet</FormLabel>
                      <HStack>
                        <ConnectKitButton label="Connect Wallet" mode="dark" />
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