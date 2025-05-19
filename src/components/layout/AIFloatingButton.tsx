import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Image, useColorModeValue } from '@chakra-ui/react';

const AIFloatingButton: React.FC = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  const handleClick = () => {
    navigate('/ai-assistant');
  };
  
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
        src="/AI.png" 
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