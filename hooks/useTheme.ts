import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const primary = {
    50: isDark ? '#0d0d0d' : '#f7f7f8',
    100: isDark ? '#1c1c1e' : '#ececee',
    200: isDark ? '#343438' : '#dddddf',
    300: isDark ? '#4f4f57' : '#c6c6ca',
    400: isDark ? '#6b6b74' : '#a8a8ae',
    500: '#8a8a92',
    600: isDark ? '#a8a8ae' : '#6b6b74',
    700: isDark ? '#c6c6ca' : '#4f4f57',
    800: isDark ? '#dddddf' : '#343438',
    900: isDark ? '#ececee' : '#1c1c1e',
    950: isDark ? '#f7f7f8' : '#0d0d0d',
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const primaryOpacity = Object.fromEntries(
    Object.entries(primary).map(([key, value]) => [key, hexToRgba(value, 0.3)])
  );

  return {
    isDark,
    primary,
    primaryOpacity,
  };
};
