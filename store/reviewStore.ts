import { create } from 'zustand';
import type { Review, ReviewWithUser } from '~/types/supabaseTypes';
import { getReviewsForMedia, postReview, deleteReview } from '~/services/reviewService';

type StoreResult<T = void> = { success: true } | { success: false; error: string };

interface MediaReviewsState {
  reviews: ReviewWithUser[];
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
}

interface ReviewsState {
  fetchedReviews: Record<number, MediaReviewsState>;

  fetchReviewsForMedia: (mediaId: number, force?: boolean) => Promise<StoreResult<void>>;
  submitReview: (
    review: Omit<
      Review,
      'id' | 'created_at' | 'updated_at' | 'like_count' | 'is_spoiler' | 'is_deleted'
    >
  ) => Promise<StoreResult<void>>;
  removeReview: (reviewId: number, mediaId: number) => Promise<StoreResult<void>>;
}

export const useReviews = create<ReviewsState>((set, get) => ({
  fetchedReviews: {},
  fetchReviewsForMedia: async (mediaId, force = false) => {
    const cachedReviews = get().fetchedReviews[mediaId];

    if (cachedReviews?.isLoading) {
      return { success: true };
    }

    if (cachedReviews?.hasFetched && !force) {
      return { success: true };
    }

    set((state) => ({
      fetchedReviews: {
        ...state.fetchedReviews,
        [mediaId]: {
          reviews: cachedReviews?.reviews ?? [],
          isLoading: true,
          hasFetched: cachedReviews?.hasFetched ?? false,
          error: null,
        },
      },
    }));

    const result = await getReviewsForMedia(mediaId);

    if (!result.success) {
      set((state) => ({
        fetchedReviews: {
          ...state.fetchedReviews,
          [mediaId]: {
            reviews: [],
            isLoading: false,
            hasFetched: false,
            error: result.error,
          },
        },
      }));
      return result;
    }

    const reviews = result.data ?? [];
    set((state) => ({
      fetchedReviews: {
        ...state.fetchedReviews,
        [mediaId]: {
          reviews: reviews,
          isLoading: false,
          hasFetched: true,
          error: null,
        },
      },
    }));
    return { success: true };
  },
  submitReview: async (review) => {
    const result = await postReview(review);

    if (!result.success) {
      return result;
    }

    const newReview = result.data;
    if (newReview) {
      set((state) => {
        const mediaId = review.media_id;
        const existingReviews = state.fetchedReviews[mediaId];
        if (!existingReviews) return state;
        return {
          fetchedReviews: {
            ...state.fetchedReviews,
            [mediaId]: {
              ...existingReviews,
              reviews: [newReview, ...existingReviews.reviews],
            },
          },
        };
      });
    }
    return { success: true };
  },
  removeReview: async (reviewId, mediaId) => {
    const result = await deleteReview(reviewId);

    if (!result.success) {
      return result;
    }

    set((state) => {
      const updated = { ...state.fetchedReviews };
      if (updated[mediaId]) {
        updated[mediaId] = {
          ...updated[mediaId],
          reviews: updated[mediaId].reviews.filter((r) => r.id !== reviewId),
        };
      }
      return { fetchedReviews: updated };
    });

    return { success: true };
  },
}));
