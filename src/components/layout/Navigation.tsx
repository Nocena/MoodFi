import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Icon,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Home,
  Compass,
  Camera,
  User,
  MessageSquare,
  Bell,
  Coins,
  Image as ImageIcon,
} from 'lucide-react';

interface NavItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
  to: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, to, isActive }) => {
  const activeColor = useColorModeValue('brand.500', 'brand.300');
  const inactiveColor = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('brand.50', 'rgba(88, 28, 255, 0.15)');
  
  return (
    <Box
      as={RouterLink}
      to={to}
      display="block"
      py={2}
      px={4}
      borderRadius="md"
      bg={isActive ? activeBg : 'transparent'}
      _hover={{
        bg: hoverBg,
      }}
      transition="all 0.2s"
      fontWeight={isActive ? 'medium' : 'normal'}
      color={isActive ? activeColor : inactiveColor}
      w="full"
    >
      <Flex align="center">
        <Icon as={icon} fontSize="xl" mr={3} />
        <Text>{children}</Text>
      </Flex>
    </Box>
  );
};

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navigationItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Discover', icon: Compass, path: '/discover' },
    { name: 'Camera', icon: Camera, path: '/camera' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'NFT Marketplace', icon: Coins, path: '/nft/marketplace' },
    { name: 'My NFTs', icon: ImageIcon, path: '/nft/my-nfts' },
  ];
  
  return (
    <Box p={4}>
      <Stack spacing={2}>
        {navigationItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            to={item.path}
            isActive={location.pathname === item.path}
          >
            {item.name}
          </NavItem>
        ))}
      </Stack>
    </Box>
  );
};

export default Navigation;