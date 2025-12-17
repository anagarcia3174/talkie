import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView } from 'react-native';
import StatsSection from '~/components/StatsSection';
import ProfileSection from '~/components/ProfileSection';

export default function Profile() {

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
        <View className="mb-2 flex-row items-center justify-start px-4">
        <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
          Profile
        </Text>
      </View>
      <ScrollView className='px-4'>
        
        <ProfileSection />
        <StatsSection />
      </ScrollView>
    </SafeAreaView>
  );
}
