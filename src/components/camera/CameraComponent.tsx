// src/components/camera/CameraComponent.tsx
import React, { useState } from 'react';
import {
    Box,
    Center,
    Heading,
    Text,
    useColorModeValue,
    useToast,
    VStack,
    HStack,
    Switch,
    FormControl,
    FormLabel,
} from '@chakra-ui/react';
import { MOOD_TYPE } from '../../types';
import { useMoodStore } from '../../store/moodStore';
import { useLensAuth } from '../../providers/LensAuthProvider';

// Import sub-components
import CameraView from './CameraView';
import ImagePreview from './ImagePreview';
import MoodAnalysisModal from './MoodAnalysisModal';
import TrainingMode from './training/TrainingMode';

// Import hooks
import { useFaceDetection } from './hooks/useFaceDetection';
import { useMoodAnalysis } from './hooks/useMoodAnalysis';

const CameraComponent: React.FC = () => {
    // State
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [isTrainingMode, setIsTrainingMode] = useState(false);
    
    // Context and store
    const { client: sessionClient } = useLensAuth();
    const { dailyMood, todayMoodTaken, isProcessing } = useMoodStore();
    
    // Custom hooks
    const { 
        detectedMood, 
        confidenceScore, 
        vibeCheckResult, 
        rewardAmount,
        analyzeMood,
        setDetectedMood,
        setConfidenceScore,
        setVibeCheckResult,
        setRewardAmount
    } = useMoodAnalysis();
    
    const { faceApiLoaded } = useFaceDetection();
    
    // UI helpers
    const toast = useToast();
    const whiteGrayColor = useColorModeValue('white', 'gray.800');
    
    // Toggle between challenge and training mode
    const handleModeToggle = () => {
        setIsTrainingMode(!isTrainingMode);
    };
    
    // Handle image capture
    const handleCapture = async (imageSrc: string, file: File) => {
        setCapturedImage(imageSrc);
        setImageFile(file);
        setIsAnalyzing(true);
        
        try {
            await analyzeMood(imageSrc, dailyMood?.mood);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error analyzing mood:", error);
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
    };
    
    // Handle form submission
    const handleSubmit = async () => {
        if (!detectedMood || !capturedImage || !imageFile || !sessionClient) return;

        try {
            const postDailyMood = (await import('../../utils/lens.utils')).postDailyMood;
            
            const postResult = await postDailyMood(
                sessionClient,
                imageFile,
                detectedMood,
                confidenceScore,
                vibeCheckResult?.matchScore || 0,
                description
            );
            
            if (!postResult)
                throw new Error('Failed to post mood');

            toast({
                title: "Success!",
                description: `Mood posted and ${rewardAmount.toFixed(1)} $NOCX tokens earned!`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            setIsModalOpen(false);
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
    };
    
    // Reset everything
    const handleRetake = () => {
        setCapturedImage(null);
        setImageFile(null);
        setDetectedMood(null);
        setConfidenceScore(0);
        setRewardAmount(0);
        setDescription('');
        setVibeCheckResult(null);
        setIsModalOpen(false);
    };
    
    // If user already submitted today's mood (only applicable in challenge mode)
    if (todayMoodTaken && !isTrainingMode) {
        return (
            <Center py={10}>
                <VStack spacing={4}>
                    <Heading size="md">You've already captured your mood today!</Heading>
                    <Text>Come back tomorrow for a new mood challenge.</Text>
                    <FormControl display="flex" alignItems="center" justifyContent="center" mt={4}>
                        <FormLabel htmlFor="training-mode" mb="0" mr={2}>
                            Try Training Mode?
                        </FormLabel>
                        <Switch 
                            id="training-mode" 
                            colorScheme="purple"
                            onChange={() => setIsTrainingMode(true)}
                        />
                    </FormControl>
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
            {/* Mode toggle switch */}
            <FormControl 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                mb={4}
                borderBottom="1px solid"
                borderColor="gray.200"
                pb={3}
            >
                <FormLabel htmlFor="training-mode" mb="0" fontSize="sm" fontWeight="medium">
                    Challenge Mode
                </FormLabel>
                <Switch 
                    id="training-mode" 
                    isChecked={isTrainingMode}
                    onChange={handleModeToggle}
                    colorScheme="purple"
                />
                <FormLabel htmlFor="training-mode" mb="0" ml={2} fontSize="sm" fontWeight="medium">
                    Training Mode
                </FormLabel>
            </FormControl>
            
            {/* Main content area - show training mode or regular challenge mode */}
            {isTrainingMode ? (
                <TrainingMode onClose={() => setIsTrainingMode(false)} />
            ) : (
                <>
                    {capturedImage ? (
                        <ImagePreview 
                            imageUrl={capturedImage}
                            isAnalyzing={isAnalyzing || isProcessing}
                            onRetake={handleRetake}
                        />
                    ) : (
                        <CameraView 
                            dailyMood={dailyMood}
                            onCapture={handleCapture}
                            isTrainingMode={false}
                        />
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