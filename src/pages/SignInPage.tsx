import React, {useEffect, useState} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {
    Avatar,
    Spinner,
    Center,
    Badge,
    Box,
    Button,
    Container,
    Flex,
    Grid,
    GridItem,
    Heading,
    HStack,
    Icon,
    Image,
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    SimpleGrid,
    Text,
    useColorModeValue,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import {Award, Camera, Coins, Image as ImageIcon, TrendingUp, Users} from 'lucide-react';
import {ConnectKitButton} from "connectkit";
import {useLensAuth} from "../providers/LensAuthProvider";
import {useAccount} from "wagmi";
import {AccountType} from "../types";
import {fetchAvailableLensAccounts} from "../utils/lens.utils.ts";

const features = [
    {
        icon: Camera,
        title: 'Daily Selfies',
        description: 'Share your mood and let our AI analyze your vibe',
        color: 'blue',
    },
    {
        icon: Coins,
        title: 'Earn $NOCX',
        description: 'Get rewarded based on your mood authenticity',
        color: 'yellow',
    },
    {
        icon: Award,
        title: 'Daily Challenges',
        description: 'Match moods to earn bonus rewards',
        color: 'green',
    },
    {
        icon: ImageIcon,
        title: 'Mint NFTs',
        description: 'Turn your best moods into unique NFTs',
        color: 'purple',
    },
    {
        icon: Users,
        title: 'Connect',
        description: 'Find others sharing your wavelength',
        color: 'pink',
    },
    {
        icon: TrendingUp,
        title: 'Trade',
        description: 'Buy and sell mood NFTs in the marketplace',
        color: 'cyan',
    },
];

const AccountSelectionModal = ({
                                   isOpen,
                                   onClose,
                               }: {
    isOpen: boolean
    onClose: () => void
}) => {
    const navigate = useNavigate();
    const {
        address: walletAddress,
    } = useAccount()
    const {authenticate, isAuthenticating, client} = useLensAuth()
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [availableAccounts, setAvailableAccounts] = useState<AccountType[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);
    const handleSelectAccount = async (account: AccountType) => {
        setSelectedAccount(account)
        await authenticate(account.accountAddress, walletAddress!)
    };

    useEffect(() => {
        if (walletAddress) {
            setIsLoadingAccounts(true)
            fetchAvailableLensAccounts(client, walletAddress).then(accounts => {
                setAvailableAccounts(accounts)
                setIsLoadingAccounts(false)
            }).catch(err => {
                console.log('error fetching accounts', err)
                setIsLoadingAccounts(false)
            })
        }
    }, [walletAddress])

    const boxBgColor = useColorModeValue('gray.50', 'gray.700')

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay backdropFilter="blur(4px)"/>
            <ModalContent borderRadius="xl" p={4}>
                <ModalBody>
                    <VStack spacing={6} align="stretch">
                        <Heading size="lg" textAlign="center" mb={2}>
                            Select Account
                        </Heading>

                        {isLoadingAccounts ? (
                            <Center py={8}>
                                <VStack spacing={4}>
                                    <Spinner size="xl" color="brand.500" thickness="4px"/>
                                    <Text>Loading accounts...</Text>
                                </VStack>
                            </Center>
                        ) : availableAccounts.length > 0 ? (
                                <SimpleGrid columns={1} spacing={3}>
                                    {availableAccounts.map((account) => (
                                        <Box
                                            key={account.accountAddress}
                                            p={4}
                                            borderWidth="1px"
                                            borderRadius="xl"
                                            cursor="pointer"
                                            _hover={{
                                                bg: boxBgColor,
                                                transform: 'translateY(-2px)',
                                                transition: 'all 0.2s',
                                            }}
                                            onClick={() => handleSelectAccount(account)}
                                        >
                                            <HStack>
                                                <Flex align="center" width='100%'>
                                                    <Avatar
                                                        size="md"
                                                        src={account.avatar}
                                                        name={account.localName}
                                                        mr={4}
                                                    />
                                                    <Box>
                                                        <Text fontWeight="bold">{account.displayName}</Text>
                                                        <Text fontSize="sm" color="gray.500">
                                                            @{account.localName}
                                                        </Text>
                                                    </Box>
                                                </Flex>
                                                <Button
                                                    colorScheme="brand"
                                                    onClick={() => handleSelectAccount(account)}
                                                    isLoading={selectedAccount === account && isAuthenticating}
                                                >
                                                    Use
                                                </Button>
                                            </HStack>
                                        </Box>
                                    ))}
                                </SimpleGrid>
                            ) :
                            <Button
                                variant="outline"
                                colorScheme="brand"
                                size="lg"
                                onClick={() => navigate('/signup')}
                                height="60px"
                            >
                                Create New Account
                            </Button>
                        }
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

const SignInPage: React.FC = () => {
    const {isAuthenticated} = useLensAuth();
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {
        isConnected,
    } = useAccount()

    const bgGradient = useColorModeValue(
        'linear(to-br, blue.50 0%, purple.50 50%, pink.50 100%)',
        'linear(to-br, gray.900, purple.900)'
    );

    const cardBg = useColorModeValue('white', 'gray.800');
    const featureBg = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.600', 'gray.300');

    useEffect(() => {
        if (isConnected && !isAuthenticated) {
            onOpen();
        }
    }, [isConnected, onOpen, isAuthenticated])

    if (isAuthenticated) {
        return <Navigate to="/"/>;
    }

    return (
        <Box minH="100vh" bgGradient={bgGradient}>
            <Container maxW="8xl" py={10}>
                {/* Hero Section */}
                <Grid
                    templateColumns={{base: '1fr', lg: '1.2fr 0.8fr'}}
                    gap={10}
                    alignItems="center"
                    minH="70vh"
                >
                    <GridItem>
                        <VStack align="flex-start" spacing={8} pr={{base: 0, lg: 20}}>
                            <VStack align="flex-start" spacing={2} pr={{base: 0, lg: 20}}>
                                <Image width={40} src="./moodfi-logo.png"/>
                                <Flex align="center" gap={3}>
                                    <Heading
                                        fontSize="5xl"
                                        bgGradient="linear(to-r, brand.400, brand.600)"
                                        bgClip="text"
                                    >
                                        MoodFi
                                    </Heading>
                                </Flex>
                                <Badge
                                    colorScheme="purple"
                                    px={4}
                                    py={2}
                                    borderRadius="full"
                                    fontSize="md"
                                >
                                    Nocena Hackathon Project
                                </Badge>
                            </VStack>

                            <Heading
                                fontSize={{base: "4xl", md: "6xl"}}
                                lineHeight="1.2"
                                bgGradient="linear(to-r, blue.400, purple.500)"
                                bgClip="text"
                            >
                                Feel Good.
                                <br/>
                                Earn Better.
                            </Heading>

                            <Text fontSize="xl" color={textColor}>
                                MoodFi is a revolutionary SocialFi platform that rewards users for sharing their daily
                                mood through selfies.
                                Using AI-powered mood detection, users earn $NOCX tokens based on the positivity and
                                authenticity of their vibe.
                            </Text>

                            <HStack spacing={4}>
                                <ConnectKitButton label="Connect Wallet To Sign In" mode="dark"/>
                            </HStack>
                        </VStack>
                    </GridItem>

                    <GridItem display={{base: 'none', lg: 'block'}}>
                        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                            <GridItem>
                                <Box
                                    bg={cardBg}
                                    p={6}
                                    borderRadius="2xl"
                                    boxShadow="xl"
                                    transform="translateY(-40px)"
                                    position="relative"
                                    overflow="hidden"
                                >
                                    <img
                                        src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600"
                                        alt="Happy Mood"
                                        style={{
                                            width: '100%',
                                            height: '300px',
                                            objectFit: 'cover',
                                            borderRadius: '12px',
                                        }}
                                    />
                                    <Badge
                                        position="absolute"
                                        bottom={8}
                                        right={8}
                                        colorScheme="red"
                                        fontSize="md"
                                        px={4}
                                        py={2}
                                        borderRadius="full"
                                    >
                                        Happy Mood
                                    </Badge>
                                </Box>
                            </GridItem>
                            <GridItem>
                                <Box
                                    bg={cardBg}
                                    p={6}
                                    borderRadius="2xl"
                                    boxShadow="xl"
                                    position="relative"
                                    overflow="hidden"
                                >
                                    <img
                                        src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600"
                                        alt="Excited Mood"
                                        style={{
                                            width: '100%',
                                            height: '300px',
                                            objectFit: 'cover',
                                            borderRadius: '12px',
                                        }}
                                    />
                                    <Badge
                                        position="absolute"
                                        bottom={8}
                                        right={8}
                                        colorScheme="cyan"
                                        fontSize="md"
                                        px={4}
                                        py={2}
                                        borderRadius="full"
                                    >
                                        Excited Mood
                                    </Badge>
                                </Box>
                            </GridItem>
                            <GridItem colSpan={2}>
                                <Box
                                    bg={cardBg}
                                    p={6}
                                    borderRadius="2xl"
                                    boxShadow="xl"
                                    transform="translateY(-20px)"
                                    position="relative"
                                    overflow="hidden"
                                >
                                    <img
                                        src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600"
                                        alt="Calm Mood"
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'cover',
                                            borderRadius: '12px',
                                        }}
                                    />
                                    <Badge
                                        position="absolute"
                                        bottom={8}
                                        right={8}
                                        colorScheme="yellow"
                                        fontSize="md"
                                        px={4}
                                        py={2}
                                        borderRadius="full"
                                    >
                                        Calm Mood
                                    </Badge>
                                </Box>
                            </GridItem>
                        </Grid>
                    </GridItem>
                </Grid>

                {/* Features Section */}
                <Box mt={20} mb={10}>
                    <Heading
                        textAlign="center"
                        mb={12}
                        fontSize="4xl"
                        bgGradient="linear(to-r, blue.400, purple.500)"
                        bgClip="text"
                    >
                        How MoodFi Works
                    </Heading>
                    <SimpleGrid columns={{base: 1, md: 2, lg: 3}} spacing={8}>
                        {features.map((feature, index) => (
                            <Box
                                key={index}
                                bg={featureBg}
                                p={8}
                                borderRadius="xl"
                                boxShadow="lg"
                                transition="all 0.3s"
                                _hover={{
                                    transform: 'translateY(-4px)',
                                    boxShadow: 'xl',
                                }}
                            >
                                <Flex
                                    w={12}
                                    h={12}
                                    align="center"
                                    justify="center"
                                    borderRadius="lg"
                                    bg={`${feature.color}.100`}
                                    color={`${feature.color}.500`}
                                    mb={4}
                                >
                                    <Icon as={feature.icon} boxSize={6}/>
                                </Flex>
                                <Heading size="md" mb={2}>
                                    {feature.title}
                                </Heading>
                                <Text color={textColor}>
                                    {feature.description}
                                </Text>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Box>
            </Container>
            <AccountSelectionModal
                isOpen={isOpen}
                onClose={onClose}
            />
        </Box>
    );
};

export default SignInPage;