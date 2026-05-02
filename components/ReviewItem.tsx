import { View, Text, Image, Pressable } from 'react-native';
import { ReportReason, Review, ReviewWithUser } from '~/types/supabaseTypes';
import { Heart, MoreHorizontal, Star, UserRound } from 'lucide-react-native';
import { getPublicUrl } from '~/utils/storageUrl';
import { useTheme } from '~/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useReviews } from '~/store/reviewStore';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import ReviewEditModal from './ReviewEditModal';
import ItemOptions from './ItemOptions';
import ReportModal from './ReportModal';
import { haptics } from '~/utils/haptics';
import DeleteItemModal from './DeleteItemModal';

interface ReviewItemProps {
  review: ReviewWithUser;
  isUser?: boolean;
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
}

export default function ReviewItem({ review, isUser }: ReviewItemProps) {
  const uri = getPublicUrl(review.owner.avatar_url);
  const { toggleLikeReview, removeReview, updateReview, reportReview } = useReviews();
  const [loading, setLoading] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [ deleteItemModalVisible, setDeleteItemModalVisible ] = useState(false);
  const hasAvatar = uri && uri.length > 0;
  const theme = useTheme();
  const router = useRouter();

  const handleReviewLike = async () => {
    setLoading(true);
    const result = await toggleLikeReview(review.id, review.media_id);

    if (!result.success) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to like the review.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
    setLoading(false);
  };

  const handleReviewDelete = async () => {
    const result = await removeReview(review.id, review.media_id);
    if (!result.success) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to delete the review.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  const handleReviewUpdate = async (rating: number, content: string) => {
    const updates: Partial<Pick<Review, 'rating' | 'content'>> = {};

    if (rating !== review.rating) updates.rating = rating;
    if (content !== review.content) updates.content = content;

    if (Object.keys(updates).length === 0) return;

    const result = await updateReview({ reviewId: review.id, mediaId: review.media_id, updates });
    setEditModalVisible(false);
    if (!result.success) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to update your review.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  const handleReviewReport = async (reason: ReportReason, details?: string) => {
    const result = await reportReview(review.id, reason, details);
    setReportModalVisible(false);
    if (!result.success) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to report the review.',
        visibilityTime: 4000,
        autoHide: true,
      });
    } else {
      haptics.success();
      Toast.show({
        type: 'success',
        text1: 'Report submitted!',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  return (
    <>
      <View className="mx-2 my-1.5 rounded-2xl bg-primary-100 p-4 dark:bg-primary-900">
        <View className="flex-row">
          {/* Left column: all review content */}
          <View className="flex-1">
            <View className="flex-row items-center gap-3">
              <Pressable
                disabled={isUser}
                onPress={() =>
                  router.push({ pathname: '/profile/[id]', params: { id: review.user_id } })
                }
                hitSlop={8}>
                {hasAvatar ? (
                  <Image source={{ uri }} className="h-9 w-9 rounded-full bg-primary-300" />
                ) : (
                  <View className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-300 bg-primary-200 dark:border-primary-700 dark:bg-primary-600">
                    <UserRound size={20} color={theme.primary[700]} />
                  </View>
                )}
              </Pressable>
              <View>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    disabled={isUser}
                    onPress={() =>
                      router.push({ pathname: '/profile/[id]', params: { id: review.user_id } })
                    }
                    hitSlop={8}>
                    <Text className="text-sm font-semibold text-primary-950 dark:text-primary-50">
                      {review.owner.display_name}
                    </Text>
                  </Pressable>
                  {isUser && (
                    <View className="rounded-full bg-primary-600/20 px-2 py-0.5">
                      <Text className="font-SpaceGrotesk-Bold text-[9px] tracking-wide text-primary-700 dark:text-primary-300">
                        YOU
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="font-SpaceGrotesk-Light text-xs text-primary-500 dark:text-primary-400">
                  {formatRelativeTime(review.created_at)}
                </Text>
              </View>
            </View>
            <Text className="mt-3 font-SpaceGrotesk-Light text-sm leading-5 text-primary-800 dark:text-primary-200">
              <Text className="font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
                {review.rating}/10{' '}
              </Text>
              <Star
                strokeWidth={2}
                size={12}
                color={theme.isDark ? 'gold' : 'goldenrod'}
                fill={theme.isDark ? 'gold' : 'goldenrod'}
              />
              <Text> — </Text>
              {review.content ?? (
                <Text className="text-primary-500 dark:text-primary-400">No written review</Text>
              )}
            </Text>
          </View>

          {/* Right column: three dots top, like bottom */}
          <View className="ml-2 items-end">
            <Pressable
              onPress={() => {
                haptics.action();
                setOptionsVisible(true);
              }}
              hitSlop={8}>
              <MoreHorizontal size={18} color={theme.primary[500]} />
            </Pressable>
            {!isUser && (
              <Pressable
                disabled={loading}
                onPress={() => {
                  haptics.action();
                  handleReviewLike();
                }}
                hitSlop={8}
                style={{ marginTop: 'auto' }}>
                <View className="items-center flex-row gap-x-1">
                   {review.like_count > 0 && (
                    <Text className="font-SpaceGrotesk-Light text-xs text-primary-500 dark:text-primary-400">
                      {review.like_count}
                    </Text>
                  )}
                  <Heart
                    size={16}
                    strokeWidth={2}
                    color={review.is_liked ? '#e11d48' : theme.primary[400]}
                    fill={review.is_liked ? '#e11d48' : 'transparent'}
                  />
                 
                </View>
              </Pressable>
            )}
          </View>
        </View>
      </View>
      <ItemOptions
        visible={optionsVisible}
        item={{ type: 'review', data: review }}
        isOwner={!!isUser}
        onClose={() => setOptionsVisible(false)}
        onDelete={() => {
          setOptionsVisible(false);
          setDeleteItemModalVisible(true);
        }}
        onEdit={() => {
          setOptionsVisible(false);
          setEditModalVisible(true);
        }}
        onReport={() => {
          setOptionsVisible(false);
          setReportModalVisible(true);
        }}
      />
      <ReviewEditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        reviewFormProps={{
          mode: 'edit',
          initialContent: review.content ?? undefined,
          initialRating: review.rating ?? undefined,
          onSubmit: handleReviewUpdate,
          showAvatar: false,
        }}
      />
      <ReportModal
        type="review"
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={handleReviewReport}
      />
      <DeleteItemModal 
      item='review'
      visible={deleteItemModalVisible}
      onClose={(deleteItem: boolean) => {
        setDeleteItemModalVisible(false);
        if(deleteItem) handleReviewDelete();
      }}
      />
    </>
  );
}
