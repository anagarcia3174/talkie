import { useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useAuth } from '~/context/AuthContext';
import { useTheme } from '~/hooks/useTheme';
import { useReviews } from '~/store/reviewStore';
import ReviewItem from './ReviewItem';
import AddReviewForm from './AddReviewForm';
import Toast from 'react-native-toast-message';

interface MediaReviewSectionProps {
  mediaId: number;
}

export default function MediaReviewSection({ mediaId }: MediaReviewSectionProps) {
  const { fetchReviewsForMedia, fetchedReviews, submitReview } = useReviews();
  const { user } = useAuth();
  const theme = useTheme();
  const mediaReviews = fetchedReviews[mediaId];
  const reviews = mediaReviews?.reviews ?? [];
  const isLoading = mediaReviews?.isLoading ?? false;
  const error = mediaReviews?.error ?? null;

  const sortedReviews = useMemo(() => {
    if (!user?.id) return reviews;

    return [...reviews].sort((a, b) => {
      if (a.user_id === user.id) return -1;
      if (b.user_id === user.id) return 1;
      return 0;
    });
  }, [reviews, user?.id]);

  const hasReviewed = reviews.some((r) => r.user_id === user?.id);

  useEffect(() => {
    if (!mediaReviews || (!mediaReviews.hasFetched && !mediaReviews.isLoading)) {
      fetchReviewsForMedia(mediaId);
    }
  }, [mediaId]);

  const handleSubmitReview = async (rating: number, content: string) => {
    if (user?.id) {
      const result = await submitReview({
        rating,
        content,
        user_id: user.id,
        media_id: mediaId,
      });

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Review Posted!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          onPress: () => Toast.hide(),
        });
      } else {
        Toast.show({
          type: 'error',
          text1: result.error || 'Failed to post your review',
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => Toast.hide(),
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'An unexpected error ocurred while posting your review',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    }
  };

  return (
    <View className='flex-1 justify-between'>
      {isLoading ? (
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
            <ReviewItem review={item} isUser={item.user_id === user?.id} />
          )}
          scrollEventThrottle={16}
        />
      )}
      {!hasReviewed && <AddReviewForm onSubmitReview={handleSubmitReview} />}
    </View>
  );
}
