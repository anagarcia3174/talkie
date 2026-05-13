import { supabase } from '~/utils/supabase';
import type {
  Review,
  DataResult,
  VoidResult,
  ReviewWithUser,
  CreateReviewInput,
} from '~/types/supabaseTypes';
import { successData, successVoid, errorData, errorVoid } from '~/types/supabaseTypes';

export async function getReviewsForMedia(mediaId: number): Promise<DataResult<ReviewWithUser[]>> {
  try {
    const { data, error } = await supabase.rpc('get_reviews_for_media', {
      p_media_id: mediaId,
    });

    if (error) {
      return errorData(error, {
        operation: 'get_reviews',
        rpc: 'get_reviews_for_media',
      });
    }
    return successData(data as ReviewWithUser[]);
  } catch (err) {
    return errorData(err, {
      operation: 'get_reviews',
      rpc: 'get_reviews_for_media',
    });
  }
}

export async function postReview(review: CreateReviewInput): Promise<DataResult<ReviewWithUser>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select(
        `
        *,
        profiles (
          id,
          display_name,
          avatar_url,
          is_private
        )
      `
      )
      .single();

    if (error) {
      return errorData(error, {
        operation: 'post_review',
        table: 'reviews',
        isWrite: true,
      });
    }

    const flattened: ReviewWithUser = {
      ...data,
      is_liked: false, // newly created review can't be liked yet
      owner: {
        id: data.profiles.id,
        display_name: data.profiles.display_name,
        avatar_url: data.profiles.avatar_url,
        is_private: data.profiles.is_private,
      },
    };

    delete (flattened as any).profiles;

    return successData(flattened);
  } catch (err) {
    return errorData(err);
  }
}

export async function deleteReview(reviewId: number): Promise<VoidResult> {
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

    if (error)
      return errorVoid(error, {
        operation: 'delete_review',
        table: 'reviews',
        isWrite: true,
      });
    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'delete_review',
      table: 'reviews',
      isWrite: true,
    });
  }
}

export async function toggleReviewLike(reviewId: number): Promise<DataResult<boolean>> {
  try {
    const { data, error } = await supabase.rpc('toggle_review_like', {
      p_review_id: reviewId,
    });

    if (error)
      return errorData(error, {
        operation: 'toggle_review_like',
        table: 'review_likes',
        isWrite: true,
      });
    return successData(data);
  } catch (err) {
    return errorData(err, {
      operation: 'toggle_review_like',
      table: 'review_likes',
      isWrite: true,
    });
  }
}

export async function updateReview(
  reviewId: number,
  updates: Partial<Pick<Review, 'rating' | 'content'>>
): Promise<VoidResult> {
  try {
    if (Object.keys(updates).length === 0) {
      return successVoid();
    }
    const { error } = await supabase
      .from('reviews')
      .update({
        ...updates,
      })
      .eq('id', reviewId);

    if (error) {
      return errorVoid(error, {
        operation: 'update_review',
        table: 'reviews',
        isWrite: true,
      });
    }

    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'update_review',
      table: 'reviews',
      isWrite: true,
    });
  }
}
