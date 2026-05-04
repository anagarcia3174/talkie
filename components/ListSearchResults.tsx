
import { SearchPublicListResult } from '~/types/supabaseTypes';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Heart, UserRound } from 'lucide-react-native';
import { getPublicUrl } from '~/utils/storageUrl';
import { useTheme } from '~/hooks/useTheme';
import { DEFAULT_LIST_FILTERS, ListFilters, ListSortType, SortOrder } from '~/types/sortFilterTypes';

interface ListSearachResultsProps {
  results: SearchPublicListResult[];
  loading: boolean;

  sort: ListSortType;
  order: SortOrder;
  filters: ListFilters;

  onPressItem: (item: SearchPublicListResult) => void;
}

export default function ListSearchResults({
  results,
  loading,
  sort,
  order,
  filters = DEFAULT_LIST_FILTERS,
  onPressItem,
}: ListSearachResultsProps) {
  const theme = useTheme();
  const bottomTabBarHeight = useBottomTabBarHeight();

  const filteredResults = results.filter((item) => {
    if (filters.listType && item.list_type !== filters.listType) return false;
    if (filters.likesMin !== null && item.like_count < filters.likesMin) return false;
    if (filters.likesMax !== null && item.like_count > filters.likesMax) return false;
    if (filters.itemsMin !== null && item.item_count < filters.itemsMin) return false;
    if (filters.itemsMax !== null && item.item_count > filters.itemsMax) return false;
    return true;
  });

  const sortedListResults = [...filteredResults].sort((a, b) => {
    const dir = order === 'ascending' ? 1 : -1;

    switch (sort) {
      case 'name':
        return a.name.localeCompare(b.name) * dir;

      case 'likes':
        return (a.like_count - b.like_count) * dir;

      default:
        return 0;
    }
  });

    if (loading) {
    return (
      <View className="mb-20 flex-1 justify-center px-4">
        <ActivityIndicator size="large" color={theme.primary[700]} />
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View className="mb-20 flex-1 justify-center px-4">
        <Text className="text-center font-SpaceGrotesk-Medium text-primary-700 dark:text-primary-400">
          No results to show.{'\n'}
          Start by searching for lists.
        </Text>
      </View>
    );
  }

  if (sortedListResults.length === 0) {
    return (
      <View className="mb-20 flex-1 justify-center px-4">
        <Text className="text-center font-SpaceGrotesk-Medium text-primary-700 dark:text-primary-400">
          No results match your filters.
        </Text>
      </View>
    );
  }

  const hasFilters = filteredResults.length !== results.length;

  return (
    <View className="flex-1 gap-y-1 px-4">
      <Text className="w-full pr-1 text-right font-SpaceGrotesk-Medium text-sm text-primary-400 dark:text-primary-600">
        {hasFilters
          ? `${filteredResults.length} OF ${results.length} ${results.length === 1 ? 'RESULT' : 'RESULTS'}`
          : `${results.length} ${results.length === 1 ? 'RESULT' : 'RESULTS'}`}
      </Text>
      <FlatList
        data={sortedListResults}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 12, paddingBottom: bottomTabBarHeight }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPressItem(item)}
            activeOpacity={0.85}
            className="overflow-hidden rounded-xl bg-primary-100 dark:bg-primary-900">
            {/* Main: list name + description + likes */}
            <View className="px-4 pb-3 pt-4">
              <View className="flex-row items-start gap-3">
                <View className="min-w-0 flex-1">
                  <Text className="font-SpaceGrotesk-SemiBold text-xl leading-6 text-primary-950 dark:text-primary-50">
                    {item.name}
                  </Text>
                  {!!item.description && (
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      className="mt-2 font-SpaceGrotesk-Light text-base leading-5 text-primary-600 dark:text-primary-400">
                      {item.description}
                    </Text>
                  )}
                </View>
                <View className="shrink-0 flex-row items-center gap-x-1 pt-0.5">
                  <Text className="font-SpaceGrotesk-Light text-sm text-primary-700 dark:text-primary-300">
                    {item.like_count}
                  </Text>
                  <Heart
                    size={14}
                    color={theme.primary[700]}
                    fill={item.is_liked ? theme.primary[700] : theme.primary[100]}
                  />
                </View>
              </View>
            </View>

            <View className="h-px w-full bg-primary-200 dark:bg-primary-800" />

            {/* Footer: owner + item count */}
            <View className="flex-row items-center justify-between gap-3 px-4 pb-4 pt-3">
              {item.owner ? (
                <View className="min-w-0 flex-1 flex-row items-center gap-2">
                  {item.owner.avatar_url ? (
                    <Image
                      source={{ uri: getPublicUrl(item.owner.avatar_url) }}
                      className="h-7 w-7 rounded-full"
                    />
                  ) : (
                    <View className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
                      <UserRound size={14} color={theme.primary[900]} />
                    </View>
                  )}
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="font-SpaceGrotesk-Regular text-sm text-primary-700 dark:text-primary-300">
                    {item.owner.display_name}
                  </Text>
                </View>
              ) : (
                <View className="flex-1" />
              )}
              <View className="shrink-0 rounded-lg bg-primary-200 px-2 py-1 dark:bg-primary-800">
                <Text className="font-SpaceGrotesk-Light text-sm text-primary-700 dark:text-primary-400">
                  {item.item_count} {item.item_count === 1 ? 'Item' : 'Items'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
