import {useEffect, useState} from 'react';
import {Link as RouterLink, Navigate, useLocation, useParams} from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Divider,
    HStack,
    Icon,
    Skeleton,
    SkeletonCircle,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import {UserPlus, Users} from 'lucide-react';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";
import {fetchAccountByUserName, getAccountFollowers, getAccountFollowings} from "../utils/lens.utils.ts";
import {AccountType} from "../types";

const FollowersPage: React.FC = () => {
    const {name} = useParams();
    const userName = name as string

    const location = useLocation();
    const {isAuthenticated, currentAccount} = useLensAuth();
    const [activeTab, setActiveTab] = useState(location.hash === '#following' ? 1 : 0);
    const [isLoading, setIsLoading] = useState(true);
    const [followers, setFollowers] = useState<AccountType[]>([]);
    const [followings, setFollowings] = useState<AccountType[]>([]);

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
    const emptyStateBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        (async () => {
            try {
                const selectedAccount = await fetchAccountByUserName(userName)
                if (!selectedAccount)
                    throw new Error('empty profile')

                setFollowers(await getAccountFollowers(selectedAccount.accountAddress))
                setFollowings(await getAccountFollowings(selectedAccount.accountAddress))
            } catch (e) {
                console.log("error", e)
            } finally {
                setIsLoading(false)
            }
        })()
    }, [])

    if (!isAuthenticated) {
        return <Navigate to="/login"/>;
    }

    const handleFollow = async (userId: string) => {
        try {
            // await followUser(userId);
        } catch (error) {
            console.error('Failed to follow user:', error);
        }
    };

    const LoadingSkeleton = () => (
        <VStack spacing={0} align="stretch" divider={<Divider/>}>
            {[1, 2, 3].map((index) => (
                <Box key={index} p={4}>
                    <HStack justify="space-between">
                        <HStack spacing={3}>
                            <SkeletonCircle size="12"/>
                            <Box flex="1">
                                <Skeleton height="20px" width="120px" mb={2}/>
                                <Skeleton height="16px" width="100px"/>
                            </Box>
                        </HStack>
                        <Skeleton height="32px" width="80px" borderRadius="md"/>
                    </HStack>
                </Box>
            ))}
        </VStack>
    );

    const EmptyFollowers = () => (
        <VStack py={12} spacing={4} color="gray.500">
            <Icon as={Users} boxSize={12}/>
            <Text fontSize="lg" fontWeight="medium">No followers yet</Text>
            <Text textAlign="center">
                When someone follows you, they'll show up here. Share your moods to attract followers!
            </Text>
            <Button
                as={RouterLink}
                to="/discover"
                leftIcon={<UserPlus size={18}/>}
                colorScheme="brand"
                size="lg"
                mt={4}
            >
                Find People to Connect
            </Button>
        </VStack>
    );

    const EmptyFollowing = () => (
        <VStack py={12} spacing={4} color="gray.500">
            <Icon as={UserPlus} boxSize={12}/>
            <Text fontSize="lg" fontWeight="medium">Not following anyone yet</Text>
            <Text textAlign="center">
                Follow people to see their daily moods and connect with them!
            </Text>
            <Button
                as={RouterLink}
                to="/discover"
                leftIcon={<UserPlus size={18}/>}
                colorScheme="brand"
                size="lg"
                mt={4}
            >
                Discover People
            </Button>
        </VStack>
    );

    return (
        <Box>
            <Box
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
            >
                <Tabs
                    isFitted
                    variant="enclosed"
                    index={activeTab}
                    onChange={(index) => setActiveTab(index)}
                >
                    <TabList>
                        <Tab>
                            {isLoading ? (
                                <Skeleton height="20px" width="100px"/>
                            ) : (
                                `Followers (${followers.length})`
                            )}
                        </Tab>
                        <Tab>
                            {isLoading ? (
                                <Skeleton height="20px" width="100px"/>
                            ) : (
                                `Following (${followings.length})`
                            )}
                        </Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel p={0}>
                            {isLoading ? (
                                <LoadingSkeleton/>
                            ) : followers.length > 0 ? (
                                <VStack spacing={0} align="stretch" divider={<Divider/>}>
                                    {followers.map((follower) => (
                                        <Box
                                            key={follower.accountAddress}
                                            p={4}
                                            _hover={{bg: hoverBgColor}}
                                            transition="background 0.2s"
                                        >
                                            <HStack justify="space-between">
                                                <HStack spacing={3}>
                                                    <Avatar
                                                        size="md"
                                                        src={follower.avatar}
                                                        name={follower.displayName}
                                                        as={RouterLink}
                                                        to={`/profile/${follower.localName}`}
                                                    />
                                                    <Box>
                                                        <Text fontWeight="medium">{follower.displayName}</Text>
                                                        <Text
                                                            fontSize="sm"
                                                            color="gray.500"
                                                            as={RouterLink}
                                                            to={`/profile/${follower.localName}`}
                                                            _hover={{color: 'brand.500', textDecoration: 'underline'}}
                                                        >
                                                            @{follower.localName}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                                <Button
                                                    size="sm"
                                                    colorScheme="brand"
                                                    variant={follower.isFollowedByMe ? "outline" : "solid"}
                                                    onClick={() => handleFollow(follower.accountAddress)}
                                                >
                                                    {follower.isFollowedByMe ? "Following" : "Follow"}
                                                </Button>
                                            </HStack>
                                        </Box>
                                    ))}
                                </VStack>
                            ) : (
                                <Box bg={emptyStateBg}>
                                    <EmptyFollowers/>
                                </Box>
                            )}
                        </TabPanel>

                        <TabPanel p={0}>
                            {isLoading ? (
                                <LoadingSkeleton/>
                            ) : followings.length > 0 ? (
                                <VStack spacing={0} align="stretch" divider={<Divider/>}>
                                    {followings.map((followed) => (
                                        <Box
                                            key={followed.accountAddress}
                                            p={4}
                                            _hover={{bg: hoverBgColor}}
                                            transition="background 0.2s"
                                        >
                                            <HStack justify="space-between">
                                                <HStack spacing={3}>
                                                    <Avatar
                                                        size="md"
                                                        src={followed.avatar}
                                                        name={followed.displayName}
                                                        as={RouterLink}
                                                        to={`/profile/${followed.localName}`}
                                                    />
                                                    <Box>
                                                        <Text fontWeight="medium">{followed.displayName}</Text>
                                                        <Text
                                                            fontSize="sm"
                                                            color="gray.500"
                                                            as={RouterLink}
                                                            to={`/profile/${followed.localName}`}
                                                            _hover={{color: 'brand.500', textDecoration: 'underline'}}
                                                        >
                                                            @{followed.localName}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                                <Button
                                                    size="sm"
                                                    colorScheme="brand"
                                                    variant="outline"
                                                    onClick={() => handleFollow(followed.accountAddress)}
                                                >
                                                    Following
                                                </Button>
                                            </HStack>
                                        </Box>
                                    ))}
                                </VStack>
                            ) : (
                                <Box bg={emptyStateBg}>
                                    <EmptyFollowing/>
                                </Box>
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Box>
    );
};

export default FollowersPage;