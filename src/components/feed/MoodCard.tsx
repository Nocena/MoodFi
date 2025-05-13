import React, {useState} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  HStack,
  IconButton,
  Image,
  Input,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import {Award, Heart, MessageCircle} from 'lucide-react';
import {MoodEntry, User} from '../../types';
import {useSocialStore} from '../../store/socialStore';

interface MoodCardProps {
  user: User;
  moodEntry: MoodEntry;
  isCurrentUser?: boolean;
}

const MoodCard: React.FC<MoodCardProps> = ({ user, moodEntry, isCurrentUser = false }) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const { addComment } = useSocialStore();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleLike = () => {
    setIsLiked(!isLiked);
  };
  
  const handleComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      await addComment(user.id, moodEntry.date, commentText);
      setCommentText('');
      setIsCommenting(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };
  
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy': return 'yellow';
      case 'sad': return 'blue';
      case 'excited': return 'pink';
      case 'calm': return 'green';
      default: return 'gray';
    }
  };
  
  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      transition="transform 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      }}
      mb={4}
    >
      <Box position="relative">
        <Image
          src={moodEntry.photo}
          alt={`${user.name}'s mood`}
          w="full"
          objectFit="cover"
          h="auto"
          maxH="500px"
        />
        
        <Box
          position="absolute"
          top={2}
          right={2}
          px={2}
          py={1}
          borderRadius="full"
          bg={`${getMoodColor(moodEntry.mood)}.500`}
          color="white"
        >
          <Text fontWeight="bold">
            {moodEntry.mood.toUpperCase()}
          </Text>
        </Box>
        
        {moodEntry.reward && (
          <Box
            position="absolute"
            top={2}
            left={2}
            px={2}
            py={1}
            borderRadius="full"
            bg="yellow.400"
            color="gray.800"
            display="flex"
            alignItems="center"
          >
            <Award size={16} style={{ marginRight: '4px' }} />
            <Text fontWeight="bold">REWARD</Text>
          </Box>
        )}
      </Box>
      
      <Box p={4}>
        <Flex justifyContent="space-between" alignItems="center" mb={2}>
          <HStack as={RouterLink} to={isCurrentUser ? '/profile' : `/user/${user.id}`}>
            <Avatar
              size="sm"
              src={user.avatar}
              name={user.name}
            />
            <VStack spacing={0} alignItems="flex-start">
              <Text fontWeight="bold">{user.name}</Text>
              <Text fontSize="sm" color="gray.500">@{user.username}</Text>
            </VStack>
          </HStack>
          
          <Text fontSize="sm" color="gray.500">
            {formatDate(moodEntry.date)}
          </Text>
        </Flex>
        
        <Divider my={3} />
        
        <Flex justify="space-between">
          <HStack>
            <IconButton
              aria-label="Like"
              icon={<Heart fill={isLiked ? "currentColor" : "none"} />}
              onClick={handleLike}
              variant="ghost"
              colorScheme={isLiked ? "red" : "gray"}
              size="sm"
            />
            <Text fontSize="sm">{moodEntry.likes.length + (isLiked ? 1 : 0)}</Text>
            
            <IconButton
              aria-label="Comment"
              icon={<MessageCircle />}
              onClick={() => setIsCommenting(!isCommenting)}
              variant="ghost"
              colorScheme="gray"
              size="sm"
              ml={2}
            />
            <Text fontSize="sm">{moodEntry.comments.length}</Text>
          </HStack>
        </Flex>
        
        <Collapse in={isCommenting} animateOpacity>
          <Box mt={4}>
            <Flex>
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                mr={2}
              />
              <Button
                colorScheme="brand"
                size="sm"
                onClick={handleComment}
                isDisabled={!commentText.trim()}
              >
                Post
              </Button>
            </Flex>
          </Box>
        </Collapse>
        
        {moodEntry.comments.length > 0 && (
          <Box mt={4}>
            {moodEntry.comments.map((comment) => (
              <Box
                key={comment.id}
                p={2}
                bg={useColorModeValue('gray.50', 'gray.700')}
                borderRadius="md"
                mb={2}
              >
                <Text fontSize="sm">
                  <Text as="span" fontWeight="bold">@some-user</Text>:{' '}
                  {comment.text}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MoodCard;