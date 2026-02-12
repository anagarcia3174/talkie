import {
  View,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, Plus, Star } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useEffect, useState } from 'react';
import { Media } from '~/types/supabaseTypes';
import ListSelectionModal from '~/components/ListSelectionModal';
import { useAuth } from '~/context/AuthContext';
import Toast from 'react-native-toast-message';
import MediaTabs from '~/components/MediaTabs';
import MediaHeader from '~/components/MediaHeader';
import { useLists } from '~/store/listStore';


const CONTENT_OPTIONS = ['Comments'];

export default function MediaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id: string; mediaData: string }>();
  const media: Media = JSON.parse(params.mediaData as string);
  const theme = useTheme();
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [listModalVisible, setListModalVisible] = useState(false);
  const backdrop = media.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${media.backdrop_path}`
    : null;
  const poster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null;
  const [shrinkHeader, setShrinkHeader] = useState(false);
  // const { submitReview, fetchReviewsForMedia } = useReviews();
  // const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  // const [loadingReviews, setLoadingReviews] = useState(true);
  // const userReview = reviews.find((r) => r.user_id === user?.id);
  // const otherReviews = reviews.filter((r) => r.user_id !== user?.id);
  const { addItemToList } = useLists();
  // const sortedReviews = userReview ? [userReview, ...otherReviews] : reviews;
  // const hasReviewed = !!userReview;

  // const loadReviews = async () => {
  //   setLoadingReviews(true);
  //   const result = await fetchReviewsForMedia(media.id);
  //   if (result.success) {
  //     setReviews(result.data || []);
  //   }
  //   setLoadingReviews(false);
  // };

  // useEffect(() => {
  //   loadReviews();
  // }, [media.id]);

  const handleAddToList = async (listId: number) => {
    if(!listId || !user?.id) return;
    setListModalVisible(false);

    Toast.show({
      type: 'info',
      text1: 'Adding to list...',
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      onPress: () => Toast.hide(),
    });

    const result = await addItemToList(listId, media.id, user.id);

    if (!result.success) {
      Toast.show({
          type: 'error',
          text1: result.error || 'Failed to add item to your list',
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => Toast.hide(),
        });
    }else {
      Toast.show({
          type: 'success',
          text1: 'Item was added to your list!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          onPress: () => Toast.hide(),
        });
    }
  }

  // const handleSubmitReview = async (rating: number, content: string) => {
  //   if (user?.id) {
  //     const result = await submitReview({
  //       rating,
  //       content,
  //       user_id: user.id,
  //       media_id: media.id,
  //     });

  //     if (result.success) {
  //       await loadReviews();

  //       Toast.show({
  //         type: 'success',
  //         text1: 'Review Posted!',
  //         position: 'top',
  //         visibilityTime: 3000,
  //         autoHide: true,
  //         onPress: () => Toast.hide(),
  //       });
  //     } else {
  //       Toast.show({
  //         type: 'error',
  //         text1: result.error || 'Failed to post your review',
  //         position: 'top',
  //         visibilityTime: 4000,
  //         autoHide: true,
  //         onPress: () => Toast.hide(),
  //       });
  //     }
  //   } else {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'An unexpected error ocurred while posting your review',
  //       position: 'top',
  //       visibilityTime: 4000,
  //       autoHide: true,
  //       onPress: () => Toast.hide(),
  //     });
  //   }
  // };

  return (
    <View className="flex-1 bg-primary-50 dark:bg-primary-950">
      <ImageBackground
        source={{ uri: backdrop || poster || undefined }}
        resizeMode="cover"
        className="h-full w-full">
        <BlurView
          intensity={theme.isDark ? 90 : 80}
          tint={theme.isDark ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
          className="flex-1 bg-primary-50/30 dark:bg-primary-950/40">
          <SafeAreaView className="flex-1" edges={['top']}>
            {/* Header Buttons */}
            <View className="flex-row justify-between px-4 ">
              <TouchableOpacity
                className="rounded-full bg-primary-900/40 p-2 dark:bg-primary-100/40"
                onPress={() => router.back()}>
                <ArrowLeft className="text-primary-50 dark:text-primary-950" size={24} />
              </TouchableOpacity>
              <View className='flex-row gap-x-2'>
              
              <TouchableOpacity
                onPress={() => setListModalVisible(true)}
                className="rounded-full bg-primary-900/40 p-2 dark:bg-primary-100/40">
                <Plus className="text-primary-50 dark:text-primary-950" size={24} />
              </TouchableOpacity>
              </View>
            </View>
            <View className="flex-1 px-4">
              <MediaHeader media={media} shrinkHeader={shrinkHeader} />
              <MediaTabs
                selectedIndex={selectedSegment}
                onChange={setSelectedSegment}
                options={CONTENT_OPTIONS}
              />
              {/* {selectedSegment === 0 &&
                (loadingReviews ? (
                  <ActivityIndicator
                    className="flex-1 items-center justify-center"
                    color={theme.primary[950]}
                  />
                ) : (
                  <FlatList
                    data={sortedReviews}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 8 }}
                    renderItem={({ item }) => (
                      <ReviewItem review={item} isUser={userReview && userReview.id === item.id} />
                    )}
                    onScroll={(e) => {
                      const y = e.nativeEvent.contentOffset.y;
                      setShrinkHeader(y > 30);
                    }}
                    scrollEventThrottle={16}
                  />
                ))} */}
            </View>
            {/* {!hasReviewed && <AddReviewForm onSubmitReview={handleSubmitReview} />} */}
            <ListSelectionModal
              visible={listModalVisible}
              onClose={() => setListModalVisible(false)}
              onConfirm={handleAddToList}
            />
          </SafeAreaView>
        </BlurView>
      </ImageBackground>
    </View>
  );
}
