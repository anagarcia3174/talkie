import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const primary = {
    50: isDark ? '#111111' : '#f4f4f5',
    100: isDark ? '#1f1f23' : '#e7e7ea',
    200: isDark ? '#34343a' : '#d6d6da',
    300: isDark ? '#4a4a52' : '#b9b9bf',
    400: isDark ? '#63636d' : '#9a9aa3',
    500: '#7c7c86',
    600: isDark ? '#9a9aa3' : '#63636d',
    700: isDark ? '#b9b9bf' : '#4a4a52',
    800: isDark ? '#d6d6da' : '#34343a',
    900: isDark ? '#e7e7ea' : '#1f1f23',
    950: isDark ? '#f4f4f5' : '#111111',
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
