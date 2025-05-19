import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    VStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useToast
} from '@chakra-ui/react';

// Import components
import CameraView from '../CameraView';
import TrainingController from './TrainingController';
import TrainingResults from './TrainingResults';
import TrainingModeInfo from './TrainingModeInfo';

// Import hooks
import useTrainingMode from './hooks/useTrainingMode';

// Define valid training emotions (excluding NEUTRAL)
const VALID_TRAINING_EMOTIONS = [
    'HAPPY',
    'SAD',
    'ANGRY',
    'SURPRISED',
];

interface TrainingModeProps {
    onClose: () => void;
}

const TrainingMode: React.FC<TrainingModeProps> = ({ onClose }) => {
    // const [capturedImage, setCapturedImage] = useState<string | null>(null);
    // const [imageFile, setImageFile] = useState<File | null>(null);
    const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
    const [currentDetectedEmotion, setCurrentDetectedEmotion] = useState<string | null>(null);
    const [matchCount, setMatchCount] = useState(0);
    const [perfectMatches, setPerfectMatches] = useState(0);
    const [goodMatches, setGoodMatches] = useState(0);// src/components/camera/training/TrainingMode.tsx

    const toast = useToast();

    const {
        isActive,
        isComplete,
        timeRemaining,
        score,
        correctChallenges,
        bonusReward,
        currentChallenge,
        totalChallenges,
        startTraining,
        stopTraining,
        nextChallenge,
        resetTraining
    } = useTrainingMode();

    const mockDailyMood = currentEmotion ? { mood: currentEmotion } : null;

    const pickNextEmotion = useCallback(() => {
        const next = VALID_TRAINING_EMOTIONS[Math.floor(Math.random() * VALID_TRAINING_EMOTIONS.length)];
        setCurrentEmotion(next);
        console.log(`[Emotion] New challenge picked: ${next}`);
    }, []);

    useEffect(() => {
        console.log("[Effect] isComplete changed:", isComplete);
        if (isComplete) {
            console.log("[Effect] Training complete! Showing results modal...");
            setTimeout(() => {
                console.log("[Effect] Opening modal now...");
                setIsResultsModalOpen(true);
            }, 100);
        }
    }, [isComplete]);

    useEffect(() => {
        if (isActive && timeRemaining <= 0) {
            console.log("[Timer] Time's up, stopping training");
            stopTraining();
        }
    }, [isActive, timeRemaining, stopTraining]);

    useEffect(() => {
        if (isActive && currentChallenge > totalChallenges) {
            console.log("[Challenge] All challenges completed, stopping training");
            stopTraining();
        }
    }, [isActive, currentChallenge, totalChallenges, stopTraining]);

    const handleStartTraining = useCallback(() => {
        console.log("[Action] Start training clicked");
        setCurrentDetectedEmotion(null);
        startTraining();
        pickNextEmotion();
    }, [startTraining]);

    const handleDetectionUpdate = useCallback((emotion: string) => {
        setCurrentDetectedEmotion(emotion);
    }, []);

    const handleEmotionDetected = useCallback(async (emotion: string, matchScore: number) => {
        if (!isActive || !currentEmotion) return;
        console.log(`[Detection] Detected: ${emotion}, Required: ${currentEmotion}`);
        const isMatch = emotion.toUpperCase() === currentEmotion.toUpperCase();
        if (isMatch) {
            // Increment match count
            setMatchCount(prev => prev + 1);
            
            // Categorize match quality based on score
            if (matchScore > 85) {
                setPerfectMatches(prev => prev + 1);
            } else {
                setGoodMatches(prev => prev + 1);
            }
            
            toast({
                title: "Emotion matched!",
                description: `Great job showing ${currentEmotion.toLowerCase()}!`,
                status: "success",
                duration: 1500,
                isClosable: true,
            });
            
            console.log("[Match] Emotion matched! Advancing to next challenge.");
            console.log(`[Match] Current match count: ${matchCount + 1}`);
            
            // Only advance to next challenge if we haven't reached 10 matches
            if (matchCount < 9) {
                nextChallenge(true);
                pickNextEmotion();
            } else {
                // This was the 10th match, complete the training
                nextChallenge(true);
                stopTraining();
            }
        } else {
            console.log("[Match] Emotion did not match.");
        }
    }, [isActive, currentEmotion, nextChallenge, toast, pickNextEmotion, matchCount, stopTraining]);

    const handleCapture = async (/*imageSrc: string, file: File*/) => {
        if (!isActive || !currentEmotion) return;
        // setCapturedImage(imageSrc);
        // setImageFile(file);
    };

    const handleTrainingReset = () => {
        console.log('[Action] Training reset');
        setIsResultsModalOpen(false);
        resetTraining();
        setCurrentDetectedEmotion(null);
        setCurrentEmotion(null);
        setMatchCount(0);
        setPerfectMatches(0);
        setGoodMatches(0);
    };

    const handleTrainingExit = () => {
        console.log('[Action] Training exit');
        setIsResultsModalOpen(false);
        resetTraining();
        setCurrentDetectedEmotion(null);
        setCurrentEmotion(null);
        setMatchCount(0);
        setPerfectMatches(0);
        setGoodMatches(0);
        onClose();
    };

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

                <Modal 
                    isOpen={isResultsModalOpen} 
                    onClose={handleTrainingExit}
                    size="lg"
                >
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