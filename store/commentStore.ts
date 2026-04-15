import { create } from 'zustand';
import {
  getCommentsForMedia,
  postComment as postCommentService,
  deleteComment as deleteCommentService,
  toggleCommentLike,
  updateComment as updateCommentService,
  getRecentCommentsFeed,
} from '~/services/commentService';
import { reportComment } from '~/services/reportService';
import { CommentWithUser, Comment, CreateCommentInput, ReportReason, CommentWithUserAndMedia } from '~/types/supabaseTypes';

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

interface RecentCommentsFeedState { 
  recentComments: CommentWithUserAndMedia[];
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
}

interface CommentState {
  fetchedComments: Record<string, MediaCommentsState>;
  recentCommentsFeed: RecentCommentsFeedState;
  fetchCommentsForMedia: (params: {
    mediaId: number;
    seasonNumber?: number;
    episodeNumber?: number;
    force?: boolean;
  }) => Promise<StoreResult<void>>;
  getRecentCommentsFeed: () => Promise<StoreResult<void>>;
  postComment: (comment: CreateCommentInput) => Promise<StoreResult<void>>;
  deleteComment: (commentId: number, contextKey: ContextKey) => Promise<StoreResult<void>>;
  toggleLikeComment: (commentId: number, contextKey: ContextKey) => Promise<StoreResult<void>>;
  updateComment: (params: {
    commentId: number;
    contextKey: ContextKey;
    updates: Partial<Pick<Comment, 'timestamp_seconds' | 'content'>>;
  }) => Promise<StoreResult<void>>;
  reportComment: (
    commentId: number,
    reportReason: ReportReason,
    details?: string
  ) => Promise<StoreResult<void>>;
}

export const useComments = create<CommentState>((set, get) => ({
  fetchedComments: {},
  recentCommentsFeed: {
    recentComments: [],
    isLoading: false,
    hasFetched: false,
    error: null,
  },
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
  getRecentCommentsFeed: async () => {
    const cachedRecentCommentsFeed = get().recentCommentsFeed;

    if (cachedRecentCommentsFeed.isLoading) {
      return { success: true };
    }

    if (cachedRecentCommentsFeed.hasFetched) {
      return { success: true };
    }

    set((state) => ({
      recentCommentsFeed: {
        ...state.recentCommentsFeed,
        isLoading: true,
        hasFetched: false,
        error: null,
      },
    }));

    const result = await getRecentCommentsFeed();
    if (!result.success) {
      set((state) => ({
        recentCommentsFeed: {
          ...state.recentCommentsFeed,
          isLoading: false,
          hasFetched: false,
          error: result.error,
        },
      }));
      return result;
    }

    const recentComments = result.data ?? [];

    set((state) => ({
      recentCommentsFeed: {
        recentComments: recentComments,
        isLoading: false,
        hasFetched: true,
        error: null,
      },
    }));
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
  toggleLikeComment: async (commentId, contextKey) => {
    const state = get();

    const baseKey = `media-${contextKey.mediaId}`;
    const episodeKey =
      contextKey.seasonNumber != null && contextKey.episodeNumber != null
        ? `media-${contextKey.mediaId}-s${contextKey.seasonNumber}-e${contextKey.episodeNumber}`
        : baseKey;

    const baseComments = state.fetchedComments[baseKey]?.comments ?? [];

    const comment = baseComments.find((c) => c.id === commentId);
    if (!comment) {
      return { success: false, error: 'Comment not found' };
    }

    const prevLiked = comment.is_liked;
    const prevCount = comment.like_count;

    const updateComments = (comments: CommentWithUser[]) =>
      comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              is_liked: !prevLiked,
              like_count: prevLiked ? prevCount - 1 : prevCount + 1,
            }
          : c
      );

    set((state) => {
      const updated = { ...state.fetchedComments };

      if (updated[baseKey]) {
        updated[baseKey] = {
          ...updated[baseKey],
          comments: updateComments(updated[baseKey].comments),
        };
      }

      if (episodeKey !== baseKey && updated[episodeKey]) {
        updated[episodeKey] = {
          ...updated[episodeKey],
          comments: updateComments(updated[episodeKey].comments),
        };
      }

      return { fetchedComments: updated };
    });

    const result = await toggleCommentLike(commentId);

    if (!result.success) {
      set((state) => {
        const updated = { ...state.fetchedComments };

        const rollback = (comments: CommentWithUser[]) =>
          comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  is_liked: prevLiked,
                  like_count: prevCount,
                }
              : c
          );

        if (updated[baseKey]) {
          updated[baseKey] = {
            ...updated[baseKey],
            comments: rollback(updated[baseKey].comments),
          };
        }

        if (episodeKey !== baseKey && updated[episodeKey]) {
          updated[episodeKey] = {
            ...updated[episodeKey],
            comments: rollback(updated[episodeKey].comments),
          };
        }

        return { fetchedComments: updated };
      });

      return result;
    }

    return { success: true };
  },
  updateComment: async ({ commentId, contextKey, updates }) => {
    const state = get();
    const baseKey = `media-${contextKey.mediaId}`;
    const episodeKey =
      contextKey.seasonNumber != null && contextKey.episodeNumber != null
        ? `media-${contextKey.mediaId}-s${contextKey.seasonNumber}-e${contextKey.episodeNumber}`
        : baseKey;

    const baseComments = state.fetchedComments[baseKey]?.comments ?? [];

    const existingComment = baseComments.find((c) => c.id === commentId);
    if (!existingComment) {
      return { success: false, error: 'Comment not found' };
    }

    // Save previous state for rollback
    const prevContent = existingComment.content;
    const prevTimestamp = existingComment.timestamp_seconds;

    const applyUpdate = (comments: CommentWithUser[]) =>
      comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              ...updates,
            }
          : c
      );

    // -------------------------
    // Optimistic update
    // -------------------------
    set((state) => {
      const updated = { ...state.fetchedComments };

      if (updated[baseKey]) {
        updated[baseKey] = {
          ...updated[baseKey],
          comments: applyUpdate(updated[baseKey].comments),
        };
      }

      if (episodeKey !== baseKey && updated[episodeKey]) {
        updated[episodeKey] = {
          ...updated[episodeKey],
          comments: applyUpdate(updated[episodeKey].comments),
        };
      }

      return { fetchedComments: updated };
    });

    // -------------------------
    // API call (you need this service)
    // -------------------------
    const result = await updateCommentService(commentId, updates);

    if (!result.success) {
      // -------------------------
      // Rollback
      // -------------------------
      set((state) => {
        const updated = { ...state.fetchedComments };

        const rollback = (comments: CommentWithUser[]) =>
          comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  content: prevContent,
                  timestamp_seconds: prevTimestamp,
                }
              : c
          );

        if (updated[baseKey]) {
          updated[baseKey] = {
            ...updated[baseKey],
            comments: rollback(updated[baseKey].comments),
          };
        }

        if (episodeKey !== baseKey && updated[episodeKey]) {
          updated[episodeKey] = {
            ...updated[episodeKey],
            comments: rollback(updated[episodeKey].comments),
          };
        }

        return { fetchedComments: updated };
      });

      return result;
    }

    return { success: true };
  },
  reportComment: async (commentId, reason, details) => {
    return await reportComment(commentId, reason, details);
  },
}));
