import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  IconButton,
  Spinner,
  Avatar,
  useToast,
  Badge,
  Tooltip
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { CloseIcon, MoonIcon, SunIcon, InfoIcon, SettingsIcon } from '@chakra-ui/icons';
import chatService from '../../services/chatService';

// Define the pulse animation using Chakra UI's keyframes
const pulseAnimation = keyframes`
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.5; }
`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const VoiceChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('Click the microphone to start speaking');
  
  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const toast = useToast();
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const userBubbleColor = useColorModeValue('blue.500', 'blue.400');
  const aiBubbleColor = useColorModeValue('gray.100', 'gray.700');
  const statusBgColor = useColorModeValue('blue.50', 'gray.700');

  // Initialize with system message (hidden from UI)
  useEffect(() => {
    const systemMessage: Message = {
      role: 'system',
      content: `You are a supportive and empathetic AI assistant focused on providing emotional support. 
      Your goal is to help users express their feelings, practice mindfulness, and develop healthy coping strategies. 
      You are not a replacement for professional therapy, but you can offer comfort and general guidance. 
      Always encourage seeking professional help for serious mental health concerns. Keep responses concise and suitable for voice reading.`,
      timestamp: new Date()
    };
    
    setMessages([systemMessage]);
    
    // Initialize speech recognition with restart capability
    const initSpeechRecognition = () => {
      // Clean up any existing recognition instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition was not running');
        }
        recognitionRef.current = null;
      }
      
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Changed to false to avoid buffering issues
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
          setStatusText("Listening...");
        };
        
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
          setStatusText("Click the microphone to start speaking");
          
          // If we're not deliberately stopping, restart after a short delay
          // This creates a more continuous experience while avoiding buffering issues
          if (isListening && !isSpeaking) {
            setTimeout(() => {
              try {
                if (recognitionRef.current) {
                  recognitionRef.current.start();
                }
              } catch (e) {
                console.error('Could not restart speech recognition', e);
                initSpeechRecognition(); // Reinitialize if restart fails
              }
            }, 300);
          }
        };
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          console.log('Recognized text:', transcript);
          if (transcript.trim()) {
            handleSendMessage(transcript);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          
          // Different handling based on error type
          if (event.error === 'network') {
            setStatusText("Network error. Check your connection.");
            toast({
              title: "Network Error",
              description: "There was a problem connecting to the speech recognition service. Check your internet connection.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          } else if (event.error === 'not-allowed') {
            setStatusText("Microphone access denied");
            toast({
              title: "Microphone Access Denied",
              description: "Please allow microphone access to use voice chat.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          } else if (event.error === 'aborted') {
            // Aborted errors are usually just from stopping manually, so don't show a toast
            setStatusText("Recognition stopped");
          } else {
            setStatusText("Error: " + event.error);
            toast({
              title: "Speech Recognition Error",
              description: `Error: ${event.error}. Please try again.`,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            
            // Try to reinitialize after an error
            setTimeout(initSpeechRecognition, 1000);
          }
        };
      } else {
        setStatusText("Speech recognition not supported in this browser");
        toast({
          title: "Feature Not Supported",
          description: "Your browser doesn't support speech recognition. Try using Chrome or Edge.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    // Initialize speech recognition
    initSpeechRecognition();
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = new SpeechSynthesisUtterance();
      speechSynthesisRef.current.rate = 1.0;
      speechSynthesisRef.current.pitch = 1.0;
      speechSynthesisRef.current.volume = 1.0;
      
      speechSynthesisRef.current.onstart = () => {
        setIsSpeaking(true);
      };
      
      speechSynthesisRef.current.onend = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesisRef.current.onerror = (event) => {
        console.error('Speech synthesis error', event);
        setIsSpeaking(false);
      };
      
      // Get available voices and set a good one
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Try to find a natural-sounding female voice
          const preferredVoices = voices.filter(voice => 
            (voice.name.includes('Samantha') || 
             voice.name.includes('Female') ||
             voice.name.includes('Google UK English Female') ||
             voice.name.includes('Microsoft Zira'))
          );
          
          if (preferredVoices.length > 0) {
            speechSynthesisRef.current!.voice = preferredVoices[0];
          } else {
            // Fallback to first available voice
            speechSynthesisRef.current!.voice = voices[0];
          }
        }
      };
      
      // Chrome needs a delay for voices to load
      setTimeout(setVoice, 100);
      
      // For browsers that support the voiceschanged event
      window.speechSynthesis.onvoiceschanged = setVoice;
    } else {
      toast({
        title: "Feature Not Supported",
        description: "Your browser doesn't support speech synthesis. Try using Chrome or Edge.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
    
    // Clean up on component unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition was not running on cleanup');
        }
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [toast]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setStatusText("Recognition stopped");
      } catch (error) {
        console.error('Error stopping speech recognition', error);
        
        // If stopping fails, try to recreate the recognition object
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = 'en-US';
          setIsListening(false);
        }
      }
    } else {
      try {
        // In case it was already running somehow
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore stop errors
        }
        
        // Small delay to ensure previous instance is fully stopped
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
            console.log('Started speech recognition');
          } catch (startError) {
            console.error('Failed to start speech recognition', startError);
            
            // If start fails, show error and try to reinitialize
            toast({
              title: "Recognition Error",
              description: "Failed to start speech recognition. Trying again...",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
            
            // Recreate speech recognition object
            if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
              const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
              recognitionRef.current = new SpeechRecognition();
              recognitionRef.current.continuous = false;
              recognitionRef.current.interimResults = false;
              recognitionRef.current.lang = 'en-US';
              
              // Try one more time after recreating
              setTimeout(() => {
                try {
                  recognitionRef.current?.start();
                } catch (e) {
                  console.error('Still failed to start recognition after reinitializing', e);
                  setStatusText("Speech recognition failed. Please try reloading the page.");
                }
              }, 500);
            }
          }
        }, 100);
      } catch (error) {
        console.error('Error starting speech recognition', error);
        toast({
          title: "Recognition Error",
          description: "Could not start speech recognition. Please check microphone permissions and try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    
    if (isSpeaking && !audioEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  const speakText = (text: string) => {
    if (!audioEnabled || !speechSynthesisRef.current) return;
    
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    speechSynthesisRef.current.text = text;
    window.speechSynthesis.speak(speechSynthesisRef.current);
  };

  const handleSendMessage = async (userMessage: string) => {
    // Add user message to chat
    const userMessageObj: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessageObj]);
    setIsLoading(true);
    
    try {
      // Call backend API via service
      const assistantResponse = await chatService.sendMessage(
        messages.concat(userMessageObj).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      );
      
      // Add AI response to chat
      const assistantMessageObj: Message = {
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessageObj]);
      
      // Speak the response
      speakText(assistantResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Couldn't get a response from the AI. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Speak the error message
      speakText(errorMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter out system messages for display
  const displayMessages = messages.filter(msg => msg.role !== 'system');

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
      h="70vh"
      boxShadow="md"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Status bar */}
      <Flex 
        p={3} 
        bg={statusBgColor} 
        justifyContent="center" 
        alignItems="center"
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        {isListening ? (
          <Badge colorScheme="green" px={2} py={1} borderRadius="full" display="flex" alignItems="center">
            <Box 
              as="span" 
              w={2} 
              h={2} 
              bg="green.500" 
              borderRadius="full" 
              mr={2} 
              animation={`${pulseAnimation} 1.5s infinite`}
            />
            Listening...
          </Badge>
        ) : isSpeaking ? (
          <Badge colorScheme="blue" px={2} py={1} borderRadius="full" display="flex" alignItems="center">
            <Box 
              as="span" 
              w={2} 
              h={2} 
              bg="blue.500" 
              borderRadius="full" 
              mr={2} 
              animation={`${pulseAnimation} 1.5s infinite`}
            />
            Speaking...
          </Badge>
        ) : (
          <Text fontSize="sm" color="gray.600">
            {statusText}
          </Text>
        )}
      </Flex>
      
      {/* Messages area */}
      <Box 
        flex="1" 
        overflowY="auto" 
        p={4}
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            width: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: useColorModeValue('gray.200', 'gray.600'),
            borderRadius: '24px',
          },
        }}
      >
        {displayMessages.length === 0 ? (
          <Flex 
            height="100%" 
            alignItems="center" 
            justifyContent="center"
            flexDirection="column"
            opacity={0.7}
          >
            <Text fontSize="lg" fontWeight="medium" mb={2}>
              Voice Chat with MoodFi Assistant
            </Text>
            <Text fontSize="sm" maxW="md" textAlign="center">
              Click the microphone icon below to start speaking. Your conversation will appear here.
            </Text>
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {displayMessages.map((msg, index) => (
              <Box 
                key={index} 
                alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                maxW="80%"
              >
                <HStack spacing={2} align="flex-start">
                  {msg.role === 'assistant' && (
                    <Avatar size="sm" name="AI Assistant" bg="teal.500" />
                  )}
                  <Box>
                    <Box
                      bg={msg.role === 'user' ? userBubbleColor : aiBubbleColor}
                      color={msg.role === 'user' ? 'white' : 'inherit'}
                      borderRadius="lg"
                      px={4}
                      py={2}
                    >
                      <Text>{msg.content}</Text>
                    </Box>
                    <Text fontSize="xs" color="gray.500" textAlign={msg.role === 'user' ? 'right' : 'left'} mt={1}>
                      {formatTime(msg.timestamp)}
                    </Text>
                  </Box>
                  {msg.role === 'user' && (
                    <Avatar size="sm" name="User" />
                  )}
                </HStack>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {/* Control bar */}
      <Flex 
        p={4} 
        borderTopWidth="1px"
        borderColor={borderColor}
        justifyContent="center"
        alignItems="center"
        gap={4}
      >
        <Tooltip label={audioEnabled ? "Mute" : "Unmute"}>
          <IconButton
            aria-label={audioEnabled ? "Mute" : "Unmute"}
            icon={audioEnabled ? <InfoIcon /> : <InfoIcon />}
            onClick={toggleAudio}
            colorScheme={audioEnabled ? "blue" : "gray"}
            size="lg"
            isRound
          />
        </Tooltip>
        
        <Tooltip label={isListening ? "Stop Listening" : "Start Listening"}>
          <IconButton
            aria-label={isListening ? "Stop Listening" : "Start Listening"}
            icon={isLoading ? <Spinner /> : isListening ? <MoonIcon /> : <SunIcon />}
            onClick={toggleListening}
            colorScheme={isListening ? "red" : "green"}
            size="lg"
            isRound
            isDisabled={isLoading || isSpeaking}
          />
        </Tooltip>
        
        {isSpeaking && (
          <Tooltip label="Stop Speaking">
            <IconButton
              aria-label="Stop Speaking"
              icon={<CloseIcon />}
              onClick={() => window.speechSynthesis.cancel()}
              colorScheme="red"
              size="lg"
              isRound
            />
          </Tooltip>
        )}
      </Flex>
    </Box>
  );
};

export default VoiceChat;