import { configureFonts, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Custom color palette
const lightColors = {
  primary: '#1976D2',
  onPrimary: '#FFFFFF',
  primaryContainer: '#BBDEFB',
  onPrimaryContainer: '#0D47A1',
  secondary: '#FF9800',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#FFE0B2',
  onSecondaryContainer: '#E65100',
  tertiary: '#4CAF50',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#C8E6C9',
  onTertiaryContainer: '#1B5E20',
  error: '#F44336',
  onError: '#FFFFFF',
  errorContainer: '#FFEBEE',
  onErrorContainer: '#B71C1C',
  background: '#FAFAFA',
  onBackground: '#212121',
  surface: '#FFFFFF',
  onSurface: '#212121',
  surfaceVariant: '#F5F5F5',
  onSurfaceVariant: '#424242',
  outline: '#E0E0E0',
  outlineVariant: '#EEEEEE',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#303030',
  inverseOnSurface: '#FAFAFA',
  inversePrimary: '#90CAF9',
  elevation: {
    level0: 'transparent',
    level1: '#FFFFFF',
    level2: '#F8F9FA',
    level3: '#F1F3F4',
    level4: '#EEEFF0',
    level5: '#E8EAED',
  },
  surfaceDisabled: '#E0E0E0',
  onSurfaceDisabled: '#9E9E9E',
  backdrop: 'rgba(0, 0, 0, 0.4)',
};

const darkColors = {
  primary: '#90CAF9',
  onPrimary: '#0D47A1',
  primaryContainer: '#1565C0',
  onPrimaryContainer: '#E3F2FD',
  secondary: '#FFB74D',
  onSecondary: '#E65100',
  secondaryContainer: '#F57C00',
  onSecondaryContainer: '#FFF3E0',
  tertiary: '#81C784',
  onTertiary: '#1B5E20',
  tertiaryContainer: '#388E3C',
  onTertiaryContainer: '#E8F5E8',
  error: '#EF5350',
  onError: '#B71C1C',
  errorContainer: '#C62828',
  onErrorContainer: '#FFEBEE',
  background: '#121212',
  onBackground: '#FFFFFF',
  surface: '#1E1E1E',
  onSurface: '#FFFFFF',
  surfaceVariant: '#2C2C2C',
  onSurfaceVariant: '#CCCCCC',
  outline: '#404040',
  outlineVariant: '#333333',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#FFFFFF',
  inverseOnSurface: '#121212',
  inversePrimary: '#1976D2',
  elevation: {
    level0: 'transparent',
    level1: '#1E1E1E',
    level2: '#232323',
    level3: '#252525',
    level4: '#272727',
    level5: '#2C2C2C',
  },
  surfaceDisabled: '#2C2C2C',
  onSurfaceDisabled: '#666666',
  backdrop: 'rgba(0, 0, 0, 0.6)',
};

// Font configuration
const fontConfig = {
  web: {
    regular: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '100',
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
  android: {
    regular: {
      fontFamily: 'Roboto',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Roboto',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'Roboto',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'Roboto',
      fontWeight: '100',
    },
  },
};

// Light theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: lightColors,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: darkColors,
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Theme type
export type Theme = typeof lightTheme;

// Custom spacing values
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Custom border radius values
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Custom elevation/shadow values
export const elevation = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  xxl: 16,
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Z-index values
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

export default { lightTheme, darkTheme, spacing, borderRadius, elevation, animations, breakpoints, zIndex };
