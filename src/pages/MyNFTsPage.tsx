import React, {useEffect, useState} from 'react';
import {Navigate} from 'react-router-dom';
import {
    Badge,
    Box,
    Button,
    Grid,
    Heading,
    HStack,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    Tooltip,
    useColorModeValue,
    useToast,
    VStack,
} from '@chakra-ui/react';
import {ethers} from 'ethers';
import {useNFTStore} from '../store/nftStore';
import {Award, Coins, Tag} from 'lucide-react';
import {useLensAuth} from "../providers/LensAuthProvider";
import {MoodNFT, MoodPostType} from "../types";
import {getMoodColor} from "../utils/common.utils";
import {getAccountPosts} from "../utils/lens.utils";
import {useUserTokenBalance} from "../store/useUserTokenBalance";
import {useAccount, useSwitchChain} from "wagmi";
import {lensTestnet} from "wagmi/chains";

const MyNFTsPage: React.FC = () => {
    const { chainId} = useAccount()
    const { switchChain } = useSwitchChain()
    const {isAuthenticated, currentAccount, client} = useLensAuth();
    const {
        allNFTs,
        mintMoodNFT,
        updateNFTPrice,
        fetchListings,
    } = useNFTStore();
    const {
        refreshTokenBalance
    } = useUserTokenBalance()

    const [selectedNFT, setSelectedNFT] = useState<MoodNFT | null>(null);
    const [selectedPost, setSelectedPost] = useState<MoodPostType | null>(null);
    const [isMintModal, setIsMintModal] = useState(false);
    const [listingPrice, setListingPrice] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [accountNFTs, setAccountNFTs] = useState<MoodNFT[]>([])
    const [candidatePosts, setCandidatePosts] = useState<MoodPostType[]>([])
    const [mintablePosts, setMintablePosts] = useState<MoodPostType[]>([])

    const toast = useToast();
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        (async () => {
            if (currentAccount) {
                const posts = await getAccountPosts(client, currentAccount.accountAddress)
                setCandidatePosts(posts.filter(post => post.likesCount > 0))
            }
        })()
        fetchListings()
    }, [client, currentAccount, fetchListings]);

    useEffect(() => {
        if (currentAccount) {
            const mapUsedPosts: Record<string, boolean> = {}
            allNFTs.forEach(NFT => mapUsedPosts[NFT.postId] = true)
            setMintablePosts(candidatePosts.filter(post => !mapUsedPosts[post.id]))
            setAccountNFTs(allNFTs.filter(NFT => NFT.accountAddress === currentAccount.accountAddress))
        }
    }, [currentAccount, allNFTs, candidatePosts]);

    const handleOpenChangePriceModal = (nft: MoodNFT) => {
        setSelectedNFT(nft);
        setListingPrice(ethers.formatEther(nft.price));
        setSelectedPost(null);
        setIsMintModal(false)
        setIsModalOpen(true);
    };

    const handleOpenMintModal = (post: MoodPostType) => {
        setSelectedPost(post);
        setSelectedNFT(null);
        setListingPrice('');
        setIsMintModal(true);
        setIsModalOpen(true);
    };

    const handleChangePrice = async () => {
        if (!selectedNFT || !listingPrice || !currentAccount) return;

        try {
            setIsLoading(true)
            const priceInWei = ethers.parseEther(listingPrice);
            await updateNFTPrice(selectedNFT.tokenId, priceInWei);
            refreshTokenBalance(currentAccount.accountAddress)
            toast({
                title: 'Success!',
                description: 'NFT price has been updated',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            setAccountNFTs(prevNFTs =>
                prevNFTs.map(nft =>
                    nft.tokenId === selectedNFT.tokenId ? { ...nft, price: BigInt(priceInWei.toString()) } : nft
                )
            );
            setIsModalOpen(false);
            setSelectedNFT(null);
            setListingPrice('');
        } catch (error) {
            console.log("error", error)
            toast({
                title: 'Error',
                description: 'Failed to update NFT price',
                status: 'error',
                duration: 5000,
            });
        }
        setIsLoading(false)
    };

    const handleMintNFT = async () => {
        try {

            if (!currentAccount || !selectedPost)
                throw new Error('')
            setIsLoading(true)
            await mintMoodNFT({
                postId: selectedPost.id,
                userName: currentAccount?.localName,
                accountAddress: currentAccount.accountAddress,
                moodType: selectedPost.moodType,
                imageUri: selectedPost.imageUrl,
                price: listingPrice,
            });
            refreshTokenBalance(currentAccount.accountAddress)
            toast({
                title: 'Success!',
                description: 'Your mood has been minted as an NFT',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            setIsModalOpen(false)
            setSelectedPost(null);
            setListingPrice('');

            setMintablePosts(posts => posts.filter(post => post.id !== selectedPost.id))
        } catch (error) {
            console.log("error", error)
            toast({
                title: 'Error',
                description: 'Failed to mint NFT',
                status: 'error',
                duration: 5000,
            });
        }
        setIsLoading(false)
    };

    if (!isAuthenticated) {
        return <Navigate to="/login"/>;
    }

    return (
        <Box>
            <Box mb={8}>
                <Heading mb={2}>My NFTs</Heading>
                <Text color="gray.600" _dark={{color: 'gray.300'}}>
                    Manage your mood NFT collection and mint new NFTs
                </Text>
            </Box>

            <Tabs variant="enclosed" colorScheme="brand">
                <TabList mb={4}>
                    <Tab>My NFTs</Tab>
                    <Tab>Mintable Posts</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel p={0}>
                        <Grid templateColumns={{base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)'}} gap={6}>
                            {accountNFTs.map((nft) => (
                                <Box
                                    key={nft.tokenId}
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                    borderRadius="lg"
                                    overflow="hidden"
                                    bg={cardBg}
                                    transition="transform 0.2s"
                                    _hover={{transform: 'translateY(-4px)'}}
                                >
                                    <Image
                                        src={nft.imageUri}
                                        alt={`NFT ${nft.tokenId}`}
                                        width="100%"
                                        height="300px"
                                        objectFit="cover"
                                    />

                                    <VStack p={4} align="stretch" spacing={4}>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.500">
                                                Mood: {nft.moodType.toUpperCase()}
                                            </Text>
                                            <HStack>
                                                <Coins size={20}/>
                                                <Text fontWeight="bold">
                                                    {ethers.formatEther(nft.price)} NOCX
                                                </Text>
                                            </HStack>
                                        </HStack>
                                        <Button
                                            colorScheme="brand"
                                            leftIcon={<Tag size={18}/>}
                                            isLoading={isLoading}
                                            onClick={() => handleOpenChangePriceModal(nft)}
                                        >
                                            Change Price
                                        </Button>
                                    </VStack>
                                </Box>
                            ))}

                            {accountNFTs.length === 0 && (
                                <Box
                                    p={8}
                                    borderRadius="lg"
                                    bg={cardBg}
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                    textAlign="center"
                                    gridColumn="1/-1"
                                >
                                    <Text>You don't have any NFTs yet</Text>
                                    <Button
                                        as="a"
                                        href="#mintable"
                                        colorScheme="brand"
                                        mt={4}
                                    >
                                        Posts with more than one like are eligible to be minted as NFTs.😊
                                    </Button>
                                </Box>
                            )}
                        </Grid>
                    </TabPanel>

                    <TabPanel p={0}>
                        <Grid templateColumns={{base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)'}} gap={6}>
                            {mintablePosts.map((post) => (
                                <Box
                                    key={post.id}
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                    borderRadius="lg"
                                    overflow="hidden"
                                    bg={cardBg}
                                    transition="transform 0.2s"
                                    _hover={{transform: 'translateY(-4px)'}}
                                >
                                    <Image
                                        src={post.imageUrl}
                                        alt={`Mood ${post.moodType}`}
                                        width="100%"
                                        height="300px"
                                        objectFit="cover"
                                    />

                                    <VStack p={4} align="stretch" spacing={4}>
                                        <HStack justify="space-between">
                                            <Badge colorScheme={getMoodColor(post.moodType)}>
                                                {post.moodType.toUpperCase()}
                                            </Badge>
                                            <HStack>
                                                <Award size={18}/>
                                                <Text fontWeight="bold">
                                                    {post.likesCount} Likes
                                                </Text>
                                            </HStack>
                                        </HStack>

                                        <Text fontSize="sm" color="gray.500">
                                            Posted: {new Date(post.timestamp).toLocaleDateString()}
                                        </Text>

                                        <Tooltip label="Posts with more than 1 like can be minted as NFTs">
                                            <Button
                                                colorScheme="brand"
                                                leftIcon={<Coins size={18}/>}
                                                onClick={() => handleOpenMintModal(post)}
                                                isLoading={isLoading}
                                            >
                                                Mint as NFT
                                            </Button>
                                        </Tooltip>
                                    </VStack>
                                </Box>
                            ))}

                            {mintablePosts.length === 0 && (
                                <Box
                                    p={8}
                                    borderRadius="lg"
                                    bg={cardBg}
                                    borderWidth="1px"
                                    borderColor={borderColor}
                                    textAlign="center"
                                    gridColumn="1/-1"
                                >
                                    <Text>No posts eligible for minting yet</Text>
                                    <Text fontSize="sm" color="gray.500" mt={2}>
                                        Posts with more than 1 like can be minted as NFTs
                                    </Text>
                                </Box>
                            )}
                        </Grid>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>
                        {isMintModal ? 'Set NFT Price' : 'Change NFT Price'}
                    </ModalHeader>
                    <ModalCloseButton/>

                    <ModalBody>
                        <VStack spacing={4}>
                            <Text>Enter the price in NOCX tokens:</Text>
                            <Input
                                type="number"
                                value={listingPrice}
                                onChange={(e) => setListingPrice(e.target.value)}
                                placeholder="0.00"
                            />
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        {
                            chainId === lensTestnet.id ? (
                                <Button
                                    colorScheme="brand"
                                    onClick={isMintModal ? handleMintNFT : handleChangePrice}
                                    isLoading={isLoading}
                                    isDisabled={!listingPrice || parseFloat(listingPrice) <= 0}
                                >
                                    {isMintModal ? 'Mint NFT' : 'Update Price'}
                                </Button>
                            ) : (
                                <Button
                                    colorScheme="brand"
                                    onClick={async () => {
                                        setIsLoading(true)
                                        await switchChain({
                                            chainId: lensTestnet.id
                                        })
                                        setIsLoading(false)
                                    }}
                                    isLoading={isLoading}
                                >
                                    switch to lens chain
                                </Button>
                            )
                        }
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default MyNFTsPage;