import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView } from 'react-native';
import { useProfile } from '~/store/profileStore';
import StatsSection from '~/components/StatsSection';
import ListsSection from '~/components/ListsSection';
import ProfileSection from '~/components/ProfileSection';

export default function Profile() {
  const { error } = useProfile();

  return (
    <SafeAreaView className="flex-1 bg-primary-100 px-4 py-4 dark:bg-primary-950">
      <Text className="mb-2 font-SpaceGrotesk-Bold text-4xl text-primary-950 dark:text-primary-50">
        Profile
      </Text>
      <ScrollView>
        {error && (
          <View className="mb-4 rounded-lg bg-red-400 px-4 py-3 dark:bg-red-800">
            <Text className="text-md font-SpaceGrotesk-Medium text-white dark:text-red-100">
              {error}
            </Text>
          </View>
        )}
        <ProfileSection />
        <StatsSection />
        <ListsSection />
      </ScrollView>
    </SafeAreaView>
  );
}
