import React, {useEffect, useState} from 'react';
import {Navigate} from 'react-router-dom';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Select,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import {ethers} from 'ethers';
import {useNFTStore} from '../store/nftStore';
import {ChevronLeft, ChevronRight, Coins} from 'lucide-react';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";

const NFTMarketplacePage: React.FC = () => {
  const { isAuthenticated } = useLensAuth();
  const { marketItems, loadMarketItems, buyNFT, isLoading, totalMarketItems } = useNFTStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const totalPages = Math.ceil(totalMarketItems / itemsPerPage);

  useEffect(() => {
    if (isAuthenticated) {
      loadMarketItems(currentPage, itemsPerPage);
    }
  }, [isAuthenticated, currentPage, itemsPerPage]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleBuyNFT = async (nftId: string, price: ethers.BigNumberish) => {
    try {
      if (!user) return;

      if (ethers.getBigInt(user.tokenBalance.toString()) < ethers.getBigInt(price.toString())) {
        toast({
          title: 'Insufficient balance',
          description: 'You don\'t have enough tokens to purchase this NFT',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      await buyNFT(nftId);
      
      toast({
        title: 'Success!',
        description: 'You have successfully purchased the NFT',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to purchase NFT',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Box mb={8}>
        <Heading mb={2}>NFT Marketplace</Heading>
        <Text color="gray.600" _dark={{ color: 'gray.300' }}>
          Discover and collect unique mood NFTs
        </Text>
      </Box>

      <HStack mb={6} justify="flex-end">
        <Text>Items per page:</Text>
        <Select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          width="auto"
        >
          <option value={9}>9</option>
          <option value={18}>18</option>
          <option value={27}>27</option>
        </Select>
      </HStack>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
        {marketItems.map((item) => (
          <Box
            key={item.nft.id}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            bg={cardBg}
            transition="transform 0.2s"
            _hover={{ transform: 'translateY(-4px)' }}
          >
            <Image
              src={item.moodEntry.photo}
              alt={`Mood NFT by ${item.creator.name}`}
              width="100%"
              height="300px"
              objectFit="cover"
            />

            <VStack p={4} align="stretch" spacing={4}>
              <HStack justify="space-between">
                <HStack>
                  <Avatar
                    size="sm"
                    src={item.creator.avatar}
                    name={item.creator.name}
                  />
                  <Box>
                    <Text fontWeight="medium">{item.creator.name}</Text>
                    <Text fontSize="sm" color="gray.500">@{item.creator.username}</Text>
                  </Box>
                </HStack>
                <Badge colorScheme="purple">
                  Score: {item.moodEntry.socialScore}
                </Badge>
              </HStack>

              <Box>
                <Text fontSize="sm" color="gray.500">
                  Mood: {item.moodEntry.mood.toUpperCase()}
                </Text>
                <HStack mt={2}>
                  <Coins size={20} />
                  <Text fontWeight="bold">
                    {ethers.formatEther(item.nft.price)} MOOD
                  </Text>
                </HStack>
              </Box>

              <Button
                colorScheme="brand"
                isLoading={isLoading}
                onClick={() => handleBuyNFT(item.nft.id, item.nft.price)}
              >
                Buy Now
              </Button>
            </VStack>
          </Box>
        ))}
      </Grid>

      {marketItems.length === 0 && (
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

      {totalPages > 1 && (
        <Flex justify="center" align="center" mt={8} gap={2}>
          <Button
            leftIcon={<ChevronLeft size={20} />}
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          
          <HStack spacing={2}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                variant={currentPage === page ? 'solid' : 'outline'}
                colorScheme={currentPage === page ? 'brand' : 'gray'}
              >
                {page}
              </Button>
            ))}
          </HStack>
          
          <Button
            rightIcon={<ChevronRight size={20} />}
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default NFTMarketplacePage;