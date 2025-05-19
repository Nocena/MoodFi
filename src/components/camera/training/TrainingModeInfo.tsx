// src/components/camera/training/TrainingModeInfo.tsx
import React from 'react';
import {Box, HStack, Icon, Text, useColorModeValue} from '@chakra-ui/react';
import {AlertCircle, Timer} from 'lucide-react';

const TrainingModeInfo: React.FC = () => {
    const bgColor = useColorModeValue('purple.50', 'purple.900');
    const borderColor = useColorModeValue('purple.200', 'purple.700');
    
    return (
        <Box
            p={3}
            mb={4}
            borderRadius="md"
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
        >
            <Text fontWeight="medium" mb={2}>
                In Training Mode:
            </Text>
            
            <HStack spacing={4} mb={1}>
                <Icon as={AlertCircle} color="purple.500" />
                <Text fontSize="sm">You'll be given 10 emotions to match</Text>
            </HStack>
            
            <HStack spacing={4} mb={1}>
                <Icon as={Timer} color="purple.500" />
                <Text fontSize="sm">Complete all challenges within 30 seconds</Text>
            </HStack>
            
{/*
            <HStack spacing={4}>
                <Icon as={Award} color="purple.500" />
                <Text fontSize="sm">Succeed to earn bonus $NOCX tokens</Text>
            </HStack>
*/}
        </Box>
    );
};

export default TrainingModeInfo;