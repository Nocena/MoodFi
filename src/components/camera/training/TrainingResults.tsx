// src/components/camera/training/TrainingResults.tsx
import React from 'react';
import {Badge, Box, Button, Divider, HStack, Text, VStack} from '@chakra-ui/react';

interface TrainingResultsProps {
    correctChallenges: number;
    totalChallenges: number;
    timeRemaining: number;
    score: number;
    bonusReward: number;
    perfectMatchCount: number;
    goodMatchCount: number;
    onReset: () => void;
    onClose: () => void;
}

const TrainingResults: React.FC<TrainingResultsProps> = ({
    correctChallenges,
    totalChallenges,
    timeRemaining,
    perfectMatchCount,
    goodMatchCount,
    onReset,
    onClose
}) => {
    // const bgColor = useColorModeValue('white', 'gray.800');
    // const borderColor = useColorModeValue('gray.200', 'gray.700');
    
    // Calculate accuracy percentage
    const accuracy = Math.round((correctChallenges / totalChallenges) * 100);
    
    // Determine performance level
    const getPerformanceLevel = () => {
        if (accuracy >= 90) return { label: 'Master', color: 'green' };
        if (accuracy >= 70) return { label: 'Expert', color: 'blue' };
        if (accuracy >= 50) return { label: 'Intermediate', color: 'yellow' };
        return { label: 'Novice', color: 'orange' };
    };
    
    const performance = getPerformanceLevel();
    
    // Mock detected mood for ResultsSummary
    // const mockDetectedMood: MOOD_TYPE = "happy";
    // const mockConfidenceScore = 95;
    
    return (
        <VStack spacing={6} align="stretch">
            <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" mb={2}>
                    Training Complete!
                </Text>
                <Badge colorScheme={performance.color} fontSize="md" px={3} py={1}>
                    {performance.label} Level
                </Badge>
            </Box>
            
            {/* Result Summary display */}
{/*
            <ResultsSummary
                detectedMood={mockDetectedMood} 
                confidenceScore={mockConfidenceScore} 
            />
*/}

            <Box 
                p={4} 
                borderWidth="1px" 
                borderColor="gray.200" 
                borderRadius="md" 
                bg="gray.50"
            >
                <HStack justify="space-between" mb={3}>
                    <Box>
                        <Text color="gray.600" fontSize="sm">Challenge</Text>
                        <HStack>
                            <Text fontWeight="bold">Accuracy:</Text>
                            <Text>{accuracy}%</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                            {correctChallenges} / {totalChallenges} correct
                        </Text>
                    </Box>
                    
                    <Box>
                        <Text color="gray.600" fontSize="sm">Timing</Text>
                        <HStack>
                            <Text fontWeight="bold">Time Left:</Text>
                            <Text>{timeRemaining}s</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                            +{timeRemaining * 2} bonus points
                        </Text>
                    </Box>
                </HStack>
                
                <Divider my={3} />
                
                <Box textAlign="center">
                    <Text fontSize="xl" fontWeight="bold" color="purple.500">
                        Total Score
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                        {perfectMatchCount} perfect matches, {goodMatchCount} good matches
                    </Text>
                </Box>
            </Box>
            
            <HStack spacing={4}>
                <Button
                    leftIcon={<RepeatIcon />}
                    colorScheme="purple"
                    flex={1}
                    onClick={onReset}
                >
                    Train Again
                </Button>
                
                <Button
                    variant="outline"
                    colorScheme="purple"
                    flex={1}
                    onClick={onClose}
                >
                    Exit Training
                </Button>
            </HStack>
        </VStack>
    );
};

// Repeat icon component for button
const RepeatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m17 2 4 4-4 4"></path>
        <path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
        <path d="m7 22-4-4 4-4"></path>
        <path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
    </svg>
);

export default TrainingResults;