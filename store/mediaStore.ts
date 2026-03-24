import { create } from 'zustand';
import { Media, MovieDetails, TVDetails } from '~/types/supabaseTypes';
import { getMediaDetails, getTrendingMovies, getTrendingShows } from '~/services/mediaService';

type StoreResult<T = void> = { success: true } | { success: false; error: string };

interface MediaCommentsState {
  details: TVDetails | MovieDetails | null;
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
}

interface MediaState {
  loading: boolean;
  trendingMovies: Media[];
  trendingShows: Media[];
  mediaDetails: Record<number, MediaCommentsState>;
  fetchHomeData: () => Promise<StoreResult<void>>;
  fetchMediaDetails: (
    media_id: number,
    force?: boolean
  ) => Promise<StoreResult<void>>;
}

export const useMedia = create<MediaState>((set, get) => ({
  loading: false,
  trendingMovies: [],
  trendingShows: [],
  mediaDetails: {},
  fetchHomeData: async () => {
    set({ loading: true });

    const [trendingMoviesResult, trendingShowsResult] = await Promise.all([
      getTrendingMovies(),
      getTrendingShows(),
    ]);

    // Check if any requests failed
    if (!trendingMoviesResult.success) {
      set({ loading: false });
      return { success: false, error: trendingMoviesResult.error };
    }
    if (!trendingShowsResult.success) {
      set({ loading: false });
      return { success: false, error: trendingShowsResult.error };
    }

    // All requests succeeded
    set({
      trendingMovies: trendingMoviesResult.data,
      trendingShows: trendingShowsResult.data,
      loading: false,
    });
    return { success: true };
  },
  fetchMediaDetails: async (media_id, force = false) => {
    const { mediaDetails } = get();
    const existing = mediaDetails[media_id];

    // Return cached data if available and not forcing refresh
    if (!force && existing?.hasFetched) {
      return { success: true };
    }

    set((state) => ({
      mediaDetails: {
        ...state.mediaDetails,
        [media_id]: {
          details: state.mediaDetails[media_id]?.details ?? null,
          isLoading: true,
          hasFetched: false,
          error: null,
        },
      },
    }));


     const result = await getMediaDetails(media_id);

    if (!result.success) {
      set((state) => ({
        mediaDetails: {
          ...state.mediaDetails,
          [media_id]: {
            details: null,
            isLoading: false,
            hasFetched: false,
            error: result.error,
          },
        },
      }));

      return { success: false, error: result.error };
    }

    set((state) => ({
      mediaDetails: {
        ...state.mediaDetails,
        [media_id]: {
          details: result.data,
          isLoading: false,
          hasFetched: true,
          error: null,
        },
      },
    }));

    return { success: true };
  },
}));
