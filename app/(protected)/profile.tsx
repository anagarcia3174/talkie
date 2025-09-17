import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, Pressable } from 'react-native';
import { useAuth } from '~/context/AuthContext';
import {
  UserRound,
  Pencil,
  Star,
  CircleCheckBig,
  Library,
  Users,
  MessageSquareText,
} from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useProfile } from '~/store/profileStore';
import StatsSection from '~/components/StatsSection';

export default function Profile() {
  const { user } = useAuth();
  const { profile, stats } = useProfile();
  const theme = useTheme();
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString() : '';
  return (
    <SafeAreaView className="flex-1 bg-primary-100 px-4 py-4 dark:bg-primary-950">
      {/* Header */}
      <Text className="font-SpaceGrotesk-Bold text-4xl text-primary-950 dark:text-primary-50">
        Profile
      </Text>
      <View className='mt-2 mb-6 rounded-lg bg-primary-200 p-3 dark:bg-primary-900'>

      <View className="mb-4 flex-row items-center ">
  {profile?.avatar_url ? (
    <Image source={{ uri: profile.avatar_url }} className="h-16 w-16 rounded-full" />
  ) : (
    <View className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
      <UserRound size={32} color={theme.primary[900]} />
    </View>
  )}
  <View className="ml-4 flex-1">
    <Text className="font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
      {profile?.display_name || 'New User'}
    </Text>
    <Text className="font-SpaceGrotesk-Regular text-sm text-primary-700 dark:text-primary-300">
      {user?.email ?? `Member since ${memberSince}`}
    </Text>
  </View>
  <View >
  
  </View>
</View>
<View className="items-start bg-primary-200 dark:bg-primary-900">
        <Text className="font-SpaceGrotesk-Bold text-md text-primary-950 dark:text-primary-50">
          Bio
        </Text>
         <Text className=" font-SpaceGrotesk-Regular text-sm text-primary-950 dark:text-primary-50">
          {profile?.bio ?? 'No bio yet'}
        </Text>
      </View>
      </View>

      {/* Stats Section */}
      <StatsSection stats={stats}/>

      <View className="mb-8">
        <Text className="mb-2 font-SpaceGrotesk-Regular text-lg text-primary-950 dark:text-primary-50">
          Lists
        </Text>
        <View className="flex-row justify-between">
          <View className="mx-1 flex-1 items-center rounded-lg bg-primary-200 p-4 dark:bg-primary-900">
            <Star size={20} color={theme.primary[600]} />
            <Text className="font-SpaceGrotesk-Regular text-xs text-primary-700 dark:text-primary-300">
              Favorites
            </Text>
          </View>
          <View className="mx-1 flex-1 items-center rounded-lg bg-primary-200 p-4 dark:bg-primary-900">
            <Library size={20} color={theme.primary[600]} />
            {/* <Text className="font-SpaceGrotesk-Bold text-lg text-primary-950 dark:text-primary-50">
              85
            </Text> */}
            <Text className="font-SpaceGrotesk-Regular text-xs text-primary-700 dark:text-primary-300">
              Watchlist
            </Text>
          </View>
          <View className="mx-1 flex-1 items-center rounded-lg bg-primary-200 p-4 dark:bg-primary-900">
            <CircleCheckBig size={20} color={theme.primary[600]} />
            {/* <Text className="font-SpaceGrotesk-Bold text-lg text-primary-950 dark:text-primary-50">
              42
            </Text> */}
            <Text className="font-SpaceGrotesk-Regular text-xs text-primary-700 dark:text-primary-300">
              Watched
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
