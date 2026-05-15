import { create } from 'zustand';
import { Media, MovieDetails, TVDetails, StoreResult } from '~/types/supabaseTypes';
import { getMediaDetails, getTrendingMovies, getTrendingShows } from '~/services/mediaService';

interface MediaDetailsState {
  details: TVDetails | MovieDetails | null;
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;
}

interface MediaState {
  loading: boolean;
  hasFetchedHomeData: boolean;
  trendingMovies: Media[];
  trendingShows: Media[];
  mediaDetails: Record<number, MediaDetailsState>;
  fetchHomeData: (force?: boolean) => Promise<StoreResult>;
  fetchMediaDetails: (mediaId: number, force?: boolean) => Promise<StoreResult>;
}

export const useMedia = create<MediaState>((set, get) => ({
  loading: false,
  hasFetchedHomeData: false,
  trendingMovies: [],
  trendingShows: [],
  mediaDetails: {},
  fetchHomeData: async (force = false) => {
    const { loading, hasFetchedHomeData } = get();

    if (loading) {
      return { success: true };
    }

    if (!force && hasFetchedHomeData) {
      return { success: true };
    }

    set({ loading: true });

    const [trendingMoviesResult, trendingShowsResult] = await Promise.all([
      getTrendingMovies(),
      getTrendingShows(),
    ]);

    if (!trendingMoviesResult.success) {
      set({ loading: false });
      return { success: false, error: trendingMoviesResult.error };
    }

    if (!trendingShowsResult.success) {
      set({ loading: false });
      return { success: false, error: trendingShowsResult.error };
    }

    set({
      trendingMovies: trendingMoviesResult.data,
      trendingShows: trendingShowsResult.data,
      loading: false,
      hasFetchedHomeData: true,
    });

    return { success: true };
  },
  fetchMediaDetails: async (mediaId, force = false) => {
    const { mediaDetails } = get();
    const existing = mediaDetails[mediaId];

    // Return cached data if available and not forcing refresh
    if (!force && existing?.hasFetched) {
      return { success: true };
    }

    set((state) => ({
      mediaDetails: {
        ...state.mediaDetails,
        [mediaId]: {
          details: state.mediaDetails[mediaId]?.details ?? null,
          isLoading: true,
          hasFetched: false,
          error: null,
        },
      },
    }));

    const result = await getMediaDetails(mediaId);

    if (!result.success) {
      set((state) => ({
        mediaDetails: {
          ...state.mediaDetails,
          [mediaId]: {
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
        [mediaId]: {
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
