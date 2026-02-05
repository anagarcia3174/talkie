import { getErrorMessage } from '~/utils/errorHandler';

// Enum types
export type MediaType = 'movie' | 'tv';
export type ListType = 'library' | 'favorites' | 'custom';
export type Visibility = 'private' | 'followers' | 'public';
export type LibraryStatus = 'watched' | 'watching' | 'pending';

export type Result<T = void> = { success: true; data?: T } | { success: false; error: string };

export function successResult<T>(data: T): Result<T> {
  return {
    success: true,
    data,
  };
}

export function errorResult<T = void>(error: unknown): Result<T> {
  return {
    success: false,
    error: getErrorMessage(error),
  };
}

// Base database record interface
interface BaseRecord {
  id: number;
  created_at: string;
}

export interface Profile extends BaseRecord {
  display_name: string;
  avatar_url: string;
  bio: string;
  updated_at: string;
}

export interface ProfileStats {
  followers: number;
  following: number;
  reviews: number;
  totalLogged: number;
  avgRating: number;
}

// Core table types
export interface Block extends BaseRecord {
  blocker_id: string;
  blocked_id: string;
}

export interface CommentLike extends BaseRecord {
  user_id: string;
  comment_id: number;
}

export interface Comment extends BaseRecord {
  user_id: string;
  media_id: number;
  content: string;
  timestamp_seconds?: number;
  season_number?: number;
  episode_number?: number;
  parent_comment_id?: number;
  is_spoiler: boolean;
  like_count: number;
  reply_count: number;
  is_deleted: boolean;
  updated_at: string;
}

export interface Follow extends BaseRecord {
  follower_id: string;
  following_id: string;
}

export interface ListItem extends BaseRecord {
  list_id: number;
  media_id: number;
  user_id: string;
  status: LibraryStatus | null;
}

export interface ListItemWithMedia extends ListItem {
  media?: {
    tmdb_id: number;
    media_type: MediaType;
    title: string;
    synopsis: string;
    poster_path: string;
    release_date: string;
    runtime_minutes: number;
    comment_count: number;
    backdrop_path: string;
    popularity: number;
    vote_average: number;
  };
}

export interface ListLike extends BaseRecord {
  user_id: string;
  list_id: number;
}



// ✅ Generic ListWithItems type (works for both basic + media-enriched items)
export interface ListWithItems<T extends ListItem = ListItem> extends List {
  items: T[];
}

export interface Media extends BaseRecord {
  tmdb_id: number;
  media_type: MediaType;
  title: string;
  synopsis: string;
  poster_path: string;
  release_date: string; // ISO date string
  runtime_minutes: number;
  comment_count: number;
  backdrop_path: string;
  popularity: number;
  vote_average: number;
}

export interface ReviewLike extends BaseRecord {
  user_id: string;
  review_id: number;
}

export interface Review  {
  user_id: string;
  media_id: number;
  rating: number; // 0-10
  content?: string;
  is_spoiler: boolean;
  like_count: number;
  updated_at: string;
  id: number;
  created_at: string;
}

export interface ReviewWithProfile extends Review {
  display_name: string;
  avatar_url: string;
}

// Input types for creating/updating records (omit auto-generated fields)
export type CreateBlockInput = Omit<Block, 'id' | 'created_at'>;
export type CreateCommentInput = Omit<
  Comment,
  'id' | 'created_at' | 'updated_at' | 'like_count' | 'reply_count'
>;
export type CreateFollowInput = Omit<Follow, 'id' | 'created_at'>;
export type CreateListItemInput = Omit<ListItem, 'id' | 'created_at'>;
export type CreateListInput = Omit<List, 'id' | 'created_at' | 'updated_at' | 'item_count'>;
export type CreateMediaInput = Omit<Media, 'id' | 'created_at' | 'comment_count'>;
export type CreateReviewInput = Omit<Review, 'id' | 'created_at' | 'updated_at' | 'like_count'>;

// Update types (all fields optional except id)
export type UpdateCommentInput = Partial<Pick<Comment, 'content' | 'is_spoiler'>> & { id: number };
export type UpdateListInput = Partial<Pick<List, 'name' | 'description' | 'visibility'>> & {
  id: number;
};
export type UpdateReviewInput = Partial<Pick<Review, 'rating' | 'content' | 'is_spoiler'>> & {
  id: number;
};

// Utility types for API responses
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
export interface List extends BaseRecord {
  user_id: string;
  name: string;
  description: string | null;
  list_type: ListType;
  is_default: boolean;
  visibility: Visibility;
  item_count: number;
  likes_count: number;
  updated_at: string;
}

export type ListSearchResult = {
  list: List;
  display_name: string;
  avatar_url: string | null;
  rank: number;
};

export type ListOwnerInfo = {
  id: string;
  display_name: string;
  avatar_url?: string;
}
