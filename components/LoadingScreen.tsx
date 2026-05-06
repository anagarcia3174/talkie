import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  fullScreen?: boolean;
}

export default function LoadingScreen({ fullScreen = true }: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 4 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const content = (
    <View className="flex-1 items-center justify-center px-6">
      <View className="mt-6 flex flex-row items-center">
        <Text className="font-SpaceGrotesk-Medium text-xl text-primary-700 dark:text-primary-300">
          Loading
        </Text>
        <Text className="font-SpaceGrotesk-Bold text-2xl text-primary-600 dark:text-primary-400">
          {dots}
        </Text>
      </View>
    </View>
  );

  if (fullScreen) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">{content}</SafeAreaView>
    );
  }

  return content;
}
