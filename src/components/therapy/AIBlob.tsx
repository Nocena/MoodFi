import React, { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

interface AIBlobProps {
  isSpeaking: boolean;
}

// Define keyframes for animations
const idlePulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(0.95); opacity: 0.7; }
`;

const speakingPulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  25% { transform: scale(1.1); opacity: 0.9; }
  50% { transform: scale(1.2); opacity: 1; }
  75% { transform: scale(1.1); opacity: 0.9; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 25px 5px rgba(138, 110, 255, 0.7), 0 0 50px 15px rgba(65, 0, 255, 0.4); }
  50% { box-shadow: 0 0 40px 10px rgba(138, 110, 255, 0.9), 0 0 70px 20px rgba(65, 0, 255, 0.6); }
  100% { box-shadow: 0 0 25px 5px rgba(138, 110, 255, 0.7), 0 0 50px 15px rgba(65, 0, 255, 0.4); }
`;

const AIBlob: React.FC<AIBlobProps> = ({ isSpeaking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Canvas animation for more advanced visual effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const size = 300;
      canvas.width = size;
      canvas.height = size;
      
      // DPI scaling for retina displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.scale(dpr, dpr);
      
      // Set dimensions through style for proper sizing
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };
    
    setCanvasDimensions();
    
    // Create radial gradient
    const createGradient = () => {
      const centerX = canvas.width / 2 / (window.devicePixelRatio || 1);
      const centerY = canvas.height / 2 / (window.devicePixelRatio || 1);
      const outerRadius = 80;
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, outerRadius
      );
      
      // Colors for the glowing orb
      gradient.addColorStop(0, 'rgba(138, 110, 255, 0.95)');
      gradient.addColorStop(0.6, 'rgba(90, 60, 255, 0.7)');
      gradient.addColorStop(1, 'rgba(65, 0, 255, 0)');
      
      return gradient;
    };
    
    let animationFrameId: number;
    let phase = 0;
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Base circle with gradient
      const centerX = canvas.width / 2 / (window.devicePixelRatio || 1);
      const centerY = canvas.height / 2 / (window.devicePixelRatio || 1);
      const baseRadius = 60;
      
      // Pulsing effect
      const pulseSpeed = isSpeaking ? 0.07 : 0.03;
      phase += pulseSpeed;
      const pulseFactor = isSpeaking 
        ? 1 + Math.sin(phase) * 0.15
        : 1 + Math.sin(phase) * 0.05;
      
      const radius = baseRadius * pulseFactor;
      
      // Draw main circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = createGradient();
      ctx.fill();
      
      // Draw outer ring when speaking
      if (isSpeaking) {
        const ringPulse = 1 + Math.sin(phase * 1.5) * 0.1;
        const ringRadius = (baseRadius + 20) * ringPulse;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(138, 110, 255, 0.6)';
        ctx.stroke();
        
        // Second outer ring with opposite pulse
        const ringPulse2 = 1 + Math.sin(phase * 1.5 + Math.PI) * 0.1;
        const ringRadius2 = (baseRadius + 30) * ringPulse2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius2, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(138, 110, 255, 0.4)';
        ctx.stroke();
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking]);
  
  return (
    <Box 
      position="relative"
      width="300px" 
      height="300px"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {/* Main glowing blob */}
      <Box
        position="absolute"
        width="120px"
        height="120px"
        borderRadius="full"
        bg="rgba(138, 110, 255, 0.01)"
        sx={{
          animation: isSpeaking ? `${glowPulse} 2s infinite` : 'none'
        }}
        zIndex={2}
      />
      
      {/* Canvas for advanced animation */}
      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
        }}
      />
    </Box>
  );
};

export default AIBlob;