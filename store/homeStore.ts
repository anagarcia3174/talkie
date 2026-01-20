import { create } from 'zustand';
import { Media } from '~/types/supabaseTypes';
import { getTrendingMovies, getTrendingShows } from '~/services/mediaService';

type StoreResult<T = void> = { success: true } | { success: false; error: string };

interface HomeState {
  loading: boolean;
  trendingMovies: Media[];
  trendingShows: Media[];
  fetchHomeData: () => Promise<StoreResult<void>>;
}

export const useHomeStore = create<HomeState>((set) => ({
  loading: false,
  trendingMovies: [],
  trendingShows: [],
  fetchHomeData: async () => {
    set({ loading: true });

    const [trendingMoviesResult, trendingShowsResult] = await Promise.all([
      getTrendingMovies(),
      getTrendingShows()
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
    return { success: true}
  }
}));
