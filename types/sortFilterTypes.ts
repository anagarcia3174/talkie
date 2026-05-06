export type MediaSortType = 'relevance' | 'title' | 'rating' | 'release_date';

export type ListSortType = 'relevance' | 'name' | 'likes';

export type SortOrder = 'ascending' | 'descending';

export interface MediaFilters {
  mediaType: 'movie' | 'tv' | null;
  releaseYearMin: number | null;
  releaseYearMax: number | null;
  ratingMin: number | null;
  ratingMax: number | null;
}

export const DEFAULT_MEDIA_FILTERS: MediaFilters = {
  mediaType: null,
  releaseYearMin: null,
  releaseYearMax: null,
  ratingMin: null,
  ratingMax: null,
};

export interface ListFilters {
  listType: 'library' | 'favorites' | 'custom' | null;
  likesMin: number | null;
  likesMax: number | null;
  itemsMin: number | null;
  itemsMax: number | null;
}

export const DEFAULT_LIST_FILTERS: ListFilters = {
  listType: null,
  likesMin: null,
  likesMax: null,
  itemsMin: null,
  itemsMax: null,
};
