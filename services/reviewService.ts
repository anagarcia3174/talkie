import { supabase } from '~/utils/supabase';
import type { Review, Result, ReviewWithProfile } from '~/types/supabaseTypes';
import { successResult, errorResult } from '~/types/supabaseTypes';

export async function getReviewsForMedia(mediaId: number): Promise<Result<ReviewWithProfile[]>> {
  try {
    const { data, error } = await supabase.rpc('get_reviews_for_media', {
      p_media_id: mediaId,
    });

    if (error) return errorResult(error);

    return successResult(data as ReviewWithProfile[]);
  } catch (err) {
    return errorResult(err);
  }
}

export async function postReview(
  review: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'like_count' | 'is_spoiler'>
): Promise<Result<ReviewWithProfile>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select(
        `
        *,
        profiles (
          display_name,
          avatar_url
        )
      `
      )
      .single();

    if (error) return errorResult(error);

    const flattened: ReviewWithProfile = {
      ...data,
      display_name: data.profiles.display_name,
      avatar_url: data.profiles.avatar_url,
    };

    delete (flattened as any).profiles;

    return successResult(flattened);
  } catch (err) {
    return errorResult(err);
  }
}

export async function deleteReview(reviewId: number): Promise<Result<null>> {
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

    if (error) return errorResult(error);
    return successResult(null);
  } catch (err) {
    return errorResult(err);
  }
}
