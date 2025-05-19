import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Container, Heading, Text, Alert, AlertIcon, AlertDescription, Divider } from '@chakra-ui/react';
import { useLensAuth } from "../providers/LensAuthProvider";
import AIAssistantModal from '../components/therapy/AIAssistantModal';
import SimpleSpeechToText from '../components/therapy/SimpleSpeechToText';

const VoiceTherapyPage: React.FC = () => {
  const { isAuthenticated } = useLensAuth();
  const isSpeechSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  const isSpeechSynthesisSupported = 'speechSynthesis' in window;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Container maxW="container.md" py={8}>
      <Box textAlign="center" mb={8}>
        <Heading mb={2}>AI Therapy</Heading>
        <Text color="gray.600" _dark={{ color: 'gray.300' }} mb={4}>
          Chat with our AI assistant to express your feelings
        </Text>
        
        {(!isSpeechSupported || !isSpeechSynthesisSupported) && (
          <Alert status="warning" borderRadius="md" mb={4}>
            <AlertIcon />
            <AlertDescription>
              {!isSpeechSupported && "Speech recognition is not supported in your browser. "}
              {!isSpeechSynthesisSupported && "Text-to-speech is not supported in your browser. "}
              For the best experience, please use Chrome, Edge, or Safari.
            </AlertDescription>
          </Alert>
        )}
      </Box>
      
      {/* Simple Speech-to-Text component for testing microphone */}
      <SimpleSpeechToText />
      
      <Divider my={4} />
      
      {/* Main Chat Component */}
      <AIAssistantModal />
    </Container>
  );
};

export default VoiceTherapyPage;