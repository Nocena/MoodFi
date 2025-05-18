// src/components/camera/ImagePreview.tsx
import React from 'react';
import {
    Box,
    Button,
    Center,
    Image,
    Spinner,
    Text,
    VStack
} from '@chakra-ui/react';
import { RefreshCw } from 'lucide-react';

interface ImagePreviewProps {
    imageUrl: string;
    isAnalyzing: boolean;
    onRetake: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ 
    imageUrl,
    isAnalyzing,
    onRetake
}) => {
    return (
        <VStack spacing={4}>
            <Box position="relative" overflow="hidden" borderRadius="lg" width="100%">
                <Image
                    src={imageUrl}
                    alt="Captured"
                    borderRadius="lg"
                    boxShadow="md"
                    width="100%"
                />

                {/* Loading overlay */}
                {isAnalyzing && (
                    <Center
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="rgba(0, 0, 0, 0.5)"
                        color="white"
                    >
                        <VStack spacing={4}>
                            <Spinner size="xl"/>
                            <Text>Analyzing your mood...</Text>
                        </VStack>
                    </Center>
                )}
            </Box>

            {/* Retake button (only shown when not analyzing) */}
            {!isAnalyzing && (
                <Button
                    leftIcon={<RefreshCw/>}
                    variant="outline"
                    onClick={onRetake}
                >
                    Take Another Photo
                </Button>
            )}
        </VStack>
    );
};

export default ImagePreview;