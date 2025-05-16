import React, {useState} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {
    Avatar,
    Badge,
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
    Tooltip,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import {Heart, MessageCircle, Share2} from 'lucide-react';
import {AccountType, MoodPostType} from '../../types';
import {useSocialStore} from '../../store/socialStore';

interface MoodCardProps {
    user: AccountType;
    moodEntry: MoodPostType;
}

const MoodCard: React.FC<MoodCardProps> = ({user, moodEntry}) => {
    const [isCommenting, setIsCommenting] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [isShared, setIsShared] = useState(false);
    const {addComment} = useSocialStore();

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleShare = () => {
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getMoodColor = (mood: string) => {
        switch (mood) {
            case 'happy':
                return 'yellow';
            case 'sad':
                return 'blue';
            case 'excited':
                return 'pink';
            case 'calm':
                return 'green';
            default:
                return 'gray';
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
            <Box p={4}>
                <Flex justifyContent="space-between" alignItems="center" mb={4}>
                    <HStack as={RouterLink} to={`/profile/${user.localName}`}>
                        <Avatar
                            size="sm"
                            src={user.avatar}
                            name={user.displayName}
                        />
                        <VStack spacing={0} alignItems="flex-start">
                            <Text fontWeight="bold">{user.displayName}</Text>
                            <Text fontSize="sm" color="gray.500">@{user.localName}</Text>
                        </VStack>
                    </HStack>

                    <HStack spacing={2}>
                        <Badge
                            colorScheme={getMoodColor(moodEntry.moodType)}
                            px={3}
                            py={1}
                            borderRadius="full"
                            textTransform="capitalize"
                        >
                            {moodEntry.moodType}
                        </Badge>

{/*
                        {moodEntry.socialScore && (
                            <Badge
                                colorScheme="purple"
                                px={3}
                                py={1}
                                borderRadius="full"
                            >
                                {moodEntry.socialScore}% Match
                            </Badge>
                        )}
*/}
                    </HStack>
                </Flex>

                <Box
                    borderRadius="lg"
                    overflow="hidden"
                    position="relative"
                    mb={4}
                >
                    <Image
                        src={moodEntry.imageUrl}
                        alt={`${user.displayName}'s mood`}
                        w="full"
                        objectFit="cover"
                        h="auto"
                        maxH="500px"
                    />
                </Box>

                {moodEntry.content && (
                    <Text mb={4} whiteSpace="pre-wrap">
                        {moodEntry.content}
                    </Text>
                )}
                <Divider mb={4}/>

                <Flex justify="space-between" align="center" mb={4}>
                    <HStack spacing={6}>
                        <HStack>
                            <IconButton
                                aria-label="Like"
                                icon={<Heart fill={isLiked ? "currentColor" : "none"}/>}
                                onClick={handleLike}
                                variant="ghost"
                                colorScheme={isLiked ? "red" : "gray"}
                                size="sm"
                            />
                            <Text fontSize="sm" color="gray.600">
                                {moodEntry.likesCount + (isLiked ? 1 : 0)}
                            </Text>
                        </HStack>

                        <HStack>
                            <IconButton
                                aria-label="Comment"
                                icon={<MessageCircle/>}
                                onClick={() => setIsCommenting(!isCommenting)}
                                variant="ghost"
                                colorScheme="gray"
                                size="sm"
                            />
                            <Text fontSize="sm" color="gray.600">
                                {moodEntry.commentsCount}
                            </Text>
                        </HStack>

                        <Tooltip
                            label={isShared ? "Shared!" : "Share mood"}
                            placement="top"
                            hasArrow
                        >
                            <IconButton
                                aria-label="Share"
                                icon={<Share2/>}
                                onClick={handleShare}
                                variant="ghost"
                                colorScheme={isShared ? "green" : "gray"}
                                size="sm"
                            />
                        </Tooltip>
                    </HStack>

                    <Text fontSize="sm" color="gray.500">
                        {formatDate(moodEntry.timestamp)}
                    </Text>
                </Flex>

                <Collapse in={isCommenting} animateOpacity>
                    <Box mb={4}>
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

{/*
                {moodEntry.comments.length > 0 && (
                    <VStack spacing={2} align="stretch">
                        {moodEntry.comments.map((comment) => (
                            <Box
                                key={comment.id}
                                p={3}
                                bg={useColorModeValue('gray.50', 'gray.700')}
                                borderRadius="md"
                            >
                                <HStack align="flex-start" spacing={2}>
                                    <Avatar size="xs" name="User"/>
                                    <Box flex={1}>
                                        <Text fontSize="sm">
                                            <Text as="span" fontWeight="bold">@some-user</Text>
                                            <Text as="span" color="gray.500" ml={2} fontSize="xs">
                                                {formatDate(comment.timestamp)}
                                            </Text>
                                        </Text>
                                        <Text fontSize="sm" mt={1}>
                                            {comment.text}
                                        </Text>
                                    </Box>
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                )}
*/}
            </Box>
        </Box>
    );
};

export default MoodCard;