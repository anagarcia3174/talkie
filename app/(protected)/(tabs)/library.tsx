import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TouchableOpacity, View } from 'react-native';
import { useLists } from '~/store/listStore';
import { useTheme } from '~/hooks/useTheme';
import { ScrollView } from 'react-native-gesture-handler';
import { ChevronRight, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function Library() {
  const theme = useTheme();
  const router = useRouter();

  const { listsById, defaultListIds, customListIds } = useLists();

  const library = defaultListIds.library != null ? listsById[defaultListIds.library] : null;

  const favorites = defaultListIds.favorites != null ? listsById[defaultListIds.favorites] : null;

  const ListRow = ({
    title,
    items,
    onPress,
  }: {
    title: string;
    items?: number;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="mb-3 flex-row items-center justify-between rounded-2xl bg-primary-100 p-4 dark:bg-primary-900">
      <View className="flex-1">
        <Text className="font-SpaceGrotesk-Bold text-2xl text-primary-950 dark:text-primary-50">
          {title}
        </Text>
        {items != null && (
          <Text className="font-SpaceGrotesk-Regular text-sm text-primary-600 dark:text-primary-400">
            {items} items
          </Text>
        )}
      </View>
      <ChevronRight size={20} color={theme.primary[950]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4">
        <View className="flex-row items-center">
          <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
            My Lists
          </Text>
        </View>
        <View>
          <TouchableOpacity className="rounded-full bg-primary-800 p-2">
            <Plus size={24} color={theme.primary[950]} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {/* Default Lists */}
        <Text className="mb-2 mt-4 font-SpaceGrotesk-Medium text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
          Default
        </Text>
        {library && (
          <ListRow
            title={library.name}
            items={library.item_count}
            onPress={() => router.push(`/list/${library.id}`)}
          />
        )}

        {favorites && (
          <ListRow
            title={favorites.name}
            items={favorites.item_count}
            onPress={() => router.push(`/list/${favorites.id}`)}
          />
        )}
        {/* Custom Lists */}
        {customListIds.length > 0 && (
          <Text className="mb-2 mt-6 font-SpaceGrotesk-Medium text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
            Custom
          </Text>
        )}

        {customListIds.map((id) => {
          const list = listsById[id];
          if (!list) return null;

          return (
            <ListRow
              key={id}
              title={list.name}
              items={list.item_count}
              onPress={() => router.push(`/list/${id}`)}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
