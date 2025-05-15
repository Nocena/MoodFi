import React, {useEffect, useState} from 'react';
import {Navigate} from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Flex,
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
  Select,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import {ethers} from 'ethers';
import {useNFTStore} from '../store/nftStore';
import {ChevronLeft, ChevronRight, Coins, Tag} from 'lucide-react';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";

const MyNFTsPage: React.FC = () => {
  const { isAuthenticated } = useLensAuth();
  const { userNFTs, loadUserNFTs, listNFT, unlistNFT, isLoading, totalUserNFTs } = useNFTStore();
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const totalPages = Math.ceil(totalUserNFTs / itemsPerPage);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserNFTs(currentPage, itemsPerPage);
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

  const handleOpenListModal = (nftId: string) => {
    setSelectedNFT(nftId);
    setIsModalOpen(true);
  };

  const handleListNFT = async () => {
    if (!selectedNFT || !listingPrice) return;

    try {
      const priceInWei = ethers.parseEther(listingPrice);
      await listNFT(selectedNFT, priceInWei);
      
      toast({
        title: 'Success!',
        description: 'Your NFT has been listed on the marketplace',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setIsModalOpen(false);
      setSelectedNFT(null);
      setListingPrice('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to list NFT',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUnlistNFT = async (nftId: string) => {
    try {
      await unlistNFT(nftId);
      
      toast({
        title: 'Success!',
        description: 'Your NFT has been unlisted from the marketplace',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unlist NFT',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Box mb={8}>
        <Heading mb={2}>My NFTs</Heading>
        <Text color="gray.600" _dark={{ color: 'gray.300' }}>
          Manage your mood NFT collection
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
        {userNFTs.map((nft) => (
          <Box
            key={nft.id}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            bg={cardBg}
            transition="transform 0.2s"
            _hover={{ transform: 'translateY(-4px)' }}
          >
            <Image
              src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt={`NFT ${nft.tokenId}`}
              width="100%"
              height="300px"
              objectFit="cover"
            />

            <VStack p={4} align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Badge colorScheme={nft.isListed ? 'green' : 'gray'}>
                  {nft.isListed ? 'Listed' : 'Not Listed'}
                </Badge>
                {nft.isListed && (
                  <HStack>
                    <Coins size={20} />
                    <Text fontWeight="bold">
                      {ethers.formatEther(nft.price)} MOOD
                    </Text>
                  </HStack>
                )}
              </HStack>

              <Text fontSize="sm" color="gray.500">
                Minted: {new Date(nft.mintedAt).toLocaleDateString()}
              </Text>

              {nft.lastSoldAt && (
                <Text fontSize="sm" color="gray.500">
                  Last sold: {new Date(nft.lastSoldAt).toLocaleDateString()} for{' '}
                  {ethers.formatEther(nft.lastSoldPrice || '0')} MOOD
                </Text>
              )}

              {nft.isListed ? (
                <Button
                  colorScheme="red"
                  variant="outline"
                  leftIcon={<Tag size={18} />}
                  isLoading={isLoading}
                  onClick={() => handleUnlistNFT(nft.id)}
                >
                  Unlist
                </Button>
              ) : (
                <Button
                  colorScheme="brand"
                  leftIcon={<Tag size={18} />}
                  isLoading={isLoading}
                  onClick={() => handleOpenListModal(nft.id)}
                >
                  List for Sale
                </Button>
              )}
            </VStack>
          </Box>
        ))}
      </Grid>

      {userNFTs.length === 0 && (
        <Box
          p={8}
          borderRadius="lg"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          textAlign="center"
        >
          <Text>You don't have any NFTs yet</Text>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>List NFT for Sale</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <Text>Enter the price in MOOD tokens:</Text>
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
            <Button
              colorScheme="brand"
              onClick={handleListNFT}
              isLoading={isLoading}
              isDisabled={!listingPrice || parseFloat(listingPrice) <= 0}
            >
              List NFT
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MyNFTsPage;