// src/components/camera/CameraComponent.tsx
import React, {useEffect, useState} from 'react';
import {
    Box,
    Center,
    FormControl,
    FormLabel,
    Heading, Skeleton, SkeletonText,
    Switch,
    Text,
    useColorModeValue,
    useToast,
    VStack,
} from '@chakra-ui/react';
import {useLensAuth} from '../../providers/LensAuthProvider';

// Import sub-components
import CameraView from './CameraView';
import ImagePreview from './ImagePreview';
import MoodAnalysisModal from './MoodAnalysisModal';
import TrainingMode from './training/TrainingMode';

// Import hooks
import {useMoodAnalysis} from './hooks/useMoodAnalysis';
import {getNOCXReward, postDailyMood} from "../../utils/lens.utils";
import {useDailyMoodStore} from "../../store/dailyMoodStore";
import {useAccount} from "wagmi";

const CameraComponent: React.FC = () => {
    const { address: walletAddress } = useAccount()
    // State
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [isTrainingMode, setIsTrainingMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Context and store
    const {client: sessionClient, currentAccount} = useLensAuth();
    const {dailyMood, todayMoodTaken, refreshUserPosts, isLoadingUserPosts, setTodayMoodTaken} = useDailyMoodStore();

    useEffect(() => {
        if (currentAccount) {
            refreshUserPosts(sessionClient, currentAccount.accountAddress)
        }
    }, [sessionClient, currentAccount, refreshUserPosts])

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
        if (!detectedMood || !capturedImage || !imageFile || !sessionClient || !walletAddress) return;
        setIsSubmitting(true)
        try {
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

            await getNOCXReward(rewardAmount, walletAddress)
            toast({
                title: "Success!",
                description: `Mood posted and ${rewardAmount.toFixed(1)} $NOCX tokens earned!`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            setIsModalOpen(false);

            setTodayMoodTaken(true)
            // refresh values
            if (currentAccount) {
                refreshUserPosts(sessionClient, currentAccount.accountAddress)
            }
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
        setIsSubmitting(false)
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
    const bgWhiteGray = useColorModeValue('white', 'gray.800')

    if (isLoadingUserPosts) {
        return (
            <Box
                borderRadius="lg"
                overflow="hidden"
                bg={bgWhiteGray}
                boxShadow="md"
            >
                <Skeleton height="300px"/>
                <Box p={4}>
                    <SkeletonText mt="4" noOfLines={2} spacing="4"/>
                </Box>
            </Box>
        )
    }

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
                <TrainingMode onClose={() => setIsTrainingMode(false)}/>
            ) : (
                <>
                    {capturedImage ? (
                        <ImagePreview
                            imageUrl={capturedImage}
                            isAnalyzing={isAnalyzing}
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
                isSubmitting={isSubmitting}
                isTrainingMode={false}
            />
        </Box>
    );
};

export default CameraComponent;