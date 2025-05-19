import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

interface LiveCameraFeedProps {
  onClose?: () => void;
}

const LiveCameraFeed: React.FC<LiveCameraFeedProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera error:', err);
        setIsActive(false);
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
        bg="red.500"
        boxShadow="0 0 5px rgba(255, 0, 0, 0.7)"
      />
    </Box>
  );
};

export default LiveCameraFeed;