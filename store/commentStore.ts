import { create } from 'zustand';
import {
  getCommentsForMedia,
  postComment as postCommentService,
  deleteComment as deleteCommentService,
} from '~/services/commentService';
import { CommentWithUser, Comment, CreateCommentInput } from '~/types/supabaseTypes';

type StoreResult<T = void> = { success: true } | { success: false; error: string };

type ContextKey = {
  mediaId: number;
  seasonNumber?: number;
  episodeNumber?: number;
};

interface MediaCommentsState {
  comments: CommentWithUser[];
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
}

interface CommentState {
  fetchedComments: Record<string, MediaCommentsState>;

  fetchCommentsForMedia: (params: {
    mediaId: number;
    seasonNumber?: number;
    episodeNumber?: number;
    force?: boolean;
  }) => Promise<StoreResult<void>>;
  postComment: (comment: CreateCommentInput) => Promise<StoreResult<void>>;
  deleteComment: (commentId: number, contextKey: ContextKey) => Promise<StoreResult<void>>;
}

export const useComments = create<CommentState>((set, get) => ({
  fetchedComments: {},
  fetchCommentsForMedia: async ({ mediaId, seasonNumber, episodeNumber, force = false }) => {
    const baseKey = `media-${mediaId}`;
    const contextKey =
      seasonNumber != null && episodeNumber != null
        ? `media-${mediaId}-s${seasonNumber}-e${episodeNumber}`
        : baseKey;

    const baseExisting = get().fetchedComments[baseKey];

    // Prevent duplicate fetch
    if (baseExisting?.isLoading) {
      return { success: true };
    }

    //  If base already fetched and not forcing → derive locally
    if (baseExisting?.hasFetched && !force) {

      let comments = baseExisting.comments;

      if (seasonNumber != null && episodeNumber != null) {
        comments = comments.filter(
          (c) => c.season_number === seasonNumber && c.episode_number === episodeNumber
        );

        set((state) => ({
          fetchedComments: {
            ...state.fetchedComments,
            [contextKey]: {
              comments,
              isLoading: false,
              hasFetched: true,
              error: null,
            },
          },
        }));
      }

      return { success: true };
    }

    set((state) => ({
      fetchedComments: {
        ...state.fetchedComments,
        [baseKey]: {
          comments: baseExisting?.comments ?? [],
          isLoading: true,
          hasFetched: baseExisting?.hasFetched ?? false,
          error: null,
        },
      },
    }));
    const result = await getCommentsForMedia(mediaId);
    if (!result.success) {
      set((state) => ({
        fetchedComments: {
          ...state.fetchedComments,
          [baseKey]: {
            comments: [],
            isLoading: false,
            hasFetched: false,
            error: result.error ?? 'Failed to fetch comments',
          },
        },
      }));

      return result;
    }

    const allComments = result.data ?? [];

    // Always cache full dataset under base key
    set((state) => ({
      fetchedComments: {
        ...state.fetchedComments,
        [baseKey]: {
          comments: allComments,
          isLoading: false,
          hasFetched: true,
          error: null,
        },
      },
    }));

    // If episode view, also derive and cache slice
    if (seasonNumber != null && episodeNumber != null) {

      const filtered = allComments.filter(
        (c) => c.season_number === seasonNumber && c.episode_number === episodeNumber
      );

      set((state) => ({
        fetchedComments: {
          ...state.fetchedComments,
          [contextKey]: {
            comments: filtered,
            isLoading: false,
            hasFetched: true,
            error: null,
          },
        },
      }));

      return { success: true };
    }

    return { success: true };
  },

  // -------------------------
  // POST
  // -------------------------
  postComment: async (comment) => {
    const result = await postCommentService(comment);

    if (!result.success) {
      return result;
    }

    const newComment = result.data;

    // Extract base key from contextKey
    const baseKey = `media-${comment.media_id}`;
    const episodeKey =
      comment.season_number != null && comment.episode_number != null
        ? `media-${comment.media_id}-s${comment.season_number}-e${comment.episode_number}`
        : baseKey;

    set((state) => {
      const baseExisting = state.fetchedComments[baseKey];
      const contextExisting = state.fetchedComments[episodeKey];

      if (!baseExisting) return state; // nothing cached yet, skip optimistic update

      return {
        fetchedComments: {
          ...state.fetchedComments,
          [baseKey]: {
            ...baseExisting,
            comments: [newComment, ...baseExisting.comments],
          },
          ...(episodeKey !== baseKey && contextExisting
            ? {
                [episodeKey]: {
                  ...contextExisting,
                  comments: [newComment, ...contextExisting.comments],
                },
              }
            : {}),
        },
      };
    });

    return { success: true };
  },

  // -------------------------
  // DELETE
  // -------------------------
  deleteComment: async (commentId, contextKey) => {
    const result = await deleteCommentService(commentId);

    if (!result.success) {
      return result;
    }

    const baseKey = `media-${contextKey.mediaId}`;
    const episodeKey =
      contextKey.seasonNumber != null && contextKey.episodeNumber != null
        ? `media-${contextKey.mediaId}-s${contextKey.seasonNumber}-e${contextKey.episodeNumber}`
        : baseKey;

    set((state) => {
      const updated = { ...state.fetchedComments };

      // Remove from base
      if (updated[baseKey]) {
        updated[baseKey] = {
          ...updated[baseKey],
          comments: updated[baseKey].comments.filter((c) => c.id !== commentId),
        };
      }

      //  Remove from episode slice (if different)
      if (episodeKey !== baseKey && updated[episodeKey]) {
        updated[episodeKey] = {
          ...updated[episodeKey],
          comments: updated[episodeKey].comments.filter((c) => c.id !== commentId),
        };
      }

      return { fetchedComments: updated };
    });

    return result;
  },
}));
