import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useAuth } from '~/context/AuthContext';
import { UserRound, Pencil } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
export default function Profile() {
  const { user } = useAuth();
  const theme = useTheme();

  const userLists = [
    { id: '1', name: 'Watchlist', count: 12 },
    { id: '2', name: 'Favorites', count: 8 },
    { id: '3', name: 'Watched', count: 24 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-primary-100 px-4 py-4 dark:bg-primary-950">
      {/* Header */}
      <Text className="font-SpaceGrotesk-Bold text-4xl">Profile</Text>

      <View className="mb-8 flex-row items-center">
        <View className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
          <UserRound size={32} color={theme.primary[900]} />
        </View>
        <View className="ml-4 flex-1">
          <Text className="font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
            {user?.email ?? 'No email'}
          </Text>
          <Text className="font-SpaceGrotesk-Regular text-sm text-primary-700 dark:text-primary-300">
            Tap edit to add a display name
          </Text>
        </View>
        <TouchableOpacity className="p-2">
          <Pencil size={20} color={theme.primary[900]} />
        </TouchableOpacity>
      </View>

      {/* Lists Section */}
      <Text className="mb-2 font-SpaceGrotesk-Bold text-lg text-primary-950 dark:text-primary-50">
        Your Lists
      </Text>
      <FlatList
        data={userLists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between border-b border-primary-200 py-3 dark:border-primary-800">
            <Text className="font-SpaceGrotesk-Regular text-base text-primary-950 dark:text-primary-50">
              {item.name}
            </Text>
            <Text className="font-SpaceGrotesk-Regular text-base text-primary-700 dark:text-primary-300">
              {item.count}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
