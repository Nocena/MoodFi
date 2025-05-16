import React, {useMemo} from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Flex,
  Icon,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Home,
  Compass,
  Camera,
  User,
  MessageSquare, Bell, Coins, Image as ImageIcon
} from 'lucide-react';
import {useLensAuth} from "../../providers/LensAuthProvider.tsx";

interface NavItemProps {
  icon: React.ElementType;
  to: string;
  isActive: boolean;
}

const MobileNavItem: React.FC<NavItemProps> = ({ icon, to, isActive }) => {
  const activeColor = useColorModeValue('brand.500', 'brand.300');
  const inactiveColor = useColorModeValue('gray.600', 'gray.300');
  
  return (
    <Box
      as={RouterLink}
      to={to}
      flex={1}
      textAlign="center"
      py={2}
      color={isActive ? activeColor : inactiveColor}
    >
      <Icon as={icon} fontSize="xl" />
    </Box>
  );
};

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const {currentAccount} = useLensAuth()

  const navigationItems = useMemo(() => {
    return [
      { icon: Home, path: '/' },
      { icon: Compass, path: '/discover' },
      { icon: Camera, path: '/camera' },
      { icon: MessageSquare, path: '/messages' },
      { icon: User, path: `/profile/${currentAccount?.localName}` },
    ]
  }, [currentAccount])


  return (
    <Flex h="16" align="center" justify="space-around">
      {navigationItems.map((item) => (
        <MobileNavItem
          key={item.path}
          icon={item.icon}
          to={item.path}
          isActive={location.pathname === item.path}
        />
      ))}
    </Flex>
  );
};

export default MobileNavigation;