import { View, TouchableOpacity, ImageBackground, Modal, Pressable, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useEffect, useState } from 'react';
import { Media, TVDetails } from '~/types/supabaseTypes';
import ListSelectionModal from '~/components/ListSelectionModal';
import { useAuth } from '~/context/AuthContext';
import Toast from 'react-native-toast-message';
import MediaTabs from '~/components/MediaTabs';
import MediaHeader from '~/components/MediaHeader';
import { useLists } from '~/store/listStore';
import TimestampPicker from '~/components/TimestampPicker';
import { useMedia } from '~/store/mediaStore';
import PostCommentForm from '~/components/PostCommentForm';
import { useComments } from '~/store/commentStore';

const CONTENT_OPTIONS = ['Comments'];

export default function MediaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { mediaDetails, loadingIds, fetchMediaDetails } = useMedia();
  const params = useLocalSearchParams<{ id: string; mediaData: string }>();
  const media: Media = JSON.parse(params.mediaData as string);
  const theme = useTheme();
  const details = mediaDetails[media.id];
  const isLoading = loadingIds.has(media.id);
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const backdrop = media.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${media.backdrop_path}`
    : null;
  const poster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null;
  const [shrinkHeader, setShrinkHeader] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const { postComment } = useComments();
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

  useEffect(() => {
    if (!details) {
      fetchMediaDetails(media.id);
    }
  }, [media.id]);

  const handleAddToList = async (listId: number) => {
    if (!listId || !user?.id) return;
    setListModalVisible(false);
    setLoading(true);
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
    } else {
      Toast.show({
        type: 'success',
        text1: 'Item was added to your list!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    }
    setLoading(false);
  };

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

  const handleSubmitComment = async (content: string, isSpoiler: boolean) => {
    if (user?.id) {
      const result = await postComment({
        content,
        is_spoiler: isSpoiler,
        user_id: user.id,
        media_id: media.id,
        season_number: media.media_type === 'tv' ? season : null,
        episode_number: media.media_type === 'tv' ? episode : null,
        timestamp_seconds: timestamp,
        parent_comment_id: null,
      });

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Comment Posted!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          onPress: () => Toast.hide(),
        });
      } else {
        Toast.show({
          type: 'error',
          text1: result.error || 'Failed to post your comment',
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => Toast.hide(),
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'An unexpected error ocurred while posting your comment.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    }
  };

  const TimestampSkeleton = () => (
    <View className="py-2">
      <View className="mb-2 h-9 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
      <View className="h-6 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
    </View>
  );

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
              <View className="flex-row gap-x-2">
                <TouchableOpacity
                  disabled={loading}
                  onPress={() => setListModalVisible(true)}
                  className="rounded-full bg-primary-900/40 p-2 dark:bg-primary-100/40">
                  <Plus className="text-primary-50 dark:text-primary-950" size={24} />
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-1 px-4">
              <MediaHeader
                media={media}
                shrinkHeader={shrinkHeader}
                onPosterPress={() => {
                  setPreviewImage(`https://image.tmdb.org/t/p/w780${media.poster_path}`);
                }}
              />

              <MediaTabs
                selectedIndex={selectedSegment}
                onChange={setSelectedSegment}
                options={CONTENT_OPTIONS}
              />
              {!details && isLoading ? (
                <TimestampSkeleton />
              ) : details ? (
                <TimestampPicker
                  mediaType={media.media_type}
                  details={mediaDetails[media.id]}
                  selectedTimestamp={timestamp}
                  selectedSeason={season}
                  selectedEpisode={episode}
                  onTimestampChange={setTimestamp}
                  onSeasonChange={setSeason}
                  onEpisodeChange={setEpisode}
                />
              ) : null}

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
            {selectedSegment === 0 && (
              <PostCommentForm
                onSubmitComment={async (content, isSpoiler) => {
                  handleSubmitComment(content, isSpoiler);
                }}
              />
            )}
            <ListSelectionModal
              visible={listModalVisible}
              onClose={() => setListModalVisible(false)}
              onConfirm={handleAddToList}
            />
            <Modal visible={!!previewImage} transparent animationType="fade">
              <View className="flex-1 items-center justify-center bg-primary-950">
                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => setPreviewImage(null)}
                  className="absolute left-6 top-16 z-10">
                  <X size={28} color="white" />
                </TouchableOpacity>

                {previewImage && (
                  <Image
                    source={{ uri: previewImage }}
                    resizeMode="contain"
                    style={{ width: '100%', height: '75%' }}
                  />
                )}
              </View>
            </Modal>
          </SafeAreaView>
        </BlurView>
      </ImageBackground>
    </View>
  );
}
