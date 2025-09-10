import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const primary = {
    50: isDark ? '#09090b' : '#fafafa',
    100: isDark ? '#18181b' : '#f4f4f5',
    200: isDark ? '#27272a' : '#e4e4e7',
    300: isDark ? '#8dd2ab' : '#d4d4d8',
    400: isDark ? '#52525b' : '#a1a1aa',
    500: '#71717a',
    600: isDark ? '#a1a1aa' : '#52525b',
    700: isDark ? '#d4d4d8' : '#3f3f46',
    800: isDark ? '#e4e4e7' : '#27272a',
    900: isDark ? '#f4f4f5' : '#18181b',
    950: isDark ? '#fafafa' : '#09090b',
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

