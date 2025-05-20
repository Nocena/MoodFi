import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Image, useColorModeValue } from '@chakra-ui/react';
import buttonLogo from '../../../AI.png'
const AIFloatingButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Check if the current route is the AI assistant page
  const isActive = location.pathname === '/ai-assistant';
  
  const handleClick = () => {
    navigate('/ai-assistant');
  };
  
  // If the button is active (user is on the AI assistant page), don't render it
  if (isActive) return null;
  
  return (
    <Box
      position="fixed"
      bottom={{ base: "20", md: "8" }}
      right="8"
      zIndex={20}
      onClick={handleClick}
      cursor="pointer"
      className='rounded-full'
      transition="transform 0.2s"
      bg={bgColor}
      _hover={{
        transform: 'scale(1.05)'
      }}
      _active={{
        transform: 'scale(0.95)'
      }}
    >
      <Image 
        src={buttonLogo}
        alt="AI Assistant" 
        width="76px"
        height="76px"
        objectFit="contain"
        filter="drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))"
      />
    </Box>
  );
};

export default AIFloatingButton;