import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useColorModeValue } from '@chakra-ui/react';
import Header from './Header';
import Navigation from './Navigation';
import MobileNavigation from './MobileNavigation';
import AIFloatingButton from './AIFloatingButton';

const Layout: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Box minH="100vh" bg={bgColor}>
      <Header />
      <Box
        pt="16" // Header height
        pb={{ base: "16", md: "0" }} // Account for mobile navigation
        display="flex"
      >
        <Box
          display={{ base: 'none', md: 'block' }}
          w="64"
          position="fixed"
          left={0}
          top="16"
          h="calc(100vh - 4rem)"
          borderRightWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <Navigation />
        </Box>
        
        <Box
          ml={{ base: 0, md: '64' }}
          w={{ base: 'full', md: 'calc(100% - 16rem)' }}
          p={4}
        >
          <Outlet />
        </Box>
      </Box>
      
      <Box
        display={{ base: 'block', md: 'none' }}
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        borderTopWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        bg={useColorModeValue('white', 'gray.800')}
        zIndex={10}
      >
        <MobileNavigation />
      </Box>
      
      {/* Just add the AI Floating Button */}
      <AIFloatingButton />
    </Box>
  );
};

export default Layout;