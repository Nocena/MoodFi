// src/components/camera/VibeCheckResult.tsx
import React from 'react';
import {
    Badge,
    Box,
    HStack,
    Text,
    VStack
} from '@chakra-ui/react';
import { MOOD_TYPE } from '../../types';
import { formatEmotion, getEmotionEmoji } from '../../utils/faceVerification';

interface VibeCheckResultType {
    requestedEmotion?: string;
    dominantEmotion: string;
    matchScore: number;
    passed: boolean;
    message: string;
}

interface VibeCheckResultProps {
    dailyMood: any;
    detectedMood: MOOD_TYPE;
    vibeCheckResult: VibeCheckResultType;
}

const VibeCheckResult: React.FC<VibeCheckResultProps> = ({
    dailyMood,
    detectedMood,
    vibeCheckResult
}) => {
    return (
        <Box 
            bg="gray.100" 
            p={4} 
            borderRadius="md"
            border="1px solid"
            borderColor={vibeCheckResult.passed ? "green.200" : "orange.200"}
        >
            <VStack spacing={2}>
                {/* Mood comparison */}
                <HStack>
                    <Text fontWeight="bold">Challenge:</Text>
                    <Text>{formatEmotion(dailyMood.mood.toLowerCase())} {getEmotionEmoji(dailyMood.mood.toLowerCase())}</Text>
                    <Text fontWeight="bold">→</Text>
                    <Text>You: {formatEmotion(detectedMood.toLowerCase())} {getEmotionEmoji(detectedMood.toLowerCase())}</Text>
                </HStack>
                
                {/* Result message */}
                <Text 
                    fontWeight="bold" 
                    color={vibeCheckResult.passed ? "green.500" : "orange.500"}
                >
                    {vibeCheckResult.message}
                </Text>
                
                {/* Match score badge */}
                <Badge 
                    alignSelf="center"
                    colorScheme={
                        vibeCheckResult.matchScore > 80 ? "green" : 
                        vibeCheckResult.matchScore > 50 ? "yellow" : "orange"
                    }
                >
                    VIBE MATCH: {vibeCheckResult.matchScore}%
                </Badge>
                
                {/* Reward badges */}
                {dailyMood.mood === detectedMood ? (
                    <Badge colorScheme="green" alignSelf="center">
                        Perfect Match! 🎯 +50 $NOCX
                    </Badge>
                ) : vibeCheckResult.matchScore > 70 ? (
                    <Badge colorScheme="green" alignSelf="center">
                        Great Match! +30 $NOCX
                    </Badge>
                ) : vibeCheckResult.matchScore > 40 ? (
                    <Badge colorScheme="yellow" alignSelf="center">
                        Good Try! +15 $NOCX
                    </Badge>
                ) : null}
            </VStack>
        </Box>
    );
};

export default VibeCheckResult;