import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Auth } from '~/components/Auth.native';

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      <View className="flex-1 justify-center px-8">
        <Text className="font-CourierPrime-Regular font-SpaceGrotesk-Bold text-6xl text-primary-950 dark:text-primary-50">
          Talkie
        </Text>
        <View className="mb-12">
          <Text className="text-start font-SpaceGrotesk-Regular text-xl leading-relaxed text-primary-950 dark:text-primary-50">
            Track what you watch.
          </Text>
          <Text className="text-start font-SpaceGrotesk-Regular text-xl leading-relaxed text-primary-950 dark:text-primary-50">
            Talk about every moment.
          </Text>
        </View>
      </View>
      <View className="items-center p-6">
        <Auth />
      </View>
    </SafeAreaView>
  );
}
