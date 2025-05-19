// src/components/camera/training/TrainingController.tsx
import React from 'react';
import { Box, Button, HStack, Text, VStack, Progress, Badge } from '@chakra-ui/react';
import { Play, Clock } from 'lucide-react';

interface TrainingControllerProps {
    isActive: boolean;
    currentChallenge: number;
    totalChallenges: number;
    timeRemaining: number;
    startTraining: () => void;
}

const TrainingController: React.FC<TrainingControllerProps> = ({
    isActive,
    currentChallenge,
    totalChallenges,
    timeRemaining,
    startTraining
}) => {
    // Convert remaining seconds to display format
    const formatTime = (seconds: number): string => {
        return `${seconds}s`;
    };

    // Calculate progress percentage
    const progress = (currentChallenge / totalChallenges) * 100;

    if (!isActive) {
        return (
            <Box 
                p={4} 
                borderRadius="md" 
                bg="purple.50" 
                borderWidth="1px" 
                borderColor="purple.200"
                textAlign="center"
            >
                <VStack spacing={4}>
                    <Text fontWeight="bold" fontSize="lg">
                        Ready for Emotion Training?
                    </Text>
                    <Text>
                        Match 10 emotions in 30 seconds to level up your mood streak!
                    </Text>
                    <Button 
                        leftIcon={<Play />} 
                        colorScheme="purple"
                        onClick={startTraining}
                    >
                        Start Training
                    </Button>
                </VStack>
            </Box>
        );
    }

    return (
        <Box p={3} borderRadius="md" bg="purple.50" borderWidth="1px" borderColor="purple.200">
            <VStack spacing={3}>
                <HStack width="100%" justifyContent="space-between">
                    <Badge colorScheme="purple" fontSize="md">
                        Challenge {currentChallenge}/{totalChallenges}
                    </Badge>
                    <HStack>
                        <Clock size={16} />
                        <Text fontWeight="bold">{formatTime(timeRemaining)}</Text>
                    </HStack>
                </HStack>
                
                <Progress
                    value={progress}
                    colorScheme="purple"
                    size="sm"
                    width="100%"
                    borderRadius="full"
                />
            </VStack>
        </Box>
    );
};

export default TrainingController;