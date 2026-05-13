import { ErrorContext, getErrorMessage } from '~/utils/errorHandler';

// Enum types
export type MediaType = 'movie' | 'tv';
export type ListType = 'library' | 'favorites' | 'custom';
export type Status = 'watched' | 'watching' | 'pending';
export type ReportReason = 'spam' | 'harassment' | 'spoilers' | 'inappropriate' | 'other';

// Return types
export type DataResult<T> = { success: true; data: T } | { success: false; error: string };
export type VoidResult = { success: true } | { success: false; error: string };
export function successData<T>(data: T): DataResult<T> {
  return { success: true, data };
}
export function successVoid(): VoidResult {
  return { success: true };
}
export function errorData<T>(error: unknown, context?: ErrorContext): DataResult<T> {
  return { success: false, error: getErrorMessage(error, context) };
}
export function errorVoid(error: unknown, context?: ErrorContext): VoidResult {
  return { success: false, error: getErrorMessage(error, context) };
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  is_private: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
}

export interface List {
  id: number;
  user_id: string;
  name: string;
  description: string | null;
  list_type: ListType;
  is_default: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
  like_count: number;
  is_private: boolean;
}

export interface ListWithMeta extends List {
  owner: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    is_private: boolean;
  } | null;

  is_liked: boolean;
}

export interface ListOwner {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_private: boolean;
}

export interface ListItem {
  id: number;
  list_id: number;
  media_id: number;
  created_at: string;
}

export interface ListLike {
  id: number;
  user_id: string;
  list_id: number;
  created_at: string;
}

export type StoreList = List & {
  is_liked: boolean;
};

export interface SearchPublicListResult extends ListWithMeta {
  rank: number;
}

export interface Media {
  id: number;
  tmdb_id: number;
  media_type: MediaType;
  title: string;
  synopsis: string | null;
  poster_path: string | null;
  release_date: string | null;
  runtime_minutes: number | null;
  comment_count: number;
  created_at: string;
  backdrop_path: string | null;
  popularity: number | null;
  vote_average: number | null;
  last_fetched: string | null;
}

export interface MovieDetails {
  runtime_minutes: number | null;
}

export interface TVDetails {
  seasons: TVSeason[];
  episodes: Record<number, TVEpisode[]>;
}

export interface TVSeason {
  id: number;
  media_id: number;
  season_number: number;
  episode_count: number;
}

export interface TVEpisode {
  episode_number: number;
  runtime_minutes: number | null;
  overview: string | null;
  name: string | null;
  still_path: string | null;
  air_date: string | null;
}

export interface Comment {
  id: number;
  user_id: string;
  media_id: number;
  content: string;
  timestamp_seconds: number | null;
  season_number: number | null;
  episode_number: number | null;
  parent_comment_id: number | null;
  is_spoiler: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export type CreateCommentInput = Omit<
  Comment,
  'id' | 'user_id' | 'created_at' | 'updated_at' | 'like_count'
>;

export type CreateReviewInput = Omit<
  Review,
  'id' | 'created_at' | 'updated_at' | 'like_count' | 'is_spoiler' | 'is_deleted' | 'user_id'
>;

export interface CommentWithUser extends Comment {
  is_liked: boolean;
  owner: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    is_private: boolean;
  };
}

export type CommentWithUserAndMedia = CommentWithUser & {
  media: Media;
};

export interface CommentLike {
  id: number;
  user_id: string;
  comment_id: number;
  created_at: string;
}

export interface Review {
  id: number;
  user_id: string;
  media_id: number;
  rating: number | null;
  content: string | null;
  is_spoiler: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithUser extends Review {
  is_liked: boolean;
  owner: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    is_private: boolean;
  };
}

/** Review + author + media; matches `get_community_thoughts_feed` review-shaped tiles and RPC helpers. */
export type ReviewWithUserAndMedia = ReviewWithUser & {
  media: Media;
};

/** `get_community_thoughts_feed` — rolling 7-day comment/review totals. */
export interface CommunityThoughtsActivityStrip {
  comments_7d: number;
  reviews_7d: number;
}

/** `get_community_thoughts_feed` — average of review ratings (0–10) in the last 7 days. */
export interface CommunityThoughtsCommunityMood {
  avg_rating: number | null;
  review_count: number;
}

/** `get_community_thoughts_feed` — high community avg on lower-popularity titles not in trending_collection. */
export interface CommunityThoughtsHiddenGem {
  media: Media;
  community_avg_rating: number;
  review_count: number;
}

/** Payload from `get_community_thoughts_feed()` (single JSON object). */
export interface CommunityThoughtsFeed {
  featured_review: ReviewWithUserAndMedia | null;
  hot_take_review: ReviewWithUserAndMedia | null;
  community_mood: CommunityThoughtsCommunityMood;
  hidden_gem: CommunityThoughtsHiddenGem | null;
  top_comment: CommentWithUserAndMedia | null;
  top_review: ReviewWithUserAndMedia | null;
  activity_strip: CommunityThoughtsActivityStrip;
}

export interface ReviewLike {
  id: number;
  user_id: string;
  review_id: number;
  created_at: string;
}

export interface Follow {
  id: number;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Block {
  id: number;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface UserMedia {
  id: number;
  user_id: string;
  media_id: number;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface MostDiscussedMoment {
  media_id: number;
  title: string;
  media_type: MediaType;
  poster_path: string | null;
  timestamp_seconds: number | null;
  season_number: number | null;
  episode_number: number | null;
  comment_count: number;
}

export interface RecentActivity {
  comment_id: number;
  created_at: string;
  content: string;
  timestamp_seconds: number | null;
  season_number: number | null;
  episode_number: number | null;
  is_spoiler: boolean;

  media_id: number;
  title: string;
  media_type: MediaType;
  poster_path: string | null;

  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface ListItemWithMedia {
  id: number;
  list_id: number;
  media_id: number;
  status: Status;
  created_at: string;
  media: Media;
}

export interface ProfileStats {
  followers: number;
  following: number;
  comments: number;
  lists: number;
  totalLogged: number;
  reviews: number;
}

export interface CreateBugReportInput {
  description: string;
  steps_to_reproduce?: string;
}

export type FeedbackCategory = 'general' | 'feature_request' | 'bug' | 'other';

export interface CreateFeedbackInput {
  message: string;
  category?: FeedbackCategory;
}

export type StoreResult<T = void> = { success: true; data?: T } | { success: false; error: string };

export const DEFAULT_PROFILE_STATS: ProfileStats = {
  followers: 0,
  following: 0,
  comments: 0,
  totalLogged: 0,
  lists: 0,
  reviews: 0,
};
