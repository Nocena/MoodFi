import React, {useCallback, useEffect, useRef, useState} from 'react';
import Webcam from 'react-webcam';
import {
  Badge,
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import {Camera, RefreshCw, Upload} from 'lucide-react';
import {Mood} from '../../types';
import {useMoodStore} from '../../store/moodStore';

const CameraComponent: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [detectedMood, setDetectedMood] = useState<Mood | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      analyzeMood(imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setCapturedImage(imageUrl);
        analyzeMood(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMood = async (imageUrl: string) => {
    setIsAnalyzing(true);

    try {
      const mood = await detectMood(imageUrl);
      setDetectedMood(mood);

      // Calculate confidence score (70-99%)
      const score = Math.floor(Math.random() * 30) + 70;
      setConfidenceScore(score);

      // Calculate reward
      const baseReward = score / 10;
      const matchBonus = dailyMood?.mood === mood ? 50 : 0;
      const totalReward = baseReward + matchBonus;
      setRewardAmount(totalReward);

      setIsModalOpen(true);
      setIsAnalyzing(false);

    } catch (error) {
      console.log("error", error)
      toast({
        title: "Error",
        description: "Failed to analyze your mood",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!detectedMood || !capturedImage) return;

    try {
      await submitMood(detectedMood, capturedImage);

      toast({
        title: "Success!",
        description: `Mood posted and ${rewardAmount.toFixed(1)} $MOOD tokens earned!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setIsModalOpen(false);

    } catch (error) {
      console.log("error", error)
      toast({
        title: "Error",
        description: "Failed to post mood",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setDetectedMood(null);
    setConfidenceScore(0);
    setRewardAmount(0);
    setDescription('');
    setIsModalOpen(false);
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

  const whiteGrayColor = useColorModeValue('white', 'gray.800')

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
          bg={whiteGrayColor}
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

                {(isAnalyzing || isProcessing) && (
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

          {!capturedImage && (
              <HStack spacing={4} width="100%">
                <Button
                    leftIcon={<Camera />}
                    colorScheme="brand"
                    flex={1}
                    onClick={startCountdown}
                >
                  Take Photo
                </Button>

                <Button
                    leftIcon={<Upload />}
                    colorScheme="brand"
                    variant="outline"
                    flex={1}
                    onClick={() => fileInputRef.current?.click()}
                >
                  Upload Photo
                </Button>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
              </HStack>
          )}

          {capturedImage && !isAnalyzing && !isModalOpen && (
              <Button
                  leftIcon={<RefreshCw />}
                  variant="outline"
                  onClick={retake}
              >
                Take Another Photo
              </Button>
          )}
        </VStack>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Mood Analysis Results</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <VStack spacing={6} align="stretch">
                <HStack justify="center" spacing={4}>
                  <Badge
                      fontSize="xl"
                      py={2}
                      px={4}
                      borderRadius="full"
                      colorScheme={detectedMood ? getMoodColor(detectedMood) : 'gray'}
                  >
                    {detectedMood && getMoodEmoji(detectedMood)} {detectedMood?.toUpperCase()}
                  </Badge>

                  <Badge
                      fontSize="xl"
                      py={2}
                      px={4}
                      borderRadius="full"
                      colorScheme="purple"
                  >
                    {confidenceScore}% Confidence
                  </Badge>
                </HStack>
                {dailyMood?.mood === detectedMood && (
                    <Badge alignSelf="center" colorScheme="green" fontSize="md" px={4} py={1}>
                      Perfect Match! 🎯 +50 $MOOD Bonus
                    </Badge>
                )}

                <Box>
                  <Text mb={2} fontWeight="medium">Share your thoughts:</Text>
                  <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="How are you feeling today?"
                      rows={4}
                  />
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={retake}>
                Retake
              </Button>
              <Button
                  colorScheme="brand"
                  onClick={handleSubmit}
                  isLoading={isProcessing}
              >
                Post & Claim Rewards
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
  );
};

export default CameraComponent;