// src/components/camera/MoodAnalysisModal.tsx
import React from 'react';
import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Textarea,
    Text,
    VStack,
    Box,
    Badge,
    HStack,
    Flex
} from '@chakra-ui/react';
import { MOOD_TYPE } from '../../types';
import ResultsSummary from './ResultsSummary';

interface VibeCheckResultType {
    requestedEmotion?: string;
    dominantEmotion: string;
    matchScore: number;
    passed: boolean;
    message: string;
}

interface MoodAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    detectedMood: MOOD_TYPE | null;
    confidenceScore: number;
    vibeCheckResult: VibeCheckResultType | null;
    dailyMood: any;
    rewardAmount: number;
    description: string;
    onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onRetake: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    isTrainingMode?: boolean;
}

const MoodAnalysisModal: React.FC<MoodAnalysisModalProps> = ({
    isOpen,
    onClose,
    detectedMood,
    confidenceScore,
    vibeCheckResult,
    dailyMood,
    rewardAmount,
    description,
    onDescriptionChange,
    onRetake,
    onSubmit,
    isSubmitting,
    isTrainingMode = false
}) => {
    // Helper functions for emoji and formatting
    const getMoodEmoji = (mood: string) => {
        const moods: Record<string, string> = {
            'sad': '😢',
            'happy': '😊',
            'angry': '😠',
            'surprised': '😲',
            'neutral': '😐',
            'disgusted': '🤢',
            'fearful': '😨'
        };
        return moods[mood.toLowerCase()] || '❓';
    };

    const formatEmotion = (emotion: string) => {
        return emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Mood Analysis Results</ModalHeader>
                <ModalCloseButton/>

                <ModalBody>
                    <VStack spacing={6} align="stretch">
                        {/* Detected mood & confidence display */}
                        <ResultsSummary 
                            detectedMood={detectedMood} 
                            confidenceScore={confidenceScore} 
                        />
                        
                        {/* Vibe check results */}
                        {dailyMood && detectedMood && vibeCheckResult && (
                            <Box 
                                borderWidth="1px" 
                                borderColor="orange.200" 
                                borderRadius="md" 
                                p={4} 
                                bg="orange.50"
                            >
                                <Flex align="center" justify="center" mb={2}>
                                    <Text fontWeight="medium">Challenge: {formatEmotion(dailyMood.mood.toLowerCase())} {getMoodEmoji(dailyMood.mood.toLowerCase())}</Text>
                                    <Text mx={2}>→</Text>
                                    <Text fontWeight="medium">You: {formatEmotion(detectedMood.toLowerCase())} {getMoodEmoji(detectedMood.toLowerCase())}</Text>
                                </Flex>
                                
                                <Text 
                                    fontWeight="bold" 
                                    textAlign="center" 
                                    color="orange.500"
                                    mb={2}
                                >
                                    {vibeCheckResult.passed 
                                        ? `Great job showing ${formatEmotion(dailyMood.mood.toLowerCase())}!` 
                                        : `Try to look more ${dailyMood.mood.toLowerCase()}! ${getMoodEmoji(dailyMood.mood.toLowerCase())}`
                                    }
                                </Text>
                                
                                <Box textAlign="center">
                                    <Badge colorScheme={vibeCheckResult.matchScore > 70 ? "green" : "orange"}>
                                        VIBE MATCH: {vibeCheckResult.matchScore}%
                                    </Badge>
                                </Box>
                            </Box>
                        )}

                        {/* User comments area - only in regular mode */}
                        {!isTrainingMode && (
                            <Box>
                                <Text mb={2} fontWeight="medium">Share your thoughts:</Text>
                                <Textarea
                                    value={description}
                                    onChange={onDescriptionChange}
                                    placeholder="How are you feeling today?"
                                    rows={4}
                                />
                            </Box>
                        )}
                        
                        {/* Total rewards summary */}
                        <Box 
                            bg="gray.50" 
                            p={3} 
                            borderRadius="md" 
                            textAlign="center"
                            borderWidth="1px"
                            borderColor="gray.200"
                        >
                            <Text fontSize="lg" fontWeight="bold">
                                {isTrainingMode 
                                    ? `Challenge Reward: ${rewardAmount.toFixed(1)} $NOCX`
                                    : `Total Reward: ${rewardAmount.toFixed(1)} $NOCX`
                                }
                            </Text>
                            
                            {isTrainingMode && (
                                <Text fontSize="sm" color="gray.600" mt={1}>
                                    Complete all 10 challenges for bonus rewards!
                                </Text>
                            )}
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onRetake}>
                        Retake
                    </Button>
                    <Button
                        colorScheme={isTrainingMode ? "purple" : "blue"}
                        onClick={onSubmit}
                        isLoading={isSubmitting}
                    >
                        {isTrainingMode 
                            ? vibeCheckResult?.passed 
                                ? "Next Challenge" 
                                : "Try Again"
                            : "Post & Claim Rewards"
                        }
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default MoodAnalysisModal;