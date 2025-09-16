import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const primary = {
    50: isDark ? '#1a1a1a' : '#fafafa',
    100: isDark ? '#262626' : '#f4f4f5',
    200: isDark ? '#404040' : '#e4e4e7',
    300: isDark ? '#3f3f46' : '#d4d4d8',
    400: isDark ? '#52525b' : '#a1a1aa',
    500: '#71717a',
    600: isDark ? '#a1a1aa' : '#52525b',
    700: isDark ? '#d4d4d8' : '#3f3f46',
    800: isDark ? '#e4e4e7' : '#404040',
    900: isDark ? '#f4f4f5' : '#262626',
    950: isDark ? '#fafafa' : '#1a1a1a',
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

