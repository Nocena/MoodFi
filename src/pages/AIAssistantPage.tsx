import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Box, 
  Alert, 
  AlertIcon, 
  AlertDescription, 
  useColorModeValue,
  Flex,
  Text,
  Heading,
  IconButton,
  HStack,
  Image
} from '@chakra-ui/react';
import { useLensAuth } from "../providers/LensAuthProvider";
import VoiceChat from '../components/therapy/AIAssistantModal';
import LiveCameraFeed from '../components/therapy/LiveCameraFeed';
import AIBlob from '../components/therapy/AIBlob';

const VoiceTherapyPage: React.FC = () => {
  const { isAuthenticated } = useLensAuth();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isSpeechSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  const isSpeechSynthesisSupported = 'speechSynthesis' in window;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <Box
      bg="black"
      h="100vh"
      w="100%"
      position="relative"
      overflow="hidden"
    >
      {/* Header with MoodFi logo */}
      <Flex
        p={4}
        borderBottom="1px solid"
        borderColor="gray.800"
        alignItems="center"
        justifyContent="space-between"
        position="relative"
        zIndex={5}
      >
        <HStack spacing={2}>
          <Image 
            src="/public/logo/eyes.png" 
            alt="MoodFi Logo" 
            boxSize="40px"
            fallback={
              <Box boxSize="40px" borderRadius="md" bg="purple.500" />
            }
          />
          <Text
            fontSize="xl"
            fontWeight="bold"
            bgGradient="linear(to-r, purple.400, blue.400)"
            bgClip="text"
          >
            MoodFi
          </Text>
        </HStack>

        <HStack spacing={4}>
          <IconButton
            aria-label="Toggle theme"
            icon={<Box as="span" fontSize="xl">☀️</Box>}
            variant="ghost"
            color="gray.400"
            _hover={{ color: "white" }}
          />
          <IconButton
            aria-label="Notifications"
            icon={<Box as="span" fontSize="xl">🔔</Box>}
            variant="ghost"
            color="gray.400"
            _hover={{ color: "white" }}
          />
          <IconButton
            aria-label="Take photo"
            icon={<Box as="span" fontSize="xl">📷</Box>}
            colorScheme="purple"
            borderRadius="lg"
          />
          <Box 
            as="button"
            boxSize="40px"
            borderRadius="full"
            bg="gray.200"
            overflow="hidden"
          >
            <Box as="span" fontSize="xl">👤</Box>
          </Box>
        </HStack>
      </Flex>

      {/* Main content area */}
      <Box
        position="relative" 
        h="calc(100vh - 72px)"
      >
        {/* Compatibility Warning */}
        {(!isSpeechSupported || !isSpeechSynthesisSupported) && (
          <Alert
            status="warning"
            position="absolute"
            top="16px"
            left="50%"
            transform="translateX(-50%)"
            maxW="sm"
            zIndex={10}
            borderRadius="md"
            boxShadow="lg"
          >
            <AlertIcon />
            <AlertDescription fontSize="sm">
              {!isSpeechSupported && "Speech recognition is not supported. "}
              {!isSpeechSynthesisSupported && "Text-to-speech is not supported. "}
              Use Chrome, Edge, or Safari for best experience.
            </AlertDescription>
          </Alert>
        )}

        {/* Camera Feed - Positioned below the header */}
        <Box
          position="absolute"
          top="80px"
          right={4}
          zIndex={20}
          borderRadius="lg"
          overflow="hidden"
          width="180px"
          height="140px"
          boxShadow="dark-lg"
        >
          <LiveCameraFeed />
        </Box>

        {/* Circular gradient background */}
        <Box
          position="absolute"
          inset={0}
          bgGradient="radial(circle at center, rgba(90, 60, 255, 0.2) 0%, rgba(0, 0, 0, 1) 70%)"
          zIndex={0}
        />

        {/* AI Blob center positioned */}
        <Flex
          position="absolute"
          width="100%"
          height="50%"
          top="15%"
          justifyContent="center"
          alignItems="center"
          zIndex={1}
        >
          <AIBlob isSpeaking={isSpeaking} />
        </Flex>

        {/* Hello text */}
        <Flex
          position="absolute"
          width="100%"
          top="55%"
          justifyContent="center"
          zIndex={2}
        >
          <Text
            fontSize="5xl"
            fontWeight="light"
            color="white"
            opacity={isSpeaking ? 0 : 0.8}
            transition="opacity 0.5s ease"
          >
            Hello.
          </Text>
        </Flex>

        {/* Chat UI positioned at bottom */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          width="100%"
          zIndex={3}
          p={4}
        >
          <VoiceChat onSpeakingChange={setIsSpeaking} />
        </Box>
      </Box>
    </Box>
  );
};

export default VoiceTherapyPage;