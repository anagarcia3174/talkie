import { Text, View, TouchableOpacity } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { useRouter } from 'expo-router';

export default function Index() {
  const theme = useTheme();
  const router = useRouter();
  const handleGetStarted = () => {
    router.push('/signin');
  }


  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      <View className="flex-1 justify-center px-8">
        <Text className="font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50 text-6xl font-CourierPrime-Regular">
          Noat
        </Text>
        <View className="mb-12">
        <Text className="font-SpaceGrotesk-Regular text-primary-950 dark:text-primary-50 text-start text-xl leading-relaxed">
          Track what you watch.
        </Text>
        <Text className="font-SpaceGrotesk-Regular text-primary-950 dark:text-primary-50 text-start text-xl leading-relaxed">
          Noat the moments that matter.
        </Text>
      </View>
      </View>
      <View className="items-center p-6">
        <TouchableOpacity onPress={handleGetStarted} className="flex-row items-center justify-center gap-3 bg-primary-900 dark:bg-primary-200 rounded-xl p-4 w-full">
          <Text className="text-primary-50 dark:text-primary-950 text-lg font-SpaceGrotesk-Medium">Get Started</Text>
          <ArrowRight color={theme.primary[50]} size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
