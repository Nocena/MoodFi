// src/components/camera/CameraComponent.tsx
import React, { useState, useCallback, Suspense } from 'react';
import {
  Box, Center, Heading, Text, useColorModeValue, useToast, VStack,
  FormControl, FormLabel, Switch, Spinner,
} from '@chakra-ui/react';
import { MOOD_TYPE } from '../../types';
import { useMoodStore } from '../../store/moodStore';
import { useLensAuth } from '../../providers/LensAuthProvider';
import CameraView from './CameraView';
import ImagePreview from './ImagePreview';
import MoodAnalysisModal from './MoodAnalysisModal';

// Lazy load TrainingMode
const TrainingMode = React.lazy(() => import('./training/TrainingMode'));

const CameraComponent: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [detectedMood, setDetectedMood] = useState<MOOD_TYPE | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [vibeCheckResult, setVibeCheckResult] = useState<any>(null);
  const [rewardAmount, setRewardAmount] = useState<number>(0);

  const { client: sessionClient } = useLensAuth();
  const { dailyMood, todayMoodTaken, isProcessing, detectMood } = useMoodStore();
  const toast = useToast();
  const whiteGrayColor = useColorModeValue('white', 'gray.800');

  const handleModeToggle = () => {
    setIsTrainingMode(!isTrainingMode);
    if (capturedImage) handleRetake();
  };

  const analyzeMood = useCallback(async (imageSrc: string) => {
    try {
      const mood = await detectMood(imageSrc);
      setDetectedMood(mood);

      const { verifyFace } = await import('../../utils/faceVerification');
      const img = document.createElement('img');
      img.src = imageSrc;
      await new Promise((res) => (img.onload = res));

      const verificationResult = await verifyFace(img, dailyMood?.mood || '');
      if (verificationResult?.vibeCheck) {
        const { dominantEmotion, matchScore, detectedEmotions } = verificationResult.vibeCheck;
        const isMatch = dominantEmotion.toLowerCase() === (dailyMood?.mood || '').toLowerCase();
        const threshold = 70;
        const passed = isMatch && matchScore > threshold;

        setVibeCheckResult({
          requestedEmotion: dailyMood?.mood,
          dominantEmotion,
          matchScore,
          passed,
          message: passed
            ? `Great job showing ${dominantEmotion}!`
            : `Try to look more ${dailyMood?.mood?.toLowerCase() || ''}!`,
          allEmotions: detectedEmotions,
        });

        const baseScore = Math.max(70, Math.min(99, matchScore));
        setConfidenceScore(baseScore);
        const baseReward = baseScore / 10;
        const matchBonus = isMatch ? 50 : 0;
        setRewardAmount(baseReward + matchBonus);
      }

      return mood;
    } catch (error) {
      console.error("Error in analyzeMood:", error);
      throw error;
    }
  }, [detectMood, dailyMood]);

  const handleCapture = useCallback(async (imageSrc: string, file: File) => {
    setCapturedImage(imageSrc);
    setImageFile(file);
    setIsAnalyzing(true);

    try {
      await analyzeMood(imageSrc);
      setIsModalOpen(true);
    } catch {
      toast({
        title: "Error",
        description: "Failed to analyze your mood",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeMood, toast]);

  const handleSubmit = useCallback(async () => {
    if (!detectedMood || !capturedImage || !imageFile || !sessionClient) {
      toast({
        title: "Error",
        description: "Missing required data for submission",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const { postDailyMood } = await import('../../utils/lens.utils');
      const postResult = await postDailyMood(
        sessionClient,
        imageFile,
        detectedMood,
        confidenceScore,
        vibeCheckResult?.matchScore || 0,
        description
      );

      if (!postResult) throw new Error('Failed to post mood');

      toast({
        title: "Success!",
        description: `Mood posted and ${rewardAmount.toFixed(1)} $NOCX tokens earned!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setIsModalOpen(false);
      handleRetake();
    } catch (error) {
      console.error("Error posting mood:", error);
      toast({
        title: "Error",
        description: "Failed to post mood",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [detectedMood, capturedImage, imageFile, sessionClient, confidenceScore, vibeCheckResult, description, rewardAmount, toast]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setImageFile(null);
    setDetectedMood(null);
    setConfidenceScore(0);
    setRewardAmount(0);
    setDescription('');
    setVibeCheckResult(null);
    setIsModalOpen(false);
  }, []);

  if (todayMoodTaken && !isTrainingMode) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Heading size="md">You've already captured your mood today!</Heading>
          <Text>Come back tomorrow for a new mood challenge.</Text>
          <FormControl display="flex" alignItems="center" justifyContent="center" mt={4}>
            <FormLabel htmlFor="training-mode" mb="0" mr={2}>Try Training Mode?</FormLabel>
            <Switch id="training-mode" colorScheme="purple" onChange={() => setIsTrainingMode(true)} />
          </FormControl>
        </VStack>
      </Center>
    );
  }

  return (
    <Box maxW="xl" mx="auto" p={4} borderRadius="lg" bg={whiteGrayColor} boxShadow="md">
      <FormControl display="flex" alignItems="center" justifyContent="center" mb={4} borderBottom="1px solid" borderColor="gray.200" pb={3}>
        <FormLabel htmlFor="training-mode" mb="0" fontSize="sm" fontWeight="medium">Challenge Mode</FormLabel>
        <Switch id="training-mode" isChecked={isTrainingMode} onChange={handleModeToggle} colorScheme="purple" />
        <FormLabel htmlFor="training-mode" mb="0" ml={2} fontSize="sm" fontWeight="medium">Training Mode</FormLabel>
      </FormControl>

      {isTrainingMode ? (
        <Suspense fallback={<Center py={10}><VStack><Spinner size="xl" /><Text mt={4}>Loading training mode...</Text></VStack></Center>}>
          <TrainingMode onClose={() => setIsTrainingMode(false)} />
        </Suspense>
      ) : (
        <>
          {capturedImage ? (
            <ImagePreview imageUrl={capturedImage} isAnalyzing={isAnalyzing || isProcessing} onRetake={handleRetake} />
          ) : (
            <CameraView dailyMood={dailyMood} onCapture={handleCapture} isTrainingMode={false} />
          )}
        </>
      )}

      <MoodAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        detectedMood={detectedMood}
        confidenceScore={confidenceScore}
        vibeCheckResult={vibeCheckResult}
        dailyMood={dailyMood}
        rewardAmount={rewardAmount}
        description={description}
        onDescriptionChange={(e) => setDescription(e.target.value)}
        onRetake={handleRetake}
        onSubmit={handleSubmit}
        isSubmitting={isProcessing}
        isTrainingMode={false}
      />
    </Box>
  );
};

export default CameraComponent;
