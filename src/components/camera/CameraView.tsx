// src/components/camera/CameraView.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import {
    Box,
    Center,
    Spinner,
    Text,
    VStack,
    Badge,
    Flex,
    HStack,
    Button, useColorModeValue
} from '@chakra-ui/react';
import { Camera, Upload } from 'lucide-react';
import { dataURLtoFile, getMoodColor, getMoodEmoji } from "../../utils/common.utils";
import { formatEmotion, getEmotionEmoji } from '../../utils/faceVerification';
import { verifyFace } from '../../utils/faceVerification';

interface CameraViewProps {
    dailyMood: any;
    onCapture: (imageSrc: string, file: File) => void;
    isTrainingMode?: boolean;
    onEmotionDetected?: (emotion: string, matchScore: number) => void;
    onDetectionUpdate?: (emotion: string) => void;
    currentDetectedEmotion?: string | null;
}

const CameraView: React.FC<CameraViewProps> = ({ 
    dailyMood, 
    onCapture, 
    isTrainingMode = false,
    onEmotionDetected,
    onDetectionUpdate,
    currentDetectedEmotion = null
}) => {
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const requestRef = useRef<number>();
    const [isDetecting, setIsDetecting] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    
    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    // Start the countdown for photo capture (only for regular challenge mode)
    const startCountdown = () => {
        if (!isTrainingMode) {
            setCountdown(3);
        }
    };

    // Handle countdown logic for regular challenge mode
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (countdown !== null && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            capturePhoto();
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown]);

    // Capture photo from webcam for regular challenge mode
    const capturePhoto = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            const file = await dataURLtoFile(imageSrc, "mood-selfie.jpg");
            setCountdown(null);
            onCapture(imageSrc, file);
        }
    }, [webcamRef, onCapture]);

    // Handle file upload for regular challenge mode
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                onCapture(imageUrl, file);
            };
            reader.readAsDataURL(file);
        }
    };

    // Function to continuously analyze the video stream for emotion detection in training mode
    const analyzeFacialEmotion = useCallback(async () => {
        if (!webcamRef.current || !dailyMood?.mood || isDetecting || !isTrainingMode) return;
        
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;
        
        setIsDetecting(true);
        
        try {
            // Create an image element for face-api.js to analyze
            const img = document.createElement('img');
            img.src = imageSrc;
            
            // Wait for image to load
            await new Promise((resolve) => {
                img.onload = resolve;
            });
            
            // Use face-api.js for emotion detection
            const requestedEmotion = dailyMood.mood.toLowerCase();
            
            const verificationResult = await verifyFace(img, requestedEmotion);
            
            if (verificationResult?.vibeCheck) {
                const dominantEmotion = verificationResult.vibeCheck.dominantEmotion;
                const matchScore = verificationResult.vibeCheck.matchScore;
                
                // Update the currently detected emotion
                if (onDetectionUpdate) {
                    onDetectionUpdate(dominantEmotion);
                }
                
                // If dominant emotion matches required emotion with good confidence
                const isMatch = dominantEmotion.toLowerCase() === requestedEmotion.toLowerCase();
                const hasGoodConfidence = matchScore > 70;
                
                if (isMatch && hasGoodConfidence && onEmotionDetected) {
                    // If we have a match, create a file from the screenshot and pass it
                    const file = await dataURLtoFile(imageSrc, "mood-selfie.jpg");
                    onCapture(imageSrc, file);
                    onEmotionDetected(dominantEmotion, matchScore);
                    return; // Stop continuous detection
                }
            }
        } catch (error) {
            console.error('Error detecting emotion:', error);
        } finally {
            setIsDetecting(false);
        }
        
        // Continue detection in training mode
        if (isTrainingMode) {
            requestRef.current = requestAnimationFrame(analyzeFacialEmotion);
        }
    }, [webcamRef, dailyMood, isDetecting, onCapture, onEmotionDetected, onDetectionUpdate, isTrainingMode]);
    
    // Start continuous emotion detection in training mode
    useEffect(() => {
        if (isTrainingMode) {
            requestRef.current = requestAnimationFrame(analyzeFacialEmotion);
        }
        
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isTrainingMode, analyzeFacialEmotion]);

    // Get color scheme based on mode
    const bgColor = useColorModeValue('purple.50', 'blue.800');

    // Get emoji for current detected emotion
    const detectedEmoji = currentDetectedEmotion ? getEmotionEmoji(currentDetectedEmotion.toLowerCase()) : "❓";

    return (
        <VStack spacing={4}>
            {/* Daily mood indicator */}
            <Box 
                bg={bgColor}
                p={4}
                borderRadius="md"
                width="full"
                textAlign="center"
                position="relative"
            >
                <Text fontSize="xl" fontWeight="bold" mb={1}>
                    {isTrainingMode ? "Training Mode Challenge" : "Today's Mood Challenge"}
                </Text>
                
                {isTrainingMode && (
                    <Badge 
                        position="absolute" 
                        top={2} 
                        right={2} 
                        colorScheme="purple"
                        variant="solid"
                        borderRadius="full"
                        px={2}
                    >
                        1/10
                    </Badge>
                )}
                
                {dailyMood ? (
                    <Flex justify="center" align="center" gap={2}>
                        <Text fontSize="2xl">{getMoodEmoji(dailyMood.mood)}</Text>
                        <Text fontSize="xl" fontWeight="medium">
                            Show your {formatEmotion(dailyMood.mood.toLowerCase())} face!
                        </Text>
                    </Flex>
                ) : (
                    <Spinner size="sm" />
                )}
            </Box>

            {/* Camera view */}
            <Box
                position="relative"
                overflow="hidden"
                borderRadius="lg"
                boxShadow="md"
                cursor={isTrainingMode ? "default" : "pointer"}
                onClick={!isTrainingMode ? startCountdown : undefined}
                _hover={!isTrainingMode ? { 
                    transform: "scale(1.01)",
                    transition: "transform 0.2s"
                } : undefined}
            >
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    mirrored
                    style={{
                        borderRadius: '0.5rem',
                        width: '100%',
                        height: 'auto'
                    }}
                />
                
                {/* Countdown overlay */}
                {countdown !== null && (
                    <Center
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="rgba(0, 0, 0, 0.5)"
                        color="white"
                    >
                        <Text fontSize="6xl" fontWeight="bold">
                            {countdown}
                        </Text>
                    </Center>
                )}
                
                {/* Current emotion detection indicator in top left - only for training mode */}
                {isTrainingMode && (
                    <Box 
                        position="absolute" 
                        top={3} 
                        left={3}
                        bg="white" 
                        borderRadius="lg"
                        px={3}
                        py={2}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="md"
                    >
                        <HStack spacing={2}>
                            <Box>
                                <Text fontSize="xs" color="gray.500">Detected:</Text>
                                <HStack>
                                    <Text fontSize="xl">{detectedEmoji}</Text>
                                    <Text fontSize="sm" fontWeight="medium">
                                        {currentDetectedEmotion 
                                            ? formatEmotion(currentDetectedEmotion.toLowerCase()) 
                                            : "None"}
                                    </Text>
                                </HStack>
                            </Box>
                            <Box borderLeft="1px" borderColor="gray.200" pl={2}>
                                <Text fontSize="xs" color="gray.500">Target:</Text>
                                <HStack>
                                    <Text fontSize="xl">{dailyMood ? getMoodEmoji(dailyMood.mood.toLowerCase()) : ""}</Text>
                                    <Text fontSize="sm" fontWeight="medium">
                                        {dailyMood ? formatEmotion(dailyMood.mood.toLowerCase()) : ""}
                                    </Text>
                                </HStack>
                            </Box>
                        </HStack>
                    </Box>
                )}
                
                {/* Circle guide overlay without emoji */}
                <Center
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    pointerEvents="none"
                >
                    <Box 
                        position="relative" 
                        width="48" 
                        height="48"
                    >
                        <Box 
                            width="full" 
                            height="full" 
                            rounded="full" 
                            border="2px dashed" 
                            borderColor="white" 
                            opacity="0.6"
                        />
                    </Box>
                </Center>
            </Box>
            
            {/* Camera controls - only show for regular challenge mode */}
            {!isTrainingMode && (
                <Flex gap={4} width="100%">
                    <Button
                        leftIcon={<Camera/>}
                        colorScheme="blue"
                        flex={1}
                        onClick={startCountdown}
                    >
                        Take Photo
                    </Button>

                    <Button
                        leftIcon={<Upload/>}
                        colorScheme="blue"
                        variant="outline"
                        flex={1}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Upload Photo
                    </Button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        style={{display: 'none'}}
                    />
                </Flex>
            )}
        </VStack>
    );
};

export default CameraView;