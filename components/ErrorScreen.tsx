import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { AlertTriangle } from 'lucide-react-native';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  fullScreen?: boolean;
  onRetry?: () => void;
}

export default function ErrorScreen({
  title = 'Whoops!',
  message = 'An unexpected error occurred. Please try again.',
  fullScreen = true,
  onRetry,
}: ErrorScreenProps) {
  const theme = useTheme();

  const content = (
    <View className="flex-1 items-center justify-center px-6">
      {/* Error Icon */}
      <View className="mb-6 items-center">
        <View className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
          <AlertTriangle size={48} color={theme.isDark ? '#fca5a5' : '#dc2626'} />
        </View>
      </View>

      {/* Error Text */}
      <View className="mb-8 items-center">
        <Text className="mb-3 text-center font-SpaceGrotesk-Bold text-2xl text-primary-900 dark:text-primary-100">
          {title}
        </Text>
        <Text className="text-center font-SpaceGrotesk-Regular text-lg leading-6 text-primary-700 dark:text-primary-300">
          {message}
        </Text>
      </View>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="rounded-xl bg-primary-200 px-6 py-3 dark:bg-primary-800">
          <Text className="font-SpaceGrotesk-SemiBold text-base text-primary-800 dark:text-primary-200">
            Try again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">{content}</SafeAreaView>
    );
  }

  return content;
}
