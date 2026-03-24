import { create } from 'zustand';
import type { ReportReason, Review, ReviewWithUser } from '~/types/supabaseTypes';
import {
  getReviewsForMedia,
  postReview,
  deleteReview,
  toggleReviewLike,
  updateReview as updateReviewService,
} from '~/services/reviewService';
import { reportReview } from '~/services/reportService';

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
  toggleLikeReview: (reviewId: number, mediaId: number) => Promise<StoreResult<void>>;
  updateReview: (params: {
    reviewId: number;
    mediaId: number;
    updates: Partial<Pick<Review, 'rating' | 'content'>>;
  }) => Promise<StoreResult<void>>;
  reportReview: (
    reviewId: number,
    reason: ReportReason,
    details?: string
  ) => Promise<StoreResult<void>>;
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
  toggleLikeReview: async (reviewId, mediaId) => {
    const state = get();
    const media = state.fetchedReviews[mediaId];

    if (!media) {
      return { success: false, error: 'Media not found in store' };
    }

    const review = media.reviews.find((r) => r.id === reviewId);
    if (!review) {
      return { success: false, error: 'Review not found' };
    }

    const prevLiked = review.is_liked;
    const prevCount = review.like_count;

    set((state) => ({
      fetchedReviews: {
        ...state.fetchedReviews,
        [mediaId]: {
          ...state.fetchedReviews[mediaId],
          reviews: state.fetchedReviews[mediaId].reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  is_liked: !prevLiked,
                  like_count: prevLiked ? prevCount - 1 : prevCount + 1,
                }
              : r
          ),
        },
      },
    }));

    const result = await toggleReviewLike(reviewId);

    if (!result.success) {
      set((state) => ({
        fetchedReviews: {
          ...state.fetchedReviews,
          [mediaId]: {
            ...state.fetchedReviews[mediaId],
            reviews: state.fetchedReviews[mediaId].reviews.map((r) =>
              r.id === reviewId
                ? {
                    ...r,
                    is_liked: prevLiked,
                    like_count: prevCount,
                  }
                : r
            ),
          },
        },
      }));

      return result;
    }
    set((state) => ({
      fetchedReviews: {
        ...state.fetchedReviews,
        [mediaId]: {
          ...state.fetchedReviews[mediaId],
          reviews: state.fetchedReviews[mediaId].reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  is_liked: result.data,
                }
              : r
          ),
        },
      },
    }));

    return { success: true };
  },
  updateReview: async ({ reviewId, mediaId, updates }) => {
    const state = get();
    const media = state.fetchedReviews[mediaId];

    if (!media) {
      return { success: false, error: 'Media not found in store' };
    }

    const review = media.reviews.find((r) => r.id === reviewId);
    if (!review) {
      return { success: false, error: 'Review not found' };
    }

    // Store previous values ONLY for fields being updated
    const prevValues = {} as Partial<Pick<Review, 'rating' | 'content'>>;

    for (const key of Object.keys(updates) as (keyof typeof updates)[]) {
      prevValues[key] = review[key] as any;
    }

    // Optimistic update
    set((state) => ({
      fetchedReviews: {
        ...state.fetchedReviews,
        [mediaId]: {
          ...state.fetchedReviews[mediaId],
          reviews: state.fetchedReviews[mediaId].reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  ...updates,
                  updated_at: new Date().toISOString(), // optional but nice
                }
              : r
          ),
        },
      },
    }));

    const result = await updateReviewService(reviewId, updates);

    // Rollback on failure
    if (!result.success) {
      set((state) => ({
        fetchedReviews: {
          ...state.fetchedReviews,
          [mediaId]: {
            ...state.fetchedReviews[mediaId],
            reviews: state.fetchedReviews[mediaId].reviews.map((r) =>
              r.id === reviewId
                ? {
                    ...r,
                    ...prevValues,
                  }
                : r
            ),
          },
        },
      }));

      return result;
    }

    return { success: true };
  },
  reportReview: async (reviewId, reason, details) => {
    return await reportReview(reviewId, reason, details);
  },
}));
