import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  useColorMode,
  Avatar,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { useAuthStore } from '../../store/authStore';
import { useSocialStore } from '../../store/socialStore';
import { 
  Camera, 
  User, 
  LogOut, 
  Bell, 
  Moon, 
  Sun 
} from 'lucide-react';

const Header: React.FC = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadNotifications } = useSocialStore();
  
  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      position="fixed"
      w="full"
      zIndex={20}
      h="16"
    >
      <Flex
        color={useColorModeValue('gray.600', 'white')}
        minH={'16'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        align={'center'}
        justifyContent="space-between"
      >
        <Flex flex={{ base: 1 }} justify={{ base: 'start', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'left', md: 'left' })}
            fontFamily={'heading'}
            fontSize="xl"
            fontWeight="bold"
            bgGradient="linear(to-r, brand.400, brand.600)"
            bgClip="text"
            as={RouterLink}
            to="/"
          >
            MoodMatch
          </Text>
        </Flex>

        {isAuthenticated ? (
          <HStack spacing={4}>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              onClick={toggleColorMode}
              variant="ghost"
              colorScheme="gray"
            />
            
            <Box position="relative">
              <IconButton
                aria-label="Notifications"
                icon={<Bell size={20} />}
                variant="ghost"
                colorScheme="gray"
                as={RouterLink}
                to="/notifications"
              />
              {unreadNotifications > 0 && (
                <Badge
                  colorScheme="red"
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  borderRadius="full"
                  fontSize="xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Box>
            
            <IconButton
              aria-label="Take Selfie"
              icon={<Camera size={20} />}
              as={RouterLink}
              to="/camera"
              colorScheme="brand"
              variant="solid"
            />
            
            <Avatar
              size="sm"
              src={user?.avatar}
              name={user?.name}
              as={RouterLink}
              to="/profile"
              cursor="pointer"
            />
          </HStack>
        ) : (
          <Stack
            flex={{ base: 1, md: 0 }}
            justify={'flex-end'}
            direction={'row'}
            spacing={6}
          >
            <Button
              as={RouterLink}
              fontSize={'sm'}
              fontWeight={400}
              variant={'link'}
              to={'/login'}
            >
              Sign In
            </Button>
            <Button
              as={RouterLink}
              display={{ base: 'none', md: 'inline-flex' }}
              fontSize={'sm'}
              fontWeight={600}
              colorScheme={'brand'}
              to={'/signup'}
            >
              Sign Up
            </Button>
          </Stack>
        )}
      </Flex>
    </Box>
  );
};

export default Header;