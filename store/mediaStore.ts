import { create } from 'zustand';
import { Media, MovieDetails, TVDetails } from '~/types/supabaseTypes';
import { getMediaDetails, getTrendingMovies, getTrendingShows } from '~/services/mediaService';

type StoreResult<T = void> = { success: true } | { success: false; error: string };

interface MediaState {
  loading: boolean;
  trendingMovies: Media[];
  trendingShows: Media[];
  loadingIds: Set<number>;
  mediaDetails: Record<number, MovieDetails | TVDetails>;
  fetchHomeData: () => Promise<StoreResult<void>>;
  fetchMediaDetails: (
    media_id: number,
    force?: boolean
  ) => Promise<StoreResult<MovieDetails | TVDetails>>;
}

export const useMedia = create<MediaState>((set, get) => ({
  loading: false,
  trendingMovies: [],
  trendingShows: [],
  mediaDetails: {},
  loadingIds: new Set(),
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
    const { mediaDetails, loadingIds } = get();

    // Return cached data if available and not forcing refresh
    if (!force && mediaDetails[media_id]) {
      return { success: true, data: mediaDetails[media_id] };
    }

    // Prevent duplicate in-flight requests for the same media
    if (loadingIds.has(media_id)) {
      return { success: true, error: 'Already fetching' };
    }

    set((state) => ({ loadingIds: new Set(state.loadingIds).add(media_id) }));

    const result = await getMediaDetails(media_id);

    if (!result.success) {
      set((state) => {
        const updated = new Set(state.loadingIds);
        updated.delete(media_id);
        return { loadingIds: updated };
      });
      return { success: false, error: result.error };
    }

    set((state) => {
      const updated = new Set(state.loadingIds);
      updated.delete(media_id);
      return {
        loadingIds: updated,
        mediaDetails: { ...state.mediaDetails, [media_id]: result.data },
      };
    });

    return { success: true, data: result.data };
  },
}));
