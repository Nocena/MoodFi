import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#f0e7ff',
    100: '#d1bfff',
    200: '#b196ff',
    300: '#916dff',
    400: '#7245ff',
    500: '#581cff',
    600: '#4a15cc',
    700: '#3c1099',
    800: '#2d0a66',
    900: '#1f0533',
  },
  mood: {
    happy: '#FFD166',
    sad: '#118AB2',
    excited: '#EF476F',
    calm: '#06D6A0',
    neutral: '#073B4C',
  },
};

const fonts = {
  heading: "'Poppins', sans-serif",
  body: "'Inter', sans-serif",
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: 'lg',
    },
    variants: {
      solid: (props: { colorScheme: string }) => ({
        bg: `${props.colorScheme}.500`,
        color: 'white',
        _hover: {
          bg: `${props.colorScheme}.600`,
        },
      }),
      outline: (props: { colorScheme: string }) => ({
        border: '2px solid',
        borderColor: `${props.colorScheme}.500`,
        color: `${props.colorScheme}.500`,
      }),
      ghost: (props: { colorScheme: string }) => ({
        color: `${props.colorScheme}.500`,
        _hover: {
          bg: `${props.colorScheme}.50`,
        },
      }),
    },
  },
  Card: {
    baseStyle: {
      p: '4',
      borderRadius: 'lg',
      boxShadow: 'md',
      bg: 'white',
      _dark: {
        bg: 'gray.800',
      },
    },
  },
};

const config = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

const styles = {
  global: (props: { colorMode: string }) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
  }),
};

const theme = extendTheme({
  colors,
  fonts,
  components,
  config,
  styles,
});

export default theme;