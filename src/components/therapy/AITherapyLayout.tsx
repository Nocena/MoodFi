import React from 'react';
import { Box, Flex, Heading, IconButton, useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

interface Props {
  children: React.ReactNode;
}

const AITherapyLayout: React.FC<Props> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex direction="column" h="100vh" w="100vw" overflow="hidden">
      <Flex
        justify="space-between"
        align="center"
        px={6}
        py={4}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        borderBottom="1px"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        zIndex={5}
      >
        <Heading fontSize="lg">🧠 MoodFi – AI Therapy</Heading>
        <IconButton
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          aria-label="Toggle theme"
          onClick={toggleColorMode}
          variant="ghost"
        />
      </Flex>

      <Box flex="1" position="relative" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}>
        {children}
      </Box>
    </Flex>
  );
};

export default AITherapyLayout;
