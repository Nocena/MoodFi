import {useEffect, useState} from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
    Box,
    VStack,
    Input,
    Button,
    Avatar,
    Text,
    Flex,
    useColorModeValue,
    Divider,
    HStack,
    Badge,
    IconButton,
    useToast,
    Skeleton,
    SkeletonCircle,
    SkeletonText,
} from '@chakra-ui/react';
import { Heart, MessageCircle } from 'lucide-react';
import {useLensAuth} from "../providers/LensAuthProvider";
import {formatTime, getMoodColor} from "../utils/common.utils";
import {
    commentOnPost,
    getCommentsOfPostByPostId,
    getPostByPostId
} from "../utils/lens.utils";
import {CommentType, MoodPostType} from "../types";

const PostPage: React.FC = () => {
    const { postId } = useParams();
    const {client, currentAccount, isAuthenticated} = useLensAuth();
    const [currentPost, setCurrentPost] = useState<MoodPostType | null>(null);
    const [comments, setComments] = useState<CommentType[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const toast = useToast();

    useEffect(() => {
        (async () => {
            try {
                const post = await getPostByPostId(client, postId as string)
                setCurrentPost(post)

                const _comments = await getCommentsOfPostByPostId(client, postId as string)
                setComments(_comments)

                setIsLiked(post?.isLikedByMe ?? false)
            } catch (e) {
                console.log("error", e)
            }
            setIsLoading(false)
        })()

    }, [client, currentAccount, postId])

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleComment = async () => {
        if (!commentText.trim() || !client || !currentPost) return;

        setIsSubmittingComment(true)
        try {
            const result = await commentOnPost(client!, currentPost!.id, commentText);
            if (!result)
                throw new Error('failed')

            setComments(prev => [
                {
                    id: (Math.random() * 100000).toString(),
                    timestamp: (new Date()).toString(),
                    content: commentText,
                    author: currentAccount!,
                },
                ...prev,
            ])

            setCommentText('');
            toast({
                title: 'Comment added',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            console.log("error", error)
            toast({
                title: 'Failed to add comment',
                status: 'error',
                duration: 3000,
            });
        }
        setIsSubmittingComment(false)
    };

    const bgWhiteGray = useColorModeValue('white', 'gray.800')
    const bgGrayGray = useColorModeValue('gray.50', 'gray.700')

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <Box maxW="3xl" mx="auto">
            <Box
                bg={bgWhiteGray}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
            >
                <Box p={6}>
                    {/* Post Header */}
                    <Flex justify="space-between" align="center" mb={4}>
                        <HStack>
                            {isLoading ? (
                                <>
                                    <SkeletonCircle size="12" />
                                    <Box>
                                        <Skeleton height="20px" width="120px" mb={2} />
                                        <Skeleton height="16px" width="100px" />
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Avatar
                                        size="md"
                                        src={currentPost?.author.avatar}
                                        name={currentPost?.author.displayName}
                                    />
                                    <Box>
                                        <Text fontWeight="bold">{currentPost?.author.displayName}</Text>
                                        <Text fontSize="sm" color="gray.500">@{currentPost?.author.localName}</Text>
                                    </Box>
                                </>
                            )}
                        </HStack>
                        {isLoading ? (
                            <HStack spacing={2}>
                                <Skeleton height="24px" width="80px" borderRadius="full" />
                                <Skeleton height="24px" width="100px" borderRadius="full" />
                            </HStack>
                        ) : (
                            <HStack spacing={2}>
                                <Badge
                                    colorScheme={currentPost ? getMoodColor(currentPost!.moodType) : 'green'}
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    textTransform="capitalize"
                                >
                                    {currentPost?.moodType}
                                </Badge>
                                <Badge
                                    colorScheme="purple"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                >
                                    {currentPost?.confidence}% Match
                                </Badge>
                            </HStack>
                        )}
                    </Flex>

                    {/* Post Image */}
                    {isLoading ? (
                        <Skeleton height="400px" borderRadius="lg" mb={4} />
                    ) : (
                        <Box
                            borderRadius="lg"
                            overflow="hidden"
                            mb={4}
                        >
                            <img
                                src={currentPost?.imageUrl}
                                alt="Mood"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '500px',
                                    objectFit: 'cover',
                                }}
                            />
                        </Box>
                    )}

                    {/* Post Text */}
                    {isLoading ? (
                        <SkeletonText mt="4" noOfLines={3} spacing="4" mb={4} />
                    ) : (
                        <Text fontSize="lg" mb={4}>
                            {currentPost?.content}
                        </Text>
                    )}

                    {/* Post Actions */}
                    {isLoading ? (
                        <Skeleton height="40px" mb={4} />
                    ) : (
                        <Flex justify="space-between" align="center" mb={4}>
                            <HStack spacing={6}>
                                <HStack>
                                    <IconButton
                                        aria-label="Like"
                                        icon={<Heart fill={isLiked ? "currentColor" : "none"} />}
                                        onClick={handleLike}
                                        variant="ghost"
                                        colorScheme={isLiked ? "red" : "gray"}
                                        size="sm"
                                    />
                                    <Text fontSize="sm" color="gray.600">
                                        {
                                            (currentPost?.likesCount ?? 0)
                                            + (isLiked && !currentPost!.isLikedByMe ? 1 : 0)  // liked locally, wasn't liked before
                                            - (!isLiked && currentPost!.isLikedByMe ? 1 : 0) // unliked locally, was liked before
                                        }
                                    </Text>
                                </HStack>
                                <HStack>
                                    <IconButton
                                        aria-label="Comment"
                                        icon={<MessageCircle />}
                                        variant="ghost"
                                        colorScheme="gray"
                                        size="sm"
                                    />
                                    <Text fontSize="sm" color="gray.600">
                                        {currentPost?.commentsCount}
                                    </Text>
                                </HStack>
                            </HStack>
                            <Text fontSize="sm" color="gray.500">
                                {currentPost ? formatTime(currentPost!.timestamp) : ''}
                            </Text>
                        </Flex>
                    )}

                    <Divider mb={6} />

                    {/* Comments Section */}
                    <VStack spacing={6} align="stretch">
                        {isLoading ? (
                            <Skeleton height="24px" width="150px" />
                        ) : (
                            <Text fontWeight="bold" fontSize="lg">
                                Comments ({currentPost?.commentsCount})
                            </Text>
                        )}

                        {/* Add Comment */}
                        {!isLoading && (
                            <HStack>
                                <Avatar size="sm" src={currentAccount?.avatar} name={currentAccount?.displayName} />
                                <Input
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleComment();
                                        }
                                    }}
                                />
                                <Button
                                    colorScheme="brand"
                                    onClick={handleComment}
                                    isLoading={isSubmittingComment}
                                    isDisabled={!commentText.trim()}
                                >
                                    Post
                                </Button>
                            </HStack>
                        )}

                        {/* Comments List */}
                        <VStack spacing={4} align="stretch">
                            {isLoading ? (
                                // Skeleton comments
                                Array.from({ length: 3 }).map((_, index) => (
                                    <Box
                                        key={index}
                                        p={4}
                                        bg={bgGrayGray}
                                        borderRadius="md"
                                    >
                                        <HStack spacing={3} align="start">
                                            <SkeletonCircle size="8" />
                                            <Box flex={1}>
                                                <Skeleton height="20px" width="200px" mb={2} />
                                                <SkeletonText noOfLines={2} spacing="2" />
                                            </Box>
                                        </HStack>
                                    </Box>
                                ))
                            ) : (
                                comments.map((comment) => (
                                    <Box
                                        key={comment.id}
                                        p={4}
                                        bg={bgGrayGray}
                                        borderRadius="md"
                                    >
                                        <HStack spacing={3} align="start">
                                            <Avatar
                                                size="sm"
                                                src={comment.author.avatar}
                                                name={comment.author.displayName}
                                            />
                                            <Box flex={1}>
                                                <HStack mb={1}>
                                                    <Text fontWeight="bold">{comment.author.displayName}</Text>
                                                    <Text fontSize="sm" color="gray.500">
                                                        @{comment.author.localName}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.500">
                                                        • {formatTime(comment.timestamp)}
                                                    </Text>
                                                </HStack>
                                                <Text>{comment.content}</Text>
                                            </Box>
                                        </HStack>
                                    </Box>
                                ))
                            )}
                        </VStack>
                    </VStack>
                </Box>
            </Box>
        </Box>
    );
};

export default PostPage;