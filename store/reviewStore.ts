import { create } from 'zustand';
import type { Review, ReviewWithUser } from '~/types/supabaseTypes';
import { getReviewsForMedia, postReview, deleteReview } from '~/services/reviewService';

type StoreResult<T = void> = { success: true } | { success: false; error: string };

interface ReviewsState {
  fetchedReviews: Record<number, ReviewWithUser[]>;

  fetchReviewsForMedia: (mediaId: number) => Promise<StoreResult<ReviewWithUser[]>>;
  submitReview: (
    review: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'like_count' | 'is_spoiler'>
  ) => Promise<StoreResult<ReviewWithUser>>;
  removeReview: (reviewId: number) => Promise<StoreResult<void>>;
}

export const useReviews = create<ReviewsState>((set, get) => ({
  fetchedReviews: {},
  fetchReviewsForMedia: async (mediaId) => {
    const cachedReviews = get().fetchedReviews[mediaId];

    if (cachedReviews !== undefined) {
      return { success: true, data: cachedReviews };
    }

    const result = await getReviewsForMedia(mediaId);

    if (!result.success) {
      return { success: false, error: result.error };
    }
    const reviews = result.data || [];
    set((state) => ({
      fetchedReviews: {
        ...state.fetchedReviews,
        [mediaId]: reviews,
      },
    }));

    return { success: true, data: reviews };
  },
  submitReview: async (review) => {
    const result = await postReview(review);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const newReview = result.data;
    if (newReview) {
      set((state) => {
        const mediaId = review.media_id;
        const existingReviews = state.fetchedReviews[mediaId] || [];

        return {
          fetchedReviews: {
            ...state.fetchedReviews,
            [mediaId]: [newReview, ...existingReviews],
          },
        };
      });
    }
    return { success: true, data: newReview };
  },
  removeReview: async (reviewId) => {
    const result = await deleteReview(reviewId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set((state) => {
      const updated = { ...state.fetchedReviews };
      for (const mediaId in updated) {
        updated[mediaId] = updated[mediaId].filter((r) => r.id !== reviewId);
      }
      return { fetchedReviews: updated };
    });

    return { success: true };
  },
}));
