import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '~/components/Header';
import TrendingSection from '~/components/TrendingSection';
import { useMedia } from '~/store/mediaStore';
import { ScrollView, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import MediaRowSection from '~/components/MediaRowSection';
import { useEffect, useState } from 'react';
import LibraryProgressChart from '~/components/LibraryProgressChart';
import { useLists } from '~/store/listStore';

import Toast from 'react-native-toast-message';

export default function Home() {
  const { fetchHomeData, trendingMovies, trendingShows } = useMedia();
  const tabBarHeight = useBottomTabBarHeight();
  const { listsById, defaultListIds, addItemToList, listItems, hydrateDefaultLists } = useLists();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trendingMovies.length === 0 || trendingShows.length === 0) {
      fetchHomeData();
    }
  }, [trendingMovies.length, trendingShows.length, fetchHomeData]);

  useEffect(() => {
    if (defaultListIds.library) {
      hydrateDefaultLists();
    }
  }, [defaultListIds.library, hydrateDefaultLists]);

  const library = defaultListIds.library != null ? listsById[defaultListIds.library] : null;

  const addMediaToLibrary = async (mediaId: number): Promise<void> => {
    if (!library) return;

    setLoading(true);
    Toast.show({
      type: 'info',
      text1: 'Adding to library...',
      autoHide: true,
    });

    try {
      const result = await addItemToList(library.id, mediaId, library.user_id);

      if (!result.success) {
        Toast.show({
          type: 'error',
          text1: result.error || 'Failed to add item to your library',
          visibilityTime: 4000,
          autoHide: true,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Added to Library!',
          autoHide: true,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'An unexpected error ocurred while adding the item to your library',
        visibilityTime: 4000,
        autoHide: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      <Header />
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarHeight, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-around px-0">
          {library && <LibraryProgressChart items={listItems[library.id] || []} />}
          <TrendingSection
            title="Trending Movies"
            movies={trendingMovies}
            onAddToLibrary={addMediaToLibrary}
          />
          <MediaRowSection
            movies={trendingShows}
            title="Trending Shows"
            onAddToLibrary={addMediaToLibrary}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
