import { supabase } from '~/utils/supabase';
import type { Review, DataResult, VoidResult, ReviewWithProfile } from '~/types/supabaseTypes';
import { successData, successVoid, errorData, errorVoid } from '~/types/supabaseTypes';

export async function getReviewsForMedia(mediaId: number): Promise<DataResult<ReviewWithProfile[]>> {
  try {
    const { data, error } = await supabase.rpc('get_reviews_for_media', {
      p_media_id: mediaId,
    });

    if (error) return errorData(error);

    return successData(data as ReviewWithProfile[]);
  } catch (err) {
    return errorData(err);
  }
}

export async function postReview(
  review: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'like_count' | 'is_spoiler'>
): Promise<DataResult<ReviewWithProfile>> {
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

    if (error) return errorData(error);

    const flattened: ReviewWithProfile = {
      ...data,
      display_name: data.profiles.display_name,
      avatar_url: data.profiles.avatar_url,
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

    if (error) return errorVoid(error);
    return successVoid();
  } catch (err) {
    return errorVoid(err);
  }
}
