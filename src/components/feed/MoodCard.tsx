import React, {useEffect, useState} from 'react';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {
    Avatar,
    Badge,
    Box, CircularProgress,
    Divider,
    Flex,
    HStack,
    IconButton,
    Image,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import {Heart, MessageCircle} from 'lucide-react';
import {AccountType, MoodPostType} from '../../types';
import {getMoodColor} from "../../utils/common.utils";
import {addReactionToPost} from "../../utils/lens.utils";
import {useLensAuth} from "../../providers/LensAuthProvider";

interface MoodCardProps {
    user: AccountType;
    moodEntry: MoodPostType;
}

const MoodCard: React.FC<MoodCardProps> = ({user, moodEntry}) => {
    const {client} = useLensAuth()
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const navigate = useNavigate()

    useEffect(() => {
        if (moodEntry) {
            setIsLiked(moodEntry.isLikedByMe ?? false);
        }
    }, [moodEntry])

    const handleLike = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsLikeLoading(true);
        const result = await addReactionToPost(client!, moodEntry.id, !isLiked)
        if (result)
            setIsLiked(!isLiked);
        setIsLikeLoading(false);
    };

    const handleComment = () => {
        navigate(`/post/${moodEntry.id}`)
    }

    const handleCardClick = () => {
        if (moodEntry.commentsCount > 0)
            navigate(`/post/${moodEntry.id}`)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Box
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            cursor="pointer"
            boxShadow="sm"
            transition="transform 0.2s"
            _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'md',
            }}
            mb={4}
            onClick={handleCardClick}
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
                                icon={
                                    isLikeLoading ? (
                                        <CircularProgress
                                            isIndeterminate
                                            color="red.400"
                                            size="20px"
                                            thickness="10px"
                                        />
                                    ) : (
                                        <Heart
                                            fill={isLiked ? "currentColor" : "none"}
                                            size={20}
                                        />
                                    )
                                }
                                onClick={handleLike}
                                variant="ghost"
                                colorScheme={isLiked ? "red" : "gray"}
                                size="sm"
                            />
                            <Text fontSize="sm" color="gray.600">
                                {
                                    moodEntry.likesCount
                                    + (isLiked && !moodEntry.isLikedByMe ? 1 : 0)  // liked locally, wasn't liked before
                                    - (!isLiked && moodEntry.isLikedByMe ? 1 : 0) // unliked locally, was liked before
                                }
                            </Text>
                        </HStack>

                        <HStack>
                            <IconButton
                                aria-label="Comment"
                                icon={<MessageCircle/>}
                                onClick={handleComment}
                                variant="ghost"
                                colorScheme="gray"
                                size="sm"
                            />
                            <Text fontSize="sm" color="gray.600">
                                {moodEntry.commentsCount}
                            </Text>
                        </HStack>
                    </HStack>

                    <Text fontSize="sm" color="gray.500">
                        {formatDate(moodEntry.timestamp)}
                    </Text>
                </Flex>
            </Box>
        </Box>
    );
};

export default MoodCard;