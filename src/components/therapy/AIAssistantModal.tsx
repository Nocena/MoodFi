import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Avatar,
  useToast,
  Badge,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  HStack
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaMicrophone } from 'react-icons/fa';
import { BrainIcon } from 'lucide-react';
import chatService from '../../services/chatService';

// Define keyframes for animations
const pulseAnimation = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.9; }
  100% { transform: scale(0.95); opacity: 0.5; }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 15px 2px rgba(138, 110, 255, 0.6); }
  50% { box-shadow: 0 0 25px 5px rgba(138, 110, 255, 0.8); }
  100% { box-shadow: 0 0 15px 2px rgba(138, 110, 255, 0.6); }
`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface VoiceChatProps {
  onSpeakingChange: (isSpeaking: boolean) => void;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ onSpeakingChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [inputText, setInputText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const toast = useToast();

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'system',
        content: `You are a supportive and empathetic AI assistant focused on emotional support. 
        You help users express their feelings and practice mindfulness. Always suggest seeking professional help if needed.`,
        timestamp: new Date()
      },
      {
        role: 'assistant',
        content: 'Hello 👋 I am Elwa. Before we start, tell me your name.',
        timestamp: new Date()
      }
    ]);

    if ('speechSynthesis' in window) {
      const synth = new SpeechSynthesisUtterance();
      synth.rate = 1.0;
      synth.pitch = 1.0;
      synth.volume = 1.0;

      synth.onstart = () => {
        setIsSpeaking(true);
        onSpeakingChange(true);
      };
      synth.onend = () => {
        setIsSpeaking(false);
        onSpeakingChange(false);
      };
      synth.onerror = () => {
        setIsSpeaking(false);
        onSpeakingChange(false);
      };

      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v =>
          v.name.includes('Samantha') ||
          v.name.includes('Google') ||
          v.name.includes('Zira')
        );
        synth.voice = preferred || voices[0];
      };

      setTimeout(setVoice, 100);
      window.speechSynthesis.onvoiceschanged = setVoice;
      speechSynthesisRef.current = synth;
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    setStatusText('Listening...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAndSend(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);
    } catch (err) {
      console.error(err);
      setStatusText('');
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setStatusText('Processing...');
    }
  };

  const transcribeAndSend = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log('📝 Transcript:', data.text);
        handleSendMessage(data.text);
      } else {
        console.error('Transcription API error:', data);
        throw new Error(data.error?.message || 'Transcription failed');
      }
    } catch (err) {
      console.error('Transcription failed:', err);
      setStatusText('');
      toast({
        title: 'Transcription Error',
        description: 'Could not transcribe audio. Try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSendMessage = async (userMessage: string) => {
    // Clear input field if sending from text input
    setInputText('');
    
    const userMsg: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setStatusText('Processing...');

    try {
      // For demo purposes, you could use the actual chat service
      // or implement a mock response for testing
      const assistantReply = await chatService.sendMessage(
        messages.concat(userMsg).map(({ role, content }) => ({ role, content }))
      );

      const assistantMsg: Message = {
        role: 'assistant',
        content: assistantReply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
      speakText(assistantReply);
    } catch (err) {
      console.error('Error sending message', err);
      const fallbackMsg = 'Sorry, I encountered an error. Please try again.';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackMsg,
        timestamp: new Date()
      }]);

      speakText(fallbackMsg);
      toast({
        title: "Error",
        description: "Could not get a response from the AI.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  const speakText = (text: string) => {
    if (!audioEnabled || !speechSynthesisRef.current) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    speechSynthesisRef.current.text = text;
    window.speechSynthesis.speak(speechSynthesisRef.current);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleSendMessage(inputText.trim());
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Filter out system messages
  const displayMessages = messages.filter(msg => msg.role !== 'system');

  return (
    <Box>
      {/* Messages container */}
      {displayMessages.length > 0 && (
        <Box
          maxH="200px"
          overflowY="auto"
          mb={4}
          borderRadius="xl"
          bg="rgba(20, 20, 35, 0.6)"
          backdropFilter="blur(10px)"
          p={4}
        >
          <VStack spacing={4} align="stretch">
            {displayMessages.map((msg, idx) => (
              <Box key={idx} alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'} maxW="80%">
                <HStack spacing={2} align="flex-start">
                  {msg.role === 'assistant' && (
                    <Avatar 
                      size="sm" 
                      name="AI Assistant" 
                      bg="purple.600"
                      color="white"
                      fontWeight="bold"
                    >
                      AA
                    </Avatar>
                  )}
                  <Box>
                    <Box
                      bg={msg.role === 'user' ? 'blue.600' : 'gray.800'}
                      color="white"
                      borderRadius="xl"
                      px={4}
                      py={2}
                      boxShadow={msg.role === 'assistant' ? '0 0 5px rgba(138, 110, 255, 0.3)' : undefined}
                    >
                      <Text>{msg.content}</Text>
                    </Box>
                    <Text fontSize="xs" color="gray.500" textAlign={msg.role === 'user' ? 'right' : 'left'} mt={1}>
                      {formatTime(msg.timestamp)}
                    </Text>
                  </Box>
                  {msg.role === 'user' && (
                    <Avatar 
                      size="sm" 
                      name="User"
                      bg="blue.600"
                      color="white"
                      fontWeight="bold"
                    >
                      U
                    </Avatar>
                  )}
                </HStack>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>
      )}

      {/* Status indicator */}
      {(isListening || isSpeaking || isLoading) && (
        <Flex justify="center" py={2}>
          <Badge 
            colorScheme={isListening ? "purple" : "blue"} 
            px={3} 
            py={1} 
            borderRadius="full" 
            display="flex" 
            alignItems="center"
          >
            <Box 
              as="span" 
              w={2} 
              h={2} 
              bg={isListening ? "purple.400" : "blue.400"} 
              borderRadius="full" 
              mr={2} 
              sx={{
                animation: `${pulseAnimation} 1.5s infinite`
              }}
            />
            {statusText || (isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Processing...")}
          </Badge>
        </Flex>
      )}

      {/* Input area */}
      <Flex 
        as="form"
        onSubmit={handleInputSubmit}
      >
        <InputGroup size="lg">
          <Input
            placeholder="You can type here"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            bg="rgba(20, 20, 35, 0.6)"
            color="white"
            borderRadius="full"
            border="none"
            _placeholder={{ color: "gray.500" }}
            pr="4.5rem"
            h="60px"
            fontSize="md"
            disabled={isListening || isSpeaking || isLoading}
            backdropFilter="blur(10px)"
          />
          <InputRightElement width="4.5rem" h="60px">
            <IconButton
              h="45px"
              w="45px"
              borderRadius="full"
              aria-label="Voice control"
              icon={<FaMicrophone />}
              colorScheme={isListening ? "red" : "purple"}
              onClick={isListening ? stopRecording : startRecording}
              isDisabled={isSpeaking || isLoading}
              bg={isListening ? "red.500" : "purple.500"}
              _hover={{ bg: isListening ? "red.600" : "purple.600" }}
              sx={{
                animation: isListening ? `${glowAnimation} 2s infinite` : undefined
              }}
            />
          </InputRightElement>
        </InputGroup>
      </Flex>

      {/* Brain icon in bottom right */}
      <Box
        position="absolute"
        bottom="20px"
        right="20px"
        color="rgba(138, 110, 255, 0.8)"
      >
        {/* Use any brain icon you have available */}
        <Box as="span" fontSize="2xl">
          🧠
        </Box>
      </Box>
    </Box>
  );
};

export default VoiceChat;