import { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { useAuth } from '~/context/AuthContext';
import { useTheme } from '~/hooks/useTheme';
import { useReviews } from '~/store/reviewStore';
import ReviewItem from './ReviewItem';
import AddReviewForm from './AddReviewForm';
import Toast from 'react-native-toast-message';

interface MediaReviewSectionProps {
  mediaId: number;
  setShrinkHeader: (shrink: boolean) => void;
}

export default function MediaReviewSection({ mediaId, setShrinkHeader }: MediaReviewSectionProps) {
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

  const debugReviews = useMemo(() => {
    if (sortedReviews.length === 1) {
      const base = sortedReviews[0];

      return Array.from({ length: 15 }).map((_, index) => ({
        ...base,
        id: Number(`${base.id}${index}`), // ensure unique key
      }));
    }

    return sortedReviews;
  }, [sortedReviews]);

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
        <View className="flex-1 justify-between">
          {isLoading ? (
            <ActivityIndicator
              className="flex-1 items-center justify-center"
              color={theme.primary[950]}
            />
          ) : (
            <FlatList
              data={debugReviews}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => (
                <ReviewItem review={item} isUser={item.user_id === user?.id} />
              )}
              onScroll={(e) => {
                const y = e.nativeEvent.contentOffset.y;
                setShrinkHeader(y > 30);
              }}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode='on-drag'
            />
          )}
          {!hasReviewed && <AddReviewForm onSubmitReview={handleSubmitReview} />}
        </View>
    </KeyboardAvoidingView>
  );
}
