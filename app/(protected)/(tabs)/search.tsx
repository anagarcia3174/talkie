import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowDownUp,
  ImageOff,
  Bookmark,
  UserRound,
  Search as SearchIcon,
  Star,
  Heart,
} from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useState } from 'react';
import { searchMedia } from '~/services/mediaService';
import { Media, SearchPublicListResult } from '~/types/supabaseTypes';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useLists } from '~/store/listStore';
import SearchSortModal from '~/components/SearchSortModal';
import { getPublicUrl } from '~/utils/storageUrl';
import { haptics } from '~/utils/haptics';

const SEARCH_OPTIONS = ['Media', 'Lists'];
const ROW_GAP = 16;
export type SearchSortType = 'relevance' | 'alpha' | 'release' | 'rating' | 'item_count';

export type SortOrder = 'asc' | 'desc';

export type SearchSortContext = 'media' | 'lists';

export default function Search() {
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState('');
  const [mediaResults, setMediaResults] = useState<Media[]>([]);
  const [listResults, setListResults] = useState<SearchPublicListResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { searchLists, addListToState } = useLists();
  const theme = useTheme();
  const router = useRouter();
  const bottomTabBarHeight = useBottomTabBarHeight();
  const activeResults = selected === 0 ? mediaResults : listResults;
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const [mediaSort, setMediaSort] = useState<{
    sort: SearchSortType;
    order: SortOrder;
  }>({
    sort: 'relevance',
    order: 'desc',
  });

  const [listSort, setListSort] = useState<{
    sort: SearchSortType;
    order: SortOrder;
  }>({
    sort: 'alpha',
    order: 'asc',
  });
  const onSegmentChange = (index: number) => {
    haptics.action();
    setSelected(index);
    setQuery('');

    if (index === 0) {
      setMediaSort({ sort: 'relevance', order: 'desc' });
    } else {
      setListSort({ sort: 'alpha', order: 'asc' });
    }
  };

  const onSearchMedia = async () => {
    if (query.trim() === '' || query.trim().length <= 2) return;
    setLoading(true);
    const result = await searchMedia(query);
    setLoading(false);

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: result.error || 'There was an error performing the search.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } else if (!result.data || result.data.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No results found for your search.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } else {
      setMediaResults(result.data);
    }
  };

  const onSearchLists = async () => {
    if (query.trim() === '' || query.trim().length <= 2) return;
    setLoading(true);
    const listResult = await searchLists(query);
    setLoading(false);
    if (!listResult.success) {
      Toast.show({
        type: 'error',
        text1: listResult.error || 'There was an error performing the search.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } else if (!listResult.data || listResult.data.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No results found for your search.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } else {
      setListResults(listResult.data);
    }
  };

  const onSubmitSearch = async () => {
    if (selected === 0) {
      await onSearchMedia();
    } else {
      await onSearchLists();
    }
  };

  const sortedMediaResults = [...mediaResults].sort((a, b) => {
    const { sort, order } = mediaSort;
    const dir = order === 'asc' ? 1 : -1;

    switch (sort) {
      case 'alpha':
        return a.title.localeCompare(b.title) * dir;

      case 'release':
        return (
          (new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime()) * dir
        );

      case 'rating':
        return ((a.vote_average ?? 0) - (b.vote_average ?? 0)) * dir;

      case 'relevance':
      default:
        return 0; // TMDB already returns relevance-ranked results
    }
  });

  const sortedListResults = [...listResults].sort((a, b) => {
    const { sort, order } = listSort;
    const dir = order === 'asc' ? 1 : -1;

    switch (sort) {
      case 'alpha':
        return a.name.localeCompare(b.name) * dir;

      case 'item_count':
        return ((a.item_count ?? 0) - (b.item_count ?? 0)) * dir;

      default:
        return 0;
    }
  });

  const handleListPress = (result: SearchPublicListResult) => {
    addListToState(result);

    router.push({
      pathname: '/list/[id]',
      params: {
        id: result.id,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      {/* Header */}
      <View className="mb-2 flex-row items-center justify-start px-4">
        <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
          Search
        </Text>
      </View>

      {/* Bento tile: search + sort | segment */}
      <View className="mx-3 mb-1 overflow-hidden rounded-2xl  bg-primary-100 shadow-sm  dark:bg-primary-900">
        <View className="flex-row items-center gap-x-2.5 px-3 py-2">
          <SearchIcon size={17} color={theme.primary[500]} />
          <TextInput
            className="text-md flex-1 py-0.5 font-SpaceGrotesk-Light text-primary-950 dark:text-primary-200"
            cursorColor={theme.primary[700]}
            selectionColor={theme.primary[700]}
            placeholder={`Search for ${SEARCH_OPTIONS[selected]}`}
            placeholderTextColor={theme.primary[500]}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSubmitSearch}
            numberOfLines={1}
          />
          <TouchableOpacity
            className="rounded-lg bg-primary-300 p-1.5 dark:bg-primary-800"
            onPress={() => {
              haptics.action();
              setSortModalVisible(true);
            }}>
            <ArrowDownUp size={17} color={theme.primary[950]} />
          </TouchableOpacity>
        </View>
        <View className="h-px w-full bg-primary-200 dark:bg-primary-800" />
        <View className="flex-row gap-0.5 pt-1 px-1.5 pb-1.5">
          <TouchableOpacity
            onPress={() => onSegmentChange(0)}
            className={`flex-1 items-center rounded-lg rounded-bl-xl ${selected === 0 ? 'bg-primary-300 dark:bg-primary-800' : ''} py-1.5`}>
            <Text
              className={`text-md ${selected === 0 ? 'font-SpaceGrotesk-Medium text-primary-950 dark:text-primary-50' : 'font-SpaceGrotesk-Light text-primary-600 dark:text-primary-400'}  `}>
              Media
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onSegmentChange(1)}
            className={`flex-1 items-center rounded-lg rounded-br-xl ${selected === 1 ? 'bg-primary-300 dark:bg-primary-800' : ''} py-1.5`}>
            <Text
              className={`text-md ${selected === 1 ? 'font-SpaceGrotesk-Medium text-primary-950 dark:text-primary-50' : 'font-SpaceGrotesk-Light text-primary-600 dark:text-primary-400'}  `}>
              Lists
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading && (
        <View className="mb-20 flex-1 justify-center px-4">
          <ActivityIndicator size="large" color={theme.primary[700]} />
        </View>
      )}
      {!loading && activeResults.length === 0 && (
        <View className="mb-20 flex-1 justify-center px-4">
          <Text className="text-center font-SpaceGrotesk-Medium text-primary-700 dark:text-primary-400">
            No results to show.{'\n'}
            Start by searching for {SEARCH_OPTIONS[selected].toLowerCase()}.
          </Text>
        </View>
      )}
      {!loading && selected === 0 && mediaResults.length > 0 && (
        <View className="flex-1 gap-y-1 px-4">
          <Text className="w-full text-right font-SpaceGrotesk-Medium text-sm text-primary-400 dark:text-primary-600">
            {mediaResults.length} {mediaResults.length === 1 ? 'RESULT' : 'RESULTS'}
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
                  onPress={() => {
                    router.push({
                      pathname: '/media/[id]',
                      params: {
                        id: top.id.toString(),
                        mediaData: JSON.stringify(top),
                      },
                    });
                  }}
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
                        <Text className="font-SpaceGrotesk-Regular text-md text-primary-300">
                          {top.release_date?.split('-')[0]}
                        </Text>
                        <Star size={14} color={theme.isDark ? 'gold' : 'goldenrod'} fill={theme.isDark ? 'gold' : 'goldenrod'} />
                        <Text className="font-SpaceGrotesk-Regular text-md text-primary-300">
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
                  onPress={() => {
                    router.push({
                      pathname: '/media/[id]',
                      params: {
                        id: item.id.toString(),
                        mediaData: JSON.stringify(item),
                      },
                    });
                  }}
                  activeOpacity={0.85}
                  style={{ flex: 1 }}>
                  <View className="relative w-full overflow-hidden rounded  bg-primary-100 p-1 dark:bg-primary-900">
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

                    {item.vote_average != null && (
                      <View className="absolute right-1.5 top-2 flex-row items-center gap-x-0.5 rounded-full bg-primary-950/80 px-1.5 py-0.5">
                        <Star size={10} color={theme.isDark ? 'gold' : 'goldenrod'} fill={theme.isDark ? 'gold' : 'goldenrod'} />
                        <Text className="font-SpaceGrotesk-Medium text-sm text-primary-50">
                          {item.vote_average.toFixed(1)}
                        </Text>
                      </View>
                    )}

                    {item.release_date && (
                      <View className="absolute bottom-2 left-2 rounded-full bg-primary-950/80 px-1.5 py-0.5">
                        <Text className="font-SpaceGrotesk-Medium text-sm text-primary-50">
                          {item.release_date.split('-')[0]}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}
      {!loading && selected === 1 && listResults.length > 0 && (
        <View className="flex-1 gap-y-1 px-4">
          <Text className="w-full pr-1 text-right font-SpaceGrotesk-Medium text-sm text-primary-400 dark:text-primary-600">
            {listResults.length} {listResults.length === 1 ? 'RESULT' : 'RESULTS'}
          </Text>
          <FlatList
            data={sortedListResults}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ gap: 12, paddingBottom: bottomTabBarHeight }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleListPress(item)}
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
      )}
      <SearchSortModal
        isVisible={sortModalVisible}
        context={selected === 0 ? 'media' : 'lists'}
        onClose={() => {
          setSortModalVisible(false);
        }}
        onSelect={(sort, order) => {
          if (selected === 0) {
            setMediaSort({ sort, order });
          } else {
            setListSort({ sort, order });
          }
        }}
      />
    </SafeAreaView>
  );
}
