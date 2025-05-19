import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Text, 
  Flex, 
  Badge, 
  useToast,
  VStack
} from '@chakra-ui/react';

const SimpleSpeechToText: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const toast = useToast();

  useEffect(() => {
    // Initialize speech recognition
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    // Clean up on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition was not running');
        }
      }
    };
  }, []);

  const startListening = () => {
    setError(null);
    setTranscript('');
    
    // Create a new recognition instance each time
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Basic configuration
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.continuous = false;
    recognitionRef.current.maxAlternatives = 1;

    // Set up event handlers
    recognitionRef.current.onstart = () => {
      console.log('Simple recognition started');
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      console.log('Simple recognition ended');
      setIsListening(false);
    };

    recognitionRef.current.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const text = lastResult[0].transcript;
      console.log('Simple recognition result:', text);
      setTranscript(text);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Simple recognition error:', event.error);
      setIsListening(false);
      setError(event.error);
      
      toast({
        title: "Speech Recognition Error",
        description: `Error: ${event.error}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    };

    // Start listening
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting simple recognition:', error);
      setError('Failed to start recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      p={4} 
      mb={6}
      bg="white"
      _dark={{ bg: "gray.700" }}
    >
      <VStack spacing={4} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontWeight="bold">Speech-to-Text Test</Text>
          {isListening && (
            <Badge colorScheme="green" variant="solid" borderRadius="full" px={2}>
              Listening...
            </Badge>
          )}
        </Flex>
        
        <Box 
          p={3} 
          borderWidth="1px" 
          borderRadius="md" 
          minHeight="60px"
          bg="gray.50"
          _dark={{ bg: "gray.800" }}
        >
          {transcript ? transcript : "Your speech will appear here..."}
        </Box>
        
        {error && (
          <Text color="red.500" fontSize="sm">
            Error: {error}
          </Text>
        )}
        
        <Flex justifyContent="center" gap={4}>
          <Button 
            colorScheme="green" 
            onClick={startListening} 
            isDisabled={isListening || error === 'Speech recognition is not supported in your browser'}
          >
            Start Listening
          </Button>
          <Button 
            colorScheme="red" 
            onClick={stopListening} 
            isDisabled={!isListening}
          >
            Stop Listening
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default SimpleSpeechToText;