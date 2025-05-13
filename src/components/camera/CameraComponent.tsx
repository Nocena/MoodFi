import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { 
  Box, 
  Button, 
  Flex, 
  Text, 
  useColorModeValue, 
  VStack,
  Image,
  Spinner,
  Center,
  Badge,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { Camera, RefreshCw } from 'lucide-react';
import { Mood } from '../../types';
import { useMoodStore } from '../../store/moodStore';

const CameraComponent: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [detectedMood, setDetectedMood] = useState<Mood | null>(null);
  const [showMoodResult, setShowMoodResult] = useState(false);
  
  const { 
    detectMood, 
    submitMood, 
    dailyMood, 
    todaysMoodTaken,
    isProcessing,
  } = useMoodStore();
  
  const toast = useToast();
  
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };
  
  const startCountdown = () => {
    setCountdown(3);
  };
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      capture();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);
  
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setCountdown(null);
      processImage(imageSrc);
    }
  }, [webcamRef]);
  
  const processImage = async (imageUrl: string) => {
    try {
      const mood = await detectMood(imageUrl);
      setDetectedMood(mood);
      setShowMoodResult(true);
      
      // Submit the mood to the store
      await submitMood(mood, imageUrl);
      
      // Check if user has earned a reward
      if (dailyMood?.mood === mood) {
        toast({
          title: "Congratulations!",
          description: "You've matched today's mood and earned a reward!",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your mood",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };
  
  const retake = () => {
    setCapturedImage(null);
    setDetectedMood(null);
    setShowMoodResult(false);
  };
  
  const getMoodColor = (mood: Mood) => {
    switch (mood) {
      case 'happy': return 'yellow';
      case 'sad': return 'blue';
      case 'excited': return 'pink';
      case 'calm': return 'green';
      case 'neutral': return 'gray';
    }
  };
  
  const getMoodEmoji = (mood: Mood) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'excited': return '😃';
      case 'calm': return '😌';
      case 'neutral': return '😐';
    }
  };
  
  if (todaysMoodTaken) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Heading size="md">You've already captured your mood today!</Heading>
          <Text>Come back tomorrow for a new mood challenge.</Text>
        </VStack>
      </Center>
    );
  }
  
  return (
    <Box
      maxW="xl"
      mx="auto"
      p={4}
      borderRadius="lg"
      bg={useColorModeValue('white', 'gray.800')}
      boxShadow="md"
    >
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="bold">
          {dailyMood ? `Today's mood to match: ${dailyMood.mood.charAt(0).toUpperCase() + dailyMood.mood.slice(1)}` : 'Loading today\'s mood...'}
        </Text>
        
        {capturedImage ? (
          <Box position="relative" overflow="hidden" borderRadius="lg">
            <Image
              src={capturedImage}
              alt="Captured"
              borderRadius="lg"
              boxShadow="md"
            />
            
            {isProcessing && (
              <Center
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="rgba(0, 0, 0, 0.5)"
                color="white"
              >
                <VStack spacing={4}>
                  <Spinner size="xl" />
                  <Text>Analyzing your mood...</Text>
                </VStack>
              </Center>
            )}
            
            {showMoodResult && detectedMood && !isProcessing && (
              <Box
                position="absolute"
                bottom={4}
                left={0}
                right={0}
                textAlign="center"
              >
                <Badge
                  fontSize="xl"
                  py={2}
                  px={4}
                  borderRadius="full"
                  colorScheme={getMoodColor(detectedMood)}
                  bg={`${getMoodColor(detectedMood)}.500`}
                  color="white"
                >
                  {getMoodEmoji(detectedMood)} {detectedMood.toUpperCase()}
                </Badge>
                
                {dailyMood?.mood === detectedMood && (
                  <Badge
                    fontSize="md"
                    py={1}
                    px={3}
                    mt={2}
                    borderRadius="full"
                    colorScheme="green"
                  >
                    MATCHED! 🎉
                  </Badge>
                )}
              </Box>
            )}
          </Box>
        ) : (
          <Box
            position="relative"
            overflow="hidden"
            borderRadius="lg"
            boxShadow="md"
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              mirrored
              style={{
                borderRadius: '0.5rem',
              }}
            />
            
            {countdown !== null && (
              <Center
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="rgba(0, 0, 0, 0.5)"
                color="white"
              >
                <Text fontSize="6xl" fontWeight="bold">
                  {countdown}
                </Text>
              </Center>
            )}
          </Box>
        )}
        
        <Flex justify="center" width="100%" gap={4}>
          {capturedImage ? (
            <Button
              leftIcon={<RefreshCw />}
              colorScheme="gray"
              onClick={retake}
              isDisabled={isProcessing}
            >
              Retake
            </Button>
          ) : (
            <Button
              leftIcon={<Camera />}
              colorScheme="brand"
              onClick={startCountdown}
            >
              Capture Mood
            </Button>
          )}
        </Flex>
      </VStack>
    </Box>
  );
};

export default CameraComponent;