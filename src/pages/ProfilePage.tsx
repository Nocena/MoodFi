import React, {useEffect, useState} from 'react';
import {Link as RouterLink, Navigate, useNavigate, useParams} from 'react-router-dom';
import {
    Avatar,
    Box,
    Button, Center,
    Flex,
    Heading,
    HStack,
    Link,
    SimpleGrid,
    Skeleton,
    SkeletonCircle,
    SkeletonText,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import {Calendar, Edit, MapPin, Users, UserX} from 'lucide-react';
import MoodCard from '../components/feed/MoodCard';
import EditProfileModal from '../components/profile/EditProfileModal';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";
import {fetchAccountByUserName, getAccountStats} from "../utils/lens.utils.ts";
import {ProfileDataType} from "../types";
import {formatDate} from "../utils/common.utils.ts";

const ProfilePage: React.FC = () => {
    const {currentAccount} = useLensAuth();
    const {name} = useParams();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [profileData, setProfileData] = useState<ProfileDataType>({
        followers: 0,
        following: 0,
        accountAddress: '',
        createdAt: '',
        avatar: '',
        displayName: '',
        localName: '',
        bio: '',
        isMe: false,
        isFollowedByMe: false,
    })
    const userName = name as string

    console.log("userName", userName)

    useEffect(() => {

        (async () => {
            try {
                const selectedAccount = await fetchAccountByUserName(userName)
                if (!selectedAccount)
                    throw new Error('empty profile')

                const accountStats = await getAccountStats(selectedAccount.accountAddress)
                if (!accountStats)
                    throw new Error('empty profile')

                setIsLoading(false)
                setProfileData({
                    followers: accountStats.followers,
                    following: accountStats.following,
                    accountAddress: selectedAccount.accountAddress,
                    createdAt: selectedAccount.createdAt,
                    avatar: selectedAccount.avatar,
                    displayName: selectedAccount.displayName,
                    localName: selectedAccount.localName,
                    bio: selectedAccount.bio,
                    isMe: currentAccount?.accountAddress === selectedAccount.accountAddress,
                    isFollowedByMe: false,
                })
            } catch (e) {
                console.log("error", e)
                setIsError(true)
            }
        })()


    }, [userName]);

    const bgGray50 = useColorModeValue('gray.50', 'gray.700')
    const bgWhiteGray = useColorModeValue('white', 'gray.800')

    /*
        if (!isAuthenticated) {
            return <Navigate to="/login"/>;
        }
    */

    if (isError) {
        return (
            <Center minH="60vh" p={8}>
                <VStack spacing={4}>
                    <UserX size={48} />
                    <Heading size="lg">Can't find profile</Heading>
                    <Text color="gray.500" textAlign="center">
                        The profile you're looking for doesn't exist or has been removed
                    </Text>
                </VStack>
            </Center>
        );
    }

    return (
        <Box>
            {/* Profile Header */}
            <Box
                borderRadius="lg"
                overflow="hidden"
                bg={bgWhiteGray}
                boxShadow="md"
                mb={6}
            >
                <Box
                    h="180px"
                    bgGradient="linear(to-r, brand.400, brand.600)"
                />

                <Box px={6} py={5} position="relative">
                    {isLoading ? (
                        <SkeletonCircle
                            size="24"
                            position="absolute"
                            top="-50px"
                            border="4px solid"
                            borderColor={bgWhiteGray}
                        />
                    ) : (
                        <Avatar
                            size="xl"
                            src={profileData.avatar}
                            name={profileData.localName}
                            border="4px solid"
                            borderColor={bgWhiteGray}
                            position="absolute"
                            top={["-50px", "-80px"]}
                        />
                    )}

                    <Flex
                        justifyContent="space-between"
                        alignItems={{base: 'flex-start', md: 'center'}}
                        flexDirection={{base: 'column', md: 'row'}}
                        pt={{base: 12, md: 0}}
                    >
                        <Box mb={{base: 4, md: 0}}>
                            {isLoading ? (
                                <VStack align="flex-start" spacing={2}>
                                    <Skeleton height="32px" width="200px"/>
                                    <Skeleton height="20px" width="150px"/>
                                </VStack>
                            ) : (
                                <>
                                    <Heading size="lg">{profileData?.displayName}</Heading>
                                    <Text color="gray.500">@{profileData?.localName}</Text>
                                </>
                            )}
                        </Box>

                        {!isLoading && (
                            <Button
                                leftIcon={<Edit size={18}/>}
                                colorScheme="brand"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </Flex>

                    {isLoading ? (
                        <VStack align="flex-start" spacing={3} mt={4}>
                            <Skeleton height="20px" width="80%"/>
                            <Skeleton height="20px" width="60%"/>
                        </VStack>
                    ) : (
                        <>
                            <Text mt={4}>{profileData?.bio}</Text>
                            {/*
                            {user?.location && (
                                <HStack mt={2} color="gray.500">
                                    <MapPin size={16}/>
                                    <Text fontSize="sm">{user.location}</Text>
                                </HStack>
                            )}
*/}
                        </>
                    )}

                    {isLoading ? (
                        <HStack mt={6} spacing={6}>
                            <Skeleton height="20px" width="150px"/>
                            <Skeleton height="20px" width="200px"/>
                        </HStack>
                    ) : (
                        <HStack mt={6} spacing={6}>
                            <HStack>
                                <Calendar size={18}/>
                                <Text fontSize="sm">Joined {profileData && formatDate(profileData.createdAt)}</Text>
                            </HStack>

                            <HStack spacing={4}>
                                <Link as={RouterLink} to="/profile/followers#followers">
                                    <HStack>
                                        <Users size={18}/>
                                        <Text fontSize="sm">
                                            <Text as="span" fontWeight="bold">{profileData?.followers}</Text> followers
                                        </Text>
                                    </HStack>
                                </Link>
                                <Text fontSize="sm">·</Text>
                                <Link as={RouterLink} to="/profile/followers#following">
                                    <Text fontSize="sm">
                                        <Text as="span" fontWeight="bold">{profileData?.following}</Text> following
                                    </Text>
                                </Link>
                            </HStack>
                        </HStack>
                    )}
                </Box>
            </Box>

            {/* Mood History */}
            <Box>
                {/*
                <Heading size="md" mb={4}>
                    Your Mood History
                </Heading>

                <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
                    {isLoading ? (
                        Array.from({length: 2}).map((_, index) => (
                            <Box
                                key={index}
                                borderRadius="lg"
                                overflow="hidden"
                                bg={bgWhiteGray}
                                boxShadow="md"
                            >
                                <Skeleton height="300px"/>
                                <Box p={4}>
                                    <SkeletonText mt="4" noOfLines={4} spacing="4"/>
                                </Box>
                            </Box>
                        ))
                    ) : (
                        user?.moodHistory.map((moodEntry) => (
                            <MoodCard
                                key={moodEntry.date}
                                user={user}
                                moodEntry={moodEntry}
                                isCurrentUser={true}
                            />
                        ))
                    )}

                    {!isLoading && user?.moodHistory.length === 0 && (
                        <Box
                            p={6}
                            borderRadius="lg"
                            bg={bgGray50}
                            textAlign="center"
                        >
                            <Text>No mood history yet. Take your first selfie!</Text>
                        </Box>
                    )}
                </SimpleGrid>
*/}
            </Box>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </Box>
    );
};

export default ProfilePage;