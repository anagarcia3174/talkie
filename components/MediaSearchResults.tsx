import {
  DEFAULT_MEDIA_FILTERS,
  MediaFilters,
  MediaSortType,
  SortOrder,
} from '~/types/sortFilterTypes';
import { Media } from '~/types/supabaseTypes';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ImageOff, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '~/hooks/useTheme';

interface MediaSearchResultsProps {
  results: Media[];
  loading: boolean;

  sort: MediaSortType;
  order: SortOrder;
  filters: MediaFilters;

  onPressItem: (item: Media) => void;
}

export default function MediaSearchResults({
  results,
  loading,
  sort,
  order,
  filters = DEFAULT_MEDIA_FILTERS,
  onPressItem,
}: MediaSearchResultsProps) {
  const bottomTabBarHeight = useBottomTabBarHeight();
  const theme = useTheme();

  const filteredResults = results.filter((item) => {
    if (filters.mediaType && item.media_type !== filters.mediaType) return false;
    const year = item.release_date ? new Date(item.release_date).getFullYear() : null;
    if (filters.releaseYearMin !== null && (year === null || year < filters.releaseYearMin))
      return false;
    if (filters.releaseYearMax !== null && (year === null || year > filters.releaseYearMax))
      return false;
    const rating = item.vote_average ?? null;
    if (filters.ratingMin !== null && (rating === null || rating < filters.ratingMin)) return false;
    if (filters.ratingMax !== null && (rating === null || rating > filters.ratingMax)) return false;
    return true;
  });

  const sortedMediaResults = [...filteredResults].sort((a, b) => {
    const dir = order === 'ascending' ? 1 : -1;

    switch (sort) {
      case 'title':
        return a.title.localeCompare(b.title) * dir;

      case 'release_date':
        return (
          (new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime()) * dir
        );

      case 'rating':
        return ((a.vote_average ?? 0) - (b.vote_average ?? 0)) * dir;

      case 'relevance':
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
          Start by searching for media.
        </Text>
      </View>
    );
  }

  const hasFilters = filteredResults.length !== results.length;

  if (sortedMediaResults.length === 0) {
    return (
      <View className="mb-20 flex-1 justify-center px-4">
        <Text className="text-center font-SpaceGrotesk-Medium text-primary-700 dark:text-primary-400">
          No results match your filters.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 gap-y-1 px-4">
      <Text className="w-full text-right font-SpaceGrotesk-Medium text-sm text-primary-400 dark:text-primary-600">
        {hasFilters
          ? `${filteredResults.length} OF ${results.length} ${results.length === 1 ? 'RESULT' : 'RESULTS'}`
          : `${results.length} ${results.length === 1 ? 'RESULT' : 'RESULTS'}`}
      </Text>
      <FlatList
        data={sortedMediaResults.slice(1)}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          gap: 8,
        }}
        contentContainerStyle={{
          gap: 8,
          paddingBottom: bottomTabBarHeight,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => {
          const top = sortedMediaResults[0];
          const heroUri = top.backdrop_path
            ? `https://image.tmdb.org/t/p/w780${top.backdrop_path}`
            : top.poster_path
              ? `https://image.tmdb.org/t/p/w500${top.poster_path}`
              : null;
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onPressItem(top)}
              className="w-full overflow-hidden rounded-md bg-primary-100  dark:bg-primary-900">
              {heroUri ? (
                <Image
                  source={{ uri: heroUri }}
                  className="h-52 w-full bg-primary-200 dark:bg-primary-800"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-52 w-full items-center justify-center bg-primary-400 dark:bg-primary-800">
                  <ImageOff size={48} color={theme.primary[700]} />
                </View>
              )}

              <LinearGradient
                pointerEvents="none"
                colors={['transparent', 'rgba(17,17,17,0.60)', 'rgba(17,17,17,0.99)']}
                locations={[0, 0.4, 1]}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 100,
                }}
              />

              <View
                className="absolute bottom-0 left-0 right-0 flex-row items-end justify-between px-4 pb-3.5 pt-10"
                pointerEvents="box-none">
                <View className="flex-1 pr-3">
                  <Text
                    className="font-SpaceGrotesk-SemiBold text-lg text-primary-50"
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {top.title}
                  </Text>

                  <View className="mt-1 flex-row flex-wrap items-center gap-x-2 gap-y-0.5">
                    <Text className="text-md font-SpaceGrotesk-Regular text-primary-300">
                      {top.release_date?.split('-')[0]}
                    </Text>
                    <Star
                      size={14}
                      color={theme.isDark ? 'gold' : 'goldenrod'}
                      fill={theme.isDark ? 'gold' : 'goldenrod'}
                    />
                    <Text className="text-md font-SpaceGrotesk-Regular text-primary-300">
                      {top.vote_average?.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => onPressItem(item)}
              activeOpacity={0.85}
              style={{ flex: 1 }}>
              <View className="relative w-full overflow-hidden rounded  bg-primary-100 px-1 pt-1 dark:bg-primary-900">
                {item.poster_path ? (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w185${item.poster_path}` }}
                    className="w-full"
                    style={{ aspectRatio: '2/3' }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className="w-full items-center justify-center"
                    style={{ aspectRatio: '2/3' }}>
                    <ImageOff size={48} color={theme.primary[700]} />
                  </View>
                )}

                <View className="flex-row items-center p-1">
                  <View className="flex-1 items-center">
                    <Text className="font-SpaceGrotesk-Medium text-xs text-primary-950 dark:text-primary-50">
                      {item.release_date ? item.release_date.split('-')[0] : 'N/A'}
                    </Text>
                  </View>
                  <View className="h-3 w-px bg-primary-600" />
                  <View className="flex-1 flex-row items-center justify-center gap-x-1">
                    <Star size={10} color={theme.isDark ? 'gold' : 'goldenrod'} fill={theme.isDark ? 'gold' : 'goldenrod'} />
                    <Text className="font-SpaceGrotesk-Medium text-xs text-primary-950 dark:text-primary-50">
                      {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
