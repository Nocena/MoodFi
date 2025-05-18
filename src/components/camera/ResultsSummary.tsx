// src/components/camera/ResultsSummary.tsx
import React from 'react';
import {
    Badge,
    HStack,
    Text
} from '@chakra-ui/react';
import { MOOD_TYPE } from '../../types';
import { getMoodColor, getMoodEmoji } from '../../utils/common.utils';

interface ResultsSummaryProps {
    detectedMood: MOOD_TYPE | null;
    confidenceScore: number;
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({
    detectedMood,
    confidenceScore
}) => {
    // Helper function to get appropriate color based on confidence
    const getConfidenceColor = (score: number) => {
        if (score >= 90) return 'purple';
        if (score >= 70) return 'purple';
        if (score >= 50) return 'yellow';
        return 'orange';
    };
    
    // Helper function to get mood emoji
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

    return (
        <HStack justify="center" spacing={4}>
            {/* Detected mood badge */}
            <Badge
                fontSize="lg"
                py={2}
                px={4}
                borderRadius="full"
                bg="gray.100"
                color="gray.800"
                fontWeight="bold"
            >
                {detectedMood?.toUpperCase()} {detectedMood && getMoodEmoji(detectedMood)}
            </Badge>

            {/* Confidence score badge */}
            <Badge
                fontSize="lg"
                py={2}
                px={4}
                borderRadius="full"
                bg="purple.100"
                color="purple.800"
                fontWeight="bold"
            >
                {confidenceScore}% CONFIDENCE
            </Badge>
        </HStack>
    );
};

export default ResultsSummary;