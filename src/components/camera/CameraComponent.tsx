import React, {useCallback, useEffect, useRef, useState} from 'react';
import Webcam from 'react-webcam';
import {
    Badge,
    Box,
    Button,
    Center,
    Heading,
    HStack,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    Textarea,
    useColorModeValue,
    useToast,
    VStack,
} from '@chakra-ui/react';
import {Camera, RefreshCw, Upload} from 'lucide-react';
import {MOOD_TYPE} from '../../types';
import {useMoodStore} from '../../store/moodStore';
import {dataURLtoFile, getMoodColor, getMoodEmoji} from "../../utils/common.utils.ts";
import {postDailyMood} from "../../utils/lens.utils.ts";
import {useLensAuth} from "../../providers/LensAuthProvider.tsx";
import {useDailyMoodStore} from "../../store/dailyMoodStore.ts";

const CameraComponent: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [detectedMood, setDetectedMood] = useState<MOOD_TYPE | null>(null);
    const [confidenceScore, setConfidenceScore] = useState<number>(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [rewardAmount, setRewardAmount] = useState<number>(0);
    const [description, setDescription] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {client: sessionClient} = useLensAuth()

    const {
        detectMood,
        dailyMood,
    } = useMoodStore();

    const {
        todayMoodTaken,
    } = useDailyMoodStore();

    const toast = useToast();

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    const startCountdown = () => {
        setCountdown(3);
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (countdown !== null && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            capture().then(() => {
            });
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown]);

    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            // NEW: turn it into a File and save it
            const file = await dataURLtoFile(imageSrc);
            setImageFile(file);
            setCountdown(null);
            analyzeMood(imageSrc);
        }
    }, [webcamRef]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file)
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                setCapturedImage(imageUrl);
                analyzeMood(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeMood = async (imageUrl: string) => {
        setIsAnalyzing(true);

        try {
            const mood = await detectMood(imageUrl);
            setDetectedMood(mood);

            // Calculate confidence score (70-99%)
            const score = Math.floor(Math.random() * 30) + 70;
            setConfidenceScore(score);

            // Calculate reward
            const baseReward = score / 10;
            const matchBonus = dailyMood?.mood === mood ? 50 : 0;
            const totalReward = baseReward + matchBonus;
            setRewardAmount(totalReward);

            setIsModalOpen(true);
            setIsAnalyzing(false);

        } catch (error) {
            console.log("error", error)
            toast({
                title: "Error",
                description: "Failed to analyze your mood",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async () => {
        if (!detectedMood || !capturedImage) return;

        try {
            setIsSubmitting(true)
            if (!sessionClient || !imageFile)
                throw new Error('')

            const postResult = await postDailyMood(
                sessionClient,
                imageFile,
                // detectedMood,
                'disgusted',
                // confidenceScore,
                40,
                0,
                description,
            )
            if (!postResult)
                throw new Error('failed post')

            toast({
                title: "Success!",
                description: `Mood posted and ${rewardAmount.toFixed(1)} $NOCX tokens earned!`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            setIsModalOpen(false);

        } catch (error) {
            console.log("error", error)
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

    const retake = () => {
        setCapturedImage(null);
        setDetectedMood(null);
        setConfidenceScore(0);
        setRewardAmount(0);
        setDescription('');
        setIsModalOpen(false);
    };


    const whiteGrayColor = useColorModeValue('white', 'gray.800')

    if (todayMoodTaken) {
        return (
            <Center py={10}>
                <VStack spacing={4}>
                    <Heading size="md">You've already captured your mood today!</Heading>
                    <Text>Come back tomorrow for a new mood challenge.</Text>
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
            <VStack spacing={4}>
                <Text fontSize="xl" fontWeight="bold">
                    {dailyMood ? `Today's mood to match: ${dailyMood.mood.charAt(0).toUpperCase() + dailyMood.mood.slice(1)}` : 'Loading today\'s mood...'}
                </Text>

                {capturedImage ? (
                    <Box position="relative" overflow="hidden" borderRadius="lg">
                        <Image
                            src={capturedImage}
                            alt="Captured"
                            borderRadius="lg"
                            boxShadow="md"
                        />

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
                ) : (
                    <Box
                        position="relative"
                        overflow="hidden"
                        borderRadius="lg"
                        boxShadow="md"
                    >
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            mirrored
                            style={{
                                borderRadius: '0.5rem',
                            }}
                        />

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
                    </Box>
                )}

                {!capturedImage && (
                    <HStack spacing={4} width="100%">
                        <Button
                            leftIcon={<Camera/>}
                            colorScheme="brand"
                            flex={1}
                            onClick={startCountdown}
                        >
                            Take Photo
                        </Button>

                        <Button
                            leftIcon={<Upload/>}
                            colorScheme="brand"
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
                    </HStack>
                )}

                {capturedImage && !isAnalyzing && !isModalOpen && (
                    <Button
                        leftIcon={<RefreshCw/>}
                        variant="outline"
                        onClick={retake}
                    >
                        Take Another Photo
                    </Button>
                )}
            </VStack>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Mood Analysis Results</ModalHeader>
                    <ModalCloseButton/>

                    <ModalBody>
                        <VStack spacing={6} align="stretch">
                            <HStack justify="center" spacing={4}>
                                <Badge
                                    fontSize="xl"
                                    py={2}
                                    px={4}
                                    borderRadius="full"
                                    colorScheme={detectedMood ? getMoodColor(detectedMood) : 'gray'}
                                >
                                    {detectedMood && getMoodEmoji(detectedMood)} {detectedMood?.toUpperCase()}
                                </Badge>

                                <Badge
                                    fontSize="xl"
                                    py={2}
                                    px={4}
                                    borderRadius="full"
                                    colorScheme="purple"
                                >
                                    {confidenceScore}% Confidence
                                </Badge>
                            </HStack>
                            {dailyMood?.mood === detectedMood && (
                                <Badge alignSelf="center" colorScheme="green" fontSize="md" px={4} py={1}>
                                    Perfect Match! 🎯 +50 $NOCX Bonus
                                </Badge>
                            )}

                            <Box>
                                <Text mb={2} fontWeight="medium">Share your thoughts:</Text>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="How are you feeling today?"
                                    rows={4}
                                />
                            </Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={retake}>
                            Retake
                        </Button>
                        <Button
                            colorScheme="brand"
                            onClick={handleSubmit}
                            isLoading={isSubmitting}
                        >
                            Post & Claim Rewards
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default CameraComponent;