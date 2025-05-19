import React, {useEffect, useState} from 'react';
import {Navigate} from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Grid,
    Heading,
    HStack,
    Image,
    Text,
    useColorModeValue,
    useToast,
    VStack,
} from '@chakra-ui/react';
import {ethers} from 'ethers';
import {useNFTStore} from '../store/nftStore';
import {Coins} from 'lucide-react';
import {useLensAuth} from "../providers/LensAuthProvider";
import {useAccount, useSwitchChain} from "wagmi";
import {MoodNFT} from "../types";
import {useUserTokenBalance} from "../store/useUserTokenBalance";
import {lensTestnet} from "wagmi/chains";

const NFTMarketplacePage: React.FC = () => {
    const {isAuthenticated, currentAccount} = useLensAuth();
    const {chainId, address: walletAddress} = useAccount()
    const {switchChain} = useSwitchChain()
    const {
        allNFTs,
        fetchListings,
        buyNFT,
    } = useNFTStore();
    const {
        refreshTokenBalance,
        balanceAmount
    } = useUserTokenBalance()
    const [marketNFTs, setMarketNFTs] = useState<MoodNFT[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        fetchListings()
    }, []);

    useEffect(() => {
        setMarketNFTs(allNFTs.filter(NFT => NFT.owner !== walletAddress))
    }, [allNFTs, walletAddress]);

    const handleBuyNFT = async (nft: MoodNFT) => {
        try {
            if (!currentAccount || !nft) return;

            if (ethers.getBigInt(balanceAmount) < ethers.getBigInt(nft.price.toString())) {
                toast({
                    title: 'Insufficient balance',
                    description: 'You don\'t have enough tokens to purchase this NFT',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            setIsLoading(true)
            await buyNFT(nft.tokenId, nft.price);

            toast({
                title: 'Success!',
                description: 'You have successfully purchased the NFT',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            refreshTokenBalance(walletAddress!)
            setMarketNFTs(nfts => nfts.filter(item => item.tokenId !== nft.tokenId))
        } catch (error) {
            console.log("error", error)
            toast({
                title: 'Error',
                description: 'Failed to purchase NFT',
                status: 'error',
                duration: 5000,
                isClosable: true,
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
                <Heading mb={2}>NFT Marketplace</Heading>
                <Text color="gray.600" _dark={{color: 'gray.300'}}>
                    Discover and collect unique mood NFTs
                </Text>
            </Box>

            <Grid templateColumns={{base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)'}} gap={6}>
                {marketNFTs.map((nft) => (
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
                            alt={`Mood NFT by ${nft.userName}`}
                            width="100%"
                            height="300px"
                            objectFit="cover"
                        />

                        <VStack p={4} align="stretch" spacing={4}>
                            <HStack justify="space-between">
                                <HStack>
                                    <Avatar
                                        size="sm"
                                        src={''}
                                        name={nft.userName}
                                    />
                                    <Box>
                                        <Text fontSize="sm" color="gray.500">@{nft.userName}</Text>
                                    </Box>
                                </HStack>
                                {/*
                                <Badge colorScheme="purple">
                                    Score: {item.moodEntry.socialScore}
                                </Badge>
*/}
                            </HStack>

                            <Box>
                                <Text fontSize="sm" color="gray.500">
                                    Mood: {nft.moodType.toUpperCase()}
                                </Text>
                                <HStack mt={2}>
                                    <Coins size={20}/>
                                    <Text fontWeight="bold">
                                        {ethers.formatEther(nft.price)} NOCX
                                    </Text>
                                </HStack>
                            </Box>

                            {
                                chainId === lensTestnet.id ? (
                                    <Button
                                        colorScheme="brand"
                                        isLoading={isLoading}
                                        onClick={() => handleBuyNFT(nft)}
                                    >
                                        Buy Now
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
                        </VStack>
                    </Box>
                ))}
            </Grid>

            {marketNFTs.length === 0 && (
                <Box
                    p={8}
                    borderRadius="lg"
                    bg={cardBg}
                    borderWidth="1px"
                    borderColor={borderColor}
                    textAlign="center"
                >
                    <Text>No NFTs available in the marketplace</Text>
                </Box>
            )}
        </Box>
    );
};

export default NFTMarketplacePage;