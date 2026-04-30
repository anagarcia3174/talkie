import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, View } from 'react-native';
import { useAuth } from '~/context/AuthContext';
import { useTheme } from '~/hooks/useTheme';
import { useReviews } from '~/store/reviewStore';
import ReviewItem from './ReviewItem';
import Toast from 'react-native-toast-message';
import ErrorScreen from './ErrorScreen';
import ReviewForm from './ReviewForm';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '~/utils/haptics';

interface MediaReviewSectionProps {
  mediaId: number;
  releaseDate?: string | null;
}

const hasDatePassed = (dateString?: string | null) => {
  if (!dateString) return false;

  const now = new Date();
  const date = new Date(dateString + 'T00:00:00'); // 👈 normalize

  return date <= now;
};

export default function MediaReviewSection({ mediaId, releaseDate }: MediaReviewSectionProps) {
  const { fetchReviewsForMedia, fetchedReviews, submitReview } = useReviews();
  const { user } = useAuth();
  const theme = useTheme();
  const mediaReviews = fetchedReviews[mediaId];
  const reviews = mediaReviews?.reviews ?? [];
  const isLoading = mediaReviews?.isLoading ?? false;
  const error = mediaReviews?.error ?? null;
  const insets = useSafeAreaInsets();
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
        haptics.success();
        Toast.show({
          type: 'success',
          text1: 'Review Posted!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          onPress: () => Toast.hide(),
        });
      } else {
        haptics.error();
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
      haptics.error();
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

  const disabledReason = useMemo(() => {
    if (!releaseDate) return 'Release date unknown';

    if (!hasDatePassed(releaseDate)) {
      return 'Not released yet';
    }

    return null;
  }, [releaseDate]);

  return (
    <View className="flex-1">
      {isLoading ? (
        <ActivityIndicator
          className="flex-1 items-center justify-center"
          color={theme.primary[950]}
        />
      ) : error ? (
        <ErrorScreen fullScreen={false} title="Oops!" message={error} />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={sortedReviews}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 165,
          }}
          renderItem={({ item }) => <ReviewItem review={item} isUser={item.user_id === user?.id} />}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
      {!hasReviewed && (
        <View
          style={{
            position: 'absolute',
            left: 4,
            right: 4,
            bottom: 16,
            zIndex: 1000,
            elevation: 10,
            marginBottom: insets.bottom * 0.2,
          }}
          className="overflow-hidden rounded-3xl border border-primary-200 bg-primary-100 px-4 py-3 dark:border-primary-800 dark:bg-primary-900">
          <ReviewForm
            mode="create"
            onSubmit={handleSubmitReview}
            disabled={!!disabledReason}
            disabledReason={disabledReason}
          />
        </View>
      )}
    </View>
  );
}
