import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { 
  loadFaceApiModels, 
  verifyFace 
} from '../../utils/faceVerification';

interface LiveCameraFeedProps {
  onClose?: () => void;
}

const LiveCameraFeed: React.FC<LiveCameraFeedProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        // Load face-api models
        await loadFaceApiModels();
        console.log("Face-api models loaded successfully");
        
        // Start camera stream
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready before starting detection
          videoRef.current.onloadedmetadata = () => {
            startEmotionDetection();
          };
        }
      } catch (err) {
        console.error('Camera or face-api initialization error:', err);
        setIsActive(false);
      }
    };

    const startEmotionDetection = () => {
      if (isDetecting || detectionIntervalRef.current) return;
      
      setIsDetecting(true);
      
      // Run emotion detection once per second
      detectionIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          detectEmotion();
        }
      }, 1000);
    };

    const detectEmotion = async () => {
      if (!videoRef.current || !videoRef.current.readyState) return;
      
      try {
        const result = await verifyFace(videoRef.current);
        
        if (result.isHuman && result.vibeCheck) {
          console.log("Emotion detection result:", {
            dominantEmotion: result.vibeCheck.dominantEmotion,
            score: result.vibeCheck.matchScore,
            allEmotions: result.vibeCheck.detectedEmotions
          });
        } else {
          console.log("No face detected or verification failed:", result.message);
        }
      } catch (error) {
        console.error("Error detecting emotions:", error);
      }
    };

    if (isActive) {
      startCamera();
    }

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      
      setIsDetecting(false);
    };
  }, [isActive]);

  const handleClose = () => {
    setIsActive(false);
    if (onClose) onClose();
  };

  if (!isActive) return null;

  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
      borderRadius="lg"
      overflow="hidden"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          transform: 'scaleX(-1)' // Mirror effect
        }}
      />
      
      <IconButton
        aria-label="Close camera"
        icon={<CloseIcon />}
        size="xs"
        position="absolute"
        top={2}
        right={2}
        borderRadius="full"
        bg="rgba(0, 0, 0, 0.6)"
        color="white"
        onClick={handleClose}
        _hover={{ bg: "rgba(0, 0, 0, 0.8)" }}
      />
      
      {/* Recording indicator */}
      <Box
        position="absolute"
        bottom={2}
        left={2}
        width={3}
        height={3}
        borderRadius="full"
        bg={isDetecting ? "green.500" : "red.500"}
        boxShadow={`0 0 5px rgba(${isDetecting ? "0, 255, 0" : "255, 0, 0"}, 0.7)`}
      />
    </Box>
  );
};

export default LiveCameraFeed;