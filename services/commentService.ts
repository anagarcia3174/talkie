import {
  Comment,
  CommentWithUser,
  CommentWithUserAndMedia,
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
    const { data, error } = await supabase.rpc('post_comment_for_media', {
      p_media_id: comment.media_id,
      p_content: comment.content,
      p_timestamp_seconds: comment.timestamp_seconds,
      p_season_number: comment.season_number,
      p_episode_number: comment.episode_number,
      p_parent_comment_id: comment.parent_comment_id,
      p_is_spoiler: comment.is_spoiler,
    });

    if (error) {
      return errorData(error, {
        operation: 'post_comment',
        table: 'comments',
        isWrite: true,
      });
    }

    // rpc returns an array (even for 1 row)
    return successData(data[0] as CommentWithUser);
  } catch (err) {
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

export async function toggleCommentLike(commentId: number): Promise<DataResult<boolean>> {
  try {
    const { data, error } = await supabase.rpc('toggle_comment_like', {
      p_comment_id: commentId,
    });

    if (error) {
      return errorData(error, {
        operation: 'toggle_comment_like',
        table: 'comment_likes',
        isWrite: true,
      });
    }
    return successData(data);
  } catch (err) {
    console.log(err);

    return errorData(err, {
      operation: 'toggle_comment_like',
      table: 'comment_likes',
      isWrite: true,
    });
  }
}

export async function updateComment(
  commentId: number,
  updates: Partial<Pick<Comment, 'content' | 'timestamp_seconds'>>
): Promise<VoidResult> {
  try {
    if (Object.keys(updates).length === 0) {
      return successVoid();
    }
    const { error } = await supabase
      .from('comments')
      .update({
        ...updates,
      })
      .eq('id', commentId);

    if (error) {
      return errorVoid(error, {
        operation: 'update_comment',
        table: 'comments',
        isWrite: true,
      });
    }

    return successVoid();
  } catch (err) {
    return errorData(err, {
      operation: 'update_comment',
      table: 'comments',
      isWrite: true,
    });
  }
}

export async function getRecentCommentsFeed(
  limit: number = 10
): Promise<DataResult<CommentWithUserAndMedia[]>> {
  try {
    const { data, error } = await supabase.rpc('get_recent_comments_feed', {
      p_limit: limit,
    });

    if (error) {
      return errorData(error, {
        operation: 'get_recent_comments_feed',
        table: 'comments',
        isWrite: false,
      });
    }
    return successData(data as CommentWithUserAndMedia[]);
  } catch (err) {
    return errorData(err, {
      operation: 'get_recent_comments_feed',
      table: 'comments',
      isWrite: false,
    });
  }
}
