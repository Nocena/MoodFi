import React, {useEffect, useState} from 'react';
import {Link as RouterLink, useParams} from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Center,
    Flex,
    Grid,
    Heading,
    HStack,
    Image,
    Link,
    SimpleGrid,
    Skeleton,
    SkeletonCircle,
    SkeletonText,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import {Calendar, Coins, Edit, Users, UserX} from 'lucide-react';
import MoodCard from '../components/feed/MoodCard';
import EditProfileModal from '../components/profile/EditProfileModal';
import {useLensAuth} from "../providers/LensAuthProvider";
import {fetchAccountByUserName, getAccountPosts, getAccountStats} from "../utils/lens.utils";
import {MoodNFT, MoodPostType, ProfileDataType} from "../types";
import {formatDate} from "../utils/common.utils";
import {follow, unfollow} from "@lens-protocol/client/actions";
import {useNFTStore} from "../store/nftStore";
import {ethers} from "ethers";
import {useAccount} from "wagmi";

const ProfilePage: React.FC = () => {
    const {address: walletAddress} = useAccount()
    const {client, currentAccount} = useLensAuth();
    const {allNFTs, fetchListings} = useNFTStore();
    const {name} = useParams();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [accountPosts, setAccountPosts] = useState<MoodPostType[]>([])
    const [accountNFTs, setAccountNFTs] = useState<MoodNFT[]>([])
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

    useEffect(() => {
        fetchListings()
    }, [])

    useEffect(() => {
        setAccountNFTs(allNFTs.filter(NFT => NFT.owner === walletAddress))
    }, [allNFTs, walletAddress]);
    
    useEffect(() => {
        (async () => {
            try {
                const selectedAccount = await fetchAccountByUserName(client, userName)
                if (!selectedAccount)
                    throw new Error('empty profile')

                const accountStats = await getAccountStats(client, selectedAccount.accountAddress)
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
                    isFollowedByMe: selectedAccount?.isFollowedByMe ?? false,
                })


                const posts = await getAccountPosts(client, selectedAccount.accountAddress)
                setAccountPosts(posts)
                setIsHistoryLoading(false)
            } catch (e) {
                console.log("error", e)
                setIsError(true)
                setIsHistoryLoading(false)
            }
        })()

    }, [client, currentAccount, userName]);

    const bgGray50 = useColorModeValue('gray.50', 'gray.700')
    const bgWhiteGray = useColorModeValue('white', 'gray.800')

    const handleFollowToggle = async () => {
        try {
            setIsFollowLoading(true)
            if (profileData.isFollowedByMe) {
                await unfollow(client!, {
                    account: profileData.accountAddress,
                })
            } else {
                await follow(client!, {
                    account: profileData.accountAddress,
                })
            }
            setProfileData(prev => ({
                ...prev,
                isFollowedByMe: !prev.isFollowedByMe,
                followers: prev.isFollowedByMe ? prev.followers - 1 : prev.followers + 1,
            }))
        } catch(e) {
            console.log("error", e)
        }
        setIsFollowLoading(false)
    }

    if (isError) {
        return (
            <Center minH="60vh" p={8}>
                <VStack spacing={4}>
                    <UserX size={48}/>
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
                            top={["-50px", "-80px"]}
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
                                </VStack>
                            ) : (
                                <>
                                    <Heading size="lg">{profileData?.displayName}</Heading>
                                    <Text color="gray.500">@{profileData?.localName}</Text>
                                </>
                            )}
                        </Box>

                        {!isLoading && (
                            profileData.isMe ? (
                                <Button
                                    leftIcon={<Edit size={18}/>}
                                    colorScheme="brand"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    Edit Profile
                                </Button>
                            ) : (
                                <Button
                                    colorScheme="brand"
                                    variant={profileData.isFollowedByMe ? "solid" : "outline"}
                                    isLoading={isFollowLoading}
                                    onClick={handleFollowToggle}
                                >
                                    {profileData.isFollowedByMe ? "Following" : "Follow"}
                                </Button>
                            )
                        )}
                    </Flex>

                    {isLoading ? (
                        <VStack align="flex-start" spacing={3} mt={4}>
                            <Skeleton height="20px" width="80%"/>
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
                        </HStack>
                    ) : (
                        <HStack mt={6} spacing={6}>
                            <HStack>
                                <Calendar size={18}/>
                                <Text fontSize="sm">Joined {profileData && formatDate(profileData.createdAt)}</Text>
                            </HStack>

                            <HStack spacing={4}>
                                <Link as={RouterLink} to={`/profile/${name}/followers#followers`}>
                                    <HStack>
                                        <Users size={18}/>
                                        <Text fontSize="sm">
                                            <Text as="span" fontWeight="bold">{profileData?.followers}</Text> followers
                                        </Text>
                                    </HStack>
                                </Link>
                                <Text fontSize="sm">·</Text>
                                <Link as={RouterLink} to={`/profile/${name}/followers#following`}>
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
            <Box
                bg={bgWhiteGray}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
            >
                <Tabs isFitted variant="enclosed">
                    <TabList>
                        <Tab>Mood History</Tab>
                        <Tab>NFT Collection</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel p={6}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                {isHistoryLoading ? (
                                    Array.from({ length: 2 }).map((_, index) => (
                                        <Box
                                            key={index}
                                            borderRadius="lg"
                                            overflow="hidden"
                                            bg={bgWhiteGray}
                                            boxShadow="md"
                                        >
                                            <Skeleton height="300px" />
                                            <Box p={4}>
                                                <SkeletonText mt="4" noOfLines={4} spacing="4" />
                                            </Box>
                                        </Box>
                                    ))
                                ) : (
                                    accountPosts.map((post) => (
                                        <MoodCard
                                            key={post.id}
                                            user={post.author}
                                            moodEntry={post}
                                        />
                                    ))
                                )}

                                {!isHistoryLoading && accountPosts.length === 0 && (
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
                        </TabPanel>

                        <TabPanel p={6}>
                            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
                                {accountNFTs.map((nft) => (
                                    <Box
                                        key={nft.tokenId}
                                        borderWidth="1px"
                                        borderColor={useColorModeValue('gray.200', 'gray.700')}
                                        borderRadius="lg"
                                        overflow="hidden"
                                        transition="transform 0.2s"
                                        _hover={{ transform: 'translateY(-4px)' }}
                                    >
                                        <Image
                                            src={nft.imageUri}
                                            alt={`NFT ${nft.tokenId}`}
                                            width="100%"
                                            height="200px"
                                            objectFit="cover"
                                        />

                                        <VStack p={4} align="stretch" spacing={3}>
                                            <HStack justify="space-between">
                                                <Text fontSize="sm" color="gray.500">
                                                    Mood: {nft.moodType.toUpperCase()}
                                                </Text>
                                                {/*{nft.isListed && (*/}
                                                    <HStack>
                                                        <Coins size={16} />
                                                        <Text fontWeight="bold">
                                                            {ethers.formatEther(nft.price)} NOCX
                                                        </Text>
                                                    </HStack>
                                                {/*)}*/}
                                            </HStack>
                                        </VStack>
                                    </Box>
                                ))}

                                {accountNFTs.length === 0 && (
                                    <Box
                                        p={6}
                                        borderRadius="lg"
                                        bg={useColorModeValue('gray.50', 'gray.700')}
                                        textAlign="center"
                                        gridColumn="1/-1"
                                    >
                                        <Text>No NFTs in your collection yet</Text>
                                        <Button
                                            as={RouterLink}
                                            to="/nft/marketplace"
                                            colorScheme="brand"
                                            mt={4}
                                        >
                                            Browse Marketplace
                                        </Button>
                                    </Box>
                                )}
                            </Grid>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </Box>
    );
};

export default ProfilePage;