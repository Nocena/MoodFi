// src/components/camera/training/TrainingMode.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, VStack, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, useToast
} from '@chakra-ui/react';

import CameraView from '../CameraView';
import TrainingController from './TrainingController';
import TrainingResults from './TrainingResults';
import TrainingModeInfo from './TrainingModeInfo';

import useTrainingMode from './hooks/useTrainingMode';

const VALID_TRAINING_EMOTIONS = ['HAPPY', 'SAD', 'ANGRY', 'SURPRISED'];

interface TrainingModeProps {
  onClose: () => void;
}

const TrainingMode: React.FC<TrainingModeProps> = ({ onClose }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [currentDetectedEmotion, setCurrentDetectedEmotion] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [perfectMatches, setPerfectMatches] = useState(0);
  const [goodMatches, setGoodMatches] = useState(0);

  const toast = useToast();

  const {
    isActive, isComplete, timeRemaining, score,
    correctChallenges, bonusReward, currentChallenge,
    totalChallenges, startTraining, stopTraining,
    nextChallenge, resetTraining
  } = useTrainingMode();

  const pickNextEmotion = useCallback(() => {
    const next = VALID_TRAINING_EMOTIONS[Math.floor(Math.random() * VALID_TRAINING_EMOTIONS.length)];
    setCurrentEmotion(next);
  }, []);

  useEffect(() => {
    if (isComplete) {
      setTimeout(() => {
        setIsResultsModalOpen(true);
      }, 100);
    }
  }, [isComplete]);

  useEffect(() => {
    if (isActive && timeRemaining <= 0) stopTraining();
  }, [isActive, timeRemaining, stopTraining]);

  useEffect(() => {
    if (isActive && currentChallenge > totalChallenges) stopTraining();
  }, [isActive, currentChallenge, totalChallenges, stopTraining]);

  const handleStartTraining = () => {
    setCurrentDetectedEmotion(null);
    startTraining();
    pickNextEmotion();
  };

  const handleDetectionUpdate = (emotion: string) => setCurrentDetectedEmotion(emotion);

  const handleEmotionDetected = (emotion: string, matchScore: number) => {
    if (!isActive || !currentEmotion) return;
    const isMatch = emotion.toUpperCase() === currentEmotion.toUpperCase();

    if (isMatch) {
      setMatchCount((prev) => prev + 1);
      if (matchScore > 85) {
        setPerfectMatches((prev) => prev + 1);
      } else {
        setGoodMatches((prev) => prev + 1);
      }

      toast({
        title: "Emotion matched!",
        description: `Great job showing ${currentEmotion.toLowerCase()}!`,
        status: "success",
        duration: 1500,
        isClosable: true,
      });

      if (matchCount < 9) {
        nextChallenge(true);
        pickNextEmotion();
      } else {
        nextChallenge(true);
        stopTraining();
      }
    }
  };

  const handleCapture = async (imageSrc: string, file: File) => {
    if (!isActive || !currentEmotion) return;
    setCapturedImage(imageSrc);
    setImageFile(file);
  };

  const handleTrainingReset = () => {
    setIsResultsModalOpen(false);
    resetTraining();
    setCurrentDetectedEmotion(null);
    setCurrentEmotion(null);
    setMatchCount(0);
    setPerfectMatches(0);
    setGoodMatches(0);
  };

  const handleTrainingExit = () => {
    setIsResultsModalOpen(false);
    resetTraining();
    setCurrentDetectedEmotion(null);
    setCurrentEmotion(null);
    setMatchCount(0);
    setPerfectMatches(0);
    setGoodMatches(0);
    onClose();
  };

  const mockDailyMood = currentEmotion ? { mood: currentEmotion } : null;

  return (
    <Box>
      <VStack spacing={4}>
        <TrainingController
          isActive={isActive}
          currentChallenge={currentChallenge}
          totalChallenges={totalChallenges}
          timeRemaining={timeRemaining}
          startTraining={handleStartTraining}
        />

        {!isActive && <TrainingModeInfo />}

        {isActive && (
          <CameraView
            dailyMood={mockDailyMood}
            onCapture={handleCapture}
            isTrainingMode={true}
            onEmotionDetected={handleEmotionDetected}
            onDetectionUpdate={handleDetectionUpdate}
            currentDetectedEmotion={currentDetectedEmotion}
          />
        )}

        <Modal isOpen={isResultsModalOpen} onClose={handleTrainingExit} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Training Results</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <TrainingResults
                correctChallenges={correctChallenges}
                totalChallenges={totalChallenges}
                timeRemaining={timeRemaining}
                score={score}
                bonusReward={bonusReward}
                onReset={handleTrainingReset}
                onClose={handleTrainingExit}
                perfectMatchCount={perfectMatches}
                goodMatchCount={goodMatches}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default TrainingMode;
