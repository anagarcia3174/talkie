import {
  Comment,
  CommentWithUser,
  CreateCommentInput,
  DataResult,
  errorData,
  errorVoid,
  successData,
  successVoid,
  VoidResult,
} from '~/types/supabaseTypes';
import { supabase } from '~/utils/supabase';

export async function getCommentsForMedia(mediaId: number): Promise<DataResult<CommentWithUser[]>> {
  try {
    const { data, error } = await supabase.rpc('get_comments_for_media', {
      p_media_id: mediaId,
    });

    if (error)
      return errorData(error, {
        operation: 'get_comments',
        rpc: 'get_comments_for_media',
      });

    return successData(data as CommentWithUser[]);
  } catch (err) {
    return errorData(err, {
      operation: 'get_comments',
      rpc: 'get_comments_for_media',
    });
  }
}

export async function postComment(
  comment: CreateCommentInput
): Promise<DataResult<CommentWithUser>> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select(
        `
  *,
  owner:profiles (
    id,
    display_name,
    avatar_url,
    is_private
  )
`
      )
      .single();

    if (error) {
      console.log(error);
      return errorData(error, {
        operation: 'post_comment',
        table: 'comments',
        isWrite: true,
      });
    }

    return successData(data as CommentWithUser);
  } catch (err) {
    console.log(err);
    return errorData(err, {
      operation: 'post_comment',
      table: 'comments',
      isWrite: true,
    });
  }
}

export async function deleteComment(commentId: number): Promise<VoidResult> {
  try {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    if (error)
      return errorVoid(error, {
        operation: 'delete_comment',
        table: 'comments',
        isWrite: true,
      });
    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'delete_comment',
      table: 'comments',
      isWrite: true,
    });
  }
}
