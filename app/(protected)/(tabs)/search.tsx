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
import { ArrowDownUp, ImageOff } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { searchMedia } from '~/services/mediaService';
import { List, Media } from '~/types/supabaseTypes';
import { useRouter } from 'expo-router';
import { Toast } from 'toastify-react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useLists } from '~/store/listStore';

const SEARCH_OPTIONS = ['Media', 'Lists'];
const ROW_GAP = 16;

export default function Search() {
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState('');
  const [mediaResults, setMediaResults] = useState<Media[]>([]);
  const [listResults, setListResults] = useState<List[]>([]);
  const [loading, setLoading] = useState(false);
  const { searchLists } = useLists();
  const theme = useTheme();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const activeResults = selected === 0 ? mediaResults : listResults;

  const onSegmentChange = (index: number) => {
    setSelected(index);
    setQuery('');
    setMediaResults([]);
    setListResults([]);
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

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      {/* Header */}
      <View className="mb-2 flex-row items-center justify-start px-4">
        <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
          Search
        </Text>
      </View>

      {/* Search + Sort */}
      <View className="flex-row items-center justify-between gap-x-2 px-4 py-2">
        <TextInput
          className="text-md flex-1 rounded-xl border border-primary-700 py-3 pl-4 font-SpaceGrotesk-Light text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-400 dark:text-primary-200 focus:dark:border-primary-50"
          cursorColor={theme.primary[700]}
          selectionColor={theme.primary[700]}
          placeholder={`Search for ${SEARCH_OPTIONS[selected]}`}
          placeholderTextColor={theme.primary[500]}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSubmitSearch}
        />
        <ArrowDownUp color={theme.primary[950]} />
      </View>
      {/* Filter Slider */}
      <View className="mt-1 px-4">
        <SegmentedControl
          values={SEARCH_OPTIONS}
          selectedIndex={selected}
          onChange={(event) => {
            onSegmentChange(event.nativeEvent.selectedSegmentIndex);
          }}
          tintColor={theme.primaryOpacity[950]}
          fontStyle={{
            color: theme.primary[600],
            fontSize: 15,
            fontFamily: 'SpaceGrotesk-Light',
          }}
          activeFontStyle={{
            color: theme.primary[950],
            fontSize: 15,
            fontFamily: 'SpaceGrotesk-Medium',
          }}
        />
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
        <FlatList
          data={mediaResults}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          style={{ marginBottom: tabBarHeight }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: 16,
          }}
          contentContainerStyle={{
            paddingTop: 16,
            gap: ROW_GAP,
          }}
          showsVerticalScrollIndicator={false}
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
                style={{ flex: 1, maxWidth: '31%' }}>
                <View className="relative w-full overflow-hidden rounded-xl bg-primary-400 dark:bg-primary-800">
                  {item.poster_path ? (
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w342${item.poster_path}` }}
                      className="h-56 w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-56 w-full items-center justify-center">
                      <ImageOff size={48} color={theme.primary[700]} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
      {!loading && selected === 1 && listResults.length > 0 && (
        <FlatList
          data={listResults}
          keyExtractor={(item) => item.id.toString()}
          style={{ marginBottom: tabBarHeight }}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              className="rounded-xl bg-primary-100 p-4 dark:bg-primary-900">
              <Text className="font-SpaceGrotesk-Medium text-lg text-primary-950 dark:text-primary-50">
                {item.name}
              </Text>
              {!!item.description && (
                <Text className="mt-1 font-SpaceGrotesk-Light text-primary-600 dark:text-primary-400">
                  {item.description}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
