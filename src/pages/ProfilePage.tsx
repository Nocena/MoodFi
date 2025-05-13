import React, { useState } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar,
  VStack,
  HStack,
  Button,
  Divider,
  SimpleGrid,
  useColorModeValue,
  Badge,
  Link,
} from '@chakra-ui/react';
import { Calendar, Users, Edit, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import MoodCard from '../components/feed/MoodCard';
import EditProfileModal from '../components/profile/EditProfileModal';

const ProfilePage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <Box>
      {/* Profile Header */}
      <Box
        borderRadius="lg"
        overflow="hidden"
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow="md"
        mb={6}
      >
        <Box
          h="180px"
          bgGradient="linear(to-r, brand.400, brand.600)"
        />
        
        <Box px={6} py={5} position="relative">
          <Avatar
            size="xl"
            src={user.avatar}
            name={user.name}
            border="4px solid"
            borderColor={useColorModeValue('white', 'gray.800')}
            position="absolute"
            top="-50px"
          />
          
          <Flex
            justifyContent="space-between"
            alignItems={{ base: 'flex-start', md: 'center' }}
            flexDirection={{ base: 'column', md: 'row' }}
            pt={{ base: 12, md: 0 }}
          >
            <Box mb={{ base: 4, md: 0 }}>
              <Heading size="lg">{user.name}</Heading>
              <Text color="gray.500">@{user.username}</Text>
            </Box>
            
            <Button
              leftIcon={<Edit size={18} />}
              colorScheme="brand"
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </Flex>
          
          <Text mt={4}>{user.bio}</Text>
          
          {user.location && (
            <HStack mt={2} color="gray.500">
              <MapPin size={16} />
              <Text fontSize="sm">{user.location}</Text>
            </HStack>
          )}
          
          <HStack mt={6} spacing={6}>
            <HStack>
              <Calendar size={18} />
              <Text fontSize="sm">Joined {formatDate(user.joinedDate)}</Text>
            </HStack>
            
            <HStack spacing={4}>
              <Link as={RouterLink} to="/profile/followers#followers">
                <HStack>
                  <Users size={18} />
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="bold">{user.followers.length}</Text> followers
                  </Text>
                </HStack>
              </Link>
              <Text fontSize="sm">·</Text>
              <Link as={RouterLink} to="/profile/followers#following">
                <Text fontSize="sm">
                  <Text as="span" fontWeight="bold">{user.following.length}</Text> following
                </Text>
              </Link>
            </HStack>
          </HStack>
        </Box>
      </Box>
      
      {/* Mood History */}
      <Box>
        <Heading size="md" mb={4}>
          Your Mood History
        </Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {user.moodHistory.map((moodEntry) => (
            <MoodCard
              key={moodEntry.date}
              user={user}
              moodEntry={moodEntry}
              isCurrentUser={true}
            />
          ))}
          
          {user.moodHistory.length === 0 && (
            <Box
              p={6}
              borderRadius="lg"
              bg={useColorModeValue('gray.50', 'gray.700')}
              textAlign="center"
            >
              <Text>No mood history yet. Take your first selfie!</Text>
            </Box>
          )}
        </SimpleGrid>
      </Box>
      
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </Box>
  );
};

export default ProfilePage;