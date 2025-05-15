import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  useColorMode,
  Avatar,
  HStack,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import { useAuthStore } from '../../store/authStore';
import { useSocialStore } from '../../store/socialStore';
import {
  Camera,
  Bell,
  Moon,
  Sun,
  Sparkles,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import {useLensAuth} from "../../providers/LensAuthProvider.tsx";

const Header: React.FC = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const {disconnect, isAuthenticated} = useLensAuth()
  const { user} = useAuthStore();
  const { notifications, unreadNotifications } = useSocialStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await disconnect();
    navigate('/login');
  };

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
            <HStack
                spacing={2}
                as={RouterLink}
                to="/"
            >
              <Icon
                  as={Sparkles}
                  boxSize={6}
                  color="brand.500"
                  _dark={{ color: 'brand.300' }}
              />
              <Text
                  textAlign={useBreakpointValue({ base: 'left', md: 'left' })}
                  fontFamily={'heading'}
                  fontSize="xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, brand.400, brand.600)"
                  bgClip="text"
              >
                MoodFi
              </Text>
            </HStack>
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

                <Menu>
                  <MenuButton
                      as={Box}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ transform: 'scale(1.05)' }}
                  >
                    <Avatar
                        size="sm"
                        src={user?.avatar}
                        name={user?.name}
                    />
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                        as={RouterLink}
                        to="/profile"
                        icon={<User size={16} />}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                        as={RouterLink}
                        to="/settings"
                        icon={<Settings size={16} />}
                    >
                      Settings
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem
                        icon={<LogOut size={16} />}
                        onClick={handleLogout}
                        color="red.500"
                        _hover={{
                          bg: 'red.50',
                          _dark: { bg: 'red.900' }
                        }}
                    >
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
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