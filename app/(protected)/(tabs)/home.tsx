import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '~/components/Header';
import TrendingSection from '~/components/TrendingSection';
import { useMedia } from '~/store/mediaStore';
import { ScrollView, View } from 'react-native';
import MediaRowSection from '~/components/MediaRowSection';
import { useEffect, useState } from 'react';
import LibraryProgressChart from '~/components/LibraryProgressChart';
import { useList } from '~/store/listStore';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Toast from 'react-native-toast-message';
import LoadingScreen from '~/components/LoadingScreen';
import ErrorScreen from '~/components/ErrorScreen';
import { haptics } from '~/utils/haptics';
import RecentCommentsSection from '~/components/RecentCommentsSection';

export default function Home() {
  const { fetchHomeData, trendingMovies, trendingShows } = useMedia();
  const tabBarHeight = useBottomTabBarHeight();
  const { listsById, defaultListIds, addItemToList, listItems, hydrateDefaultLists } = useList();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoading = loading && trendingMovies.length === 0 && trendingShows.length === 0;

  useEffect(() => {
    const loadHomeData = async () => {
      if (trendingMovies.length > 0 && trendingShows.length > 0) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchHomeData();

        if (!result.success) {
          setError(result.error);
          Toast.show({
            type: 'error',
            text1: result.error || 'Failed to load home data',
          });
        }
      } catch {
        setError('Unexpected error occurred');
        Toast.show({
          type: 'error',
          text1: 'Unexpected error occurred',
        });
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [trendingMovies.length, trendingShows.length, fetchHomeData]);

  useEffect(() => {
    if (defaultListIds.library) {
      hydrateDefaultLists();
    }
  }, [defaultListIds.library, hydrateDefaultLists]);

  const library = defaultListIds.library != null ? listsById[defaultListIds.library] : null;

  const addMediaToLibrary = async (mediaId: number): Promise<void> => {
    if (!library) return;

    Toast.show({
      type: 'info',
      text1: 'Adding to library...',
      autoHide: true,
    });

    try {
      const result = await addItemToList(library.id, mediaId);

      if (!result.success) {
        haptics.error();
        Toast.show({
          type: 'error',
          text1: result.error || 'Failed to add item to your library',
          visibilityTime: 4000,
          autoHide: true,
        });
      } else {
        haptics.success();
        Toast.show({
          type: 'success',
          text1: 'Added to Library!',
          autoHide: true,
        });
      }
    } catch {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: 'An unexpected error ocurred while adding the item to your library',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  if (loading) {
    return <LoadingScreen fullScreen={true} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      <Header />
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarHeight, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}>
        {isInitialLoading ? (
          <LoadingScreen fullScreen={false} />
        ) : error ? (
          <ErrorScreen title="Oops!" message={error} onRetry={() => fetchHomeData(true)} />
        ) : (
          <View className="flex-1 gap-y-4">
            {library && (
              <LibraryProgressChart items={listItems[library.id] || []} libraryId={library.id} />
            )}
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
            <RecentCommentsSection />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
