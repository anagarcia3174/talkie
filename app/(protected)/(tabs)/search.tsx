import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { ArrowDownUp, Search as SearchIcon } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useState } from 'react';
import { searchMedia } from '~/services/mediaService';
import { Media, SearchPublicListResult } from '~/types/supabaseTypes';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useLists } from '~/store/listStore';
import { haptics } from '~/utils/haptics';
import MediaSearchResults from '~/components/MediaSearchResults';
import ListSearchResults from '~/components/ListSearchResults';
import {
  DEFAULT_LIST_FILTERS,
  DEFAULT_MEDIA_FILTERS,
  ListFilters,
  ListSortType,
  MediaFilters,
  MediaSortType,
  SortOrder,
} from '~/types/sortFilterTypes';
import MediaSortAndFilterModal from '~/components/MediaSortAndFilterModal';
import ListSortAndFilterModal from '~/components/ListSortAndFilterModal';
import { searchLists } from '~/services/listService';

const SEARCH_OPTIONS = ['Media', 'Lists'];

export default function Search() {
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState('');
  const [mediaResults, setMediaResults] = useState<Media[]>([]);
  const [listResults, setListResults] = useState<SearchPublicListResult[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const { cacheList } = useLists();
  const theme = useTheme();
  const router = useRouter();
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const [mediaSort, setMediaSort] = useState<{
    sort: MediaSortType;
    order: SortOrder;
  }>({
    sort: 'relevance',
    order: 'descending',
  });

  const [listSort, setListSort] = useState<{
    sort: ListSortType;
    order: SortOrder;
  }>({
    sort: 'relevance',
    order: 'descending',
  });

  const [mediaFilters, setMediaFilters] = useState<MediaFilters>(DEFAULT_MEDIA_FILTERS);
  const [listFilters, setListFilters] = useState<ListFilters>(DEFAULT_LIST_FILTERS);

  const onSegmentChange = (index: number) => {
    haptics.action();
    setSelected(index);
    setQuery('');

    if (index === 0) {
      setMediaSort({ sort: 'relevance', order: 'descending' });
      setMediaFilters(DEFAULT_MEDIA_FILTERS);
    } else {
      setListSort({ sort: 'relevance', order: 'descending' });
      setListFilters(DEFAULT_LIST_FILTERS);
    }
  };

  const onSearchMedia = async () => {
    if (query.trim() === '' || query.trim().length <= 2) return;
    setMediaLoading(true);
    const result = await searchMedia(query);
    setMediaLoading(false);

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
    setListLoading(true);
    const listResult = await searchLists(query);
    setListLoading(false);
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

  const handleListPress = (result: SearchPublicListResult) => {
    cacheList(result);

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
        <View className="flex-row gap-0.5 px-1.5 pb-1.5 pt-1">
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
      {selected === 0 && (
        <MediaSearchResults
          results={mediaResults}
          loading={mediaLoading}
          sort={mediaSort.sort}
          order={mediaSort.order}
          filters={mediaFilters}
          onPressItem={(item) =>
            router.push({
              pathname: '/media/[id]',
              params: { id: item.id.toString(), mediaData: JSON.stringify(item) },
            })
          }
        />
      )}
      {selected === 1 && (
        <ListSearchResults
          results={listResults}
          loading={listLoading}
          sort={listSort.sort}
          order={listSort.order}
          filters={listFilters}
          onPressItem={handleListPress}
        />
      )}
      <MediaSortAndFilterModal
        isVisible={sortModalVisible && selected === 0}
        onClose={() => setSortModalVisible(false)}
        sort={mediaSort.sort}
        order={mediaSort.order}
        filters={mediaFilters}
        onApply={(sort, order, filters) => {
          setMediaSort({ sort, order });
          setMediaFilters(filters);
          setSortModalVisible(false);
        }}
      />
      <ListSortAndFilterModal
        isVisible={sortModalVisible && selected === 1}
        onClose={() => setSortModalVisible(false)}
        sort={listSort.sort}
        order={listSort.order}
        filters={listFilters}
        onApply={(sort, order, filters) => {
          setListSort({ sort, order });
          setListFilters(filters);
          setSortModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
