import React from 'react';
import {Navigate} from 'react-router-dom';
import {Badge, Box, Center, Grid, GridItem, Heading, Icon, Text, VStack,} from '@chakra-ui/react';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import {MessageSquare} from 'lucide-react';
import {useLensAuth} from "../providers/LensAuthProvider.tsx";

const MessagesPage: React.FC = () => {
    const { isAuthenticated } = useLensAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <Box position="relative">
            <Heading size="lg" mb={6}>Messages</Heading>

            <Grid
                templateColumns={{ base: "1fr", md: "300px 1fr" }}
                gap={4}
                h={{ base: "auto", md: "calc(100vh - 200px)" }}
                filter="blur(4px)"
                pointerEvents="none"
            >
                <GridItem
                    borderRadius="lg"
                    overflow="hidden"
                    display={{ base: "block", md: "block" }}
                >
                    <ConversationList />
                </GridItem>

                <GridItem
                    display={{ base: "block", md: "block" }}
                    h={{ base: "500px", md: "100%" }}
                >
                    <ChatWindow />
                </GridItem>
            </Grid>

            {/* Coming Soon Overlay */}
            <Center
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="rgba(0, 0, 0, 0.7)"
                backdropFilter="blur(8px)"
                borderRadius="lg"
            >
                <VStack spacing={6}>
                    <Icon as={MessageSquare} boxSize={16} color="brand.300" />
                    <VStack spacing={2}>
                        <Badge
                            colorScheme="brand"
                            fontSize="md"
                            px={4}
                            py={2}
                            borderRadius="full"
                        >
                            Coming Soon
                        </Badge>
                        <Heading size="lg" color="white" textAlign="center">
                            Direct Messages
                        </Heading>
                        <Text color="gray.300" textAlign="center" maxW="md">
                            We're working hard to bring you a seamless messaging experience.
                            Connect with other users and share your moods directly!
                        </Text>
                    </VStack>
                </VStack>
            </Center>
        </Box>
    );
};

export default MessagesPage;