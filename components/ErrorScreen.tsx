import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  fullScreen?: boolean;
}

export default function ErrorScreen({ 
  title = 'Whoops!',
  message = 'An unexpected error occurred. Please try again.',
  fullScreen = true 
}: ErrorScreenProps) {
  const theme = useTheme();

  const content = (
    <View className="flex-1 items-center justify-center px-6">
      {/* Error Icon */}
      <View className="mb-6 items-center">
        <View className="rounded-full bg-red-100 dark:bg-red-900/20 p-4 mb-4">
          <AlertTriangle size={48} color={theme.isDark ? '#fca5a5' : '#dc2626'} />
        </View>
      </View>

      {/* Error Text */}
      <View className="items-center mb-8">
        <Text className="font-SpaceGrotesk-Bold text-2xl text-primary-900 dark:text-primary-100 text-center mb-3">
          {title}
        </Text>
        <Text className="font-SpaceGrotesk-Regular text-lg text-primary-700 dark:text-primary-300 text-center leading-6">
          {message}
        </Text>
      </View>

    </View>
  );

  if (fullScreen) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
        {content}
      </SafeAreaView>
    );
  }

  return content;
}
