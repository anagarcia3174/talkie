import { create } from 'zustand';
import { Media } from '~/types/supabaseTypes';
import { getTrending, getHiddenGems } from '~/services/mediaService';

type StoreResult<T = void> = { success: true } | { success: false; error: string };

interface HomeState {
  loading: boolean;
  trending: Media[];
  hiddenGems: Media[];
  fetchHomeData: () => Promise<StoreResult<void>>;
}

export const useHomeStore = create<HomeState>((set) => ({
  loading: false,
  trending: [],
  hiddenGems: [],

  fetchHomeData: async () => {
    set({ loading: true });

    const [trendingResult, hiddenGemsResult] = await Promise.all([getTrending(), getHiddenGems()]);

    // Check if any requests failed
    if (!trendingResult.success) {
      set({ loading: false });
      return { success: false, error: trendingResult.error };
    }

    if (!hiddenGemsResult.success) {
      set({ loading: false });
      return { success: false, error: hiddenGemsResult.error };
    }

    // All requests succeeded
    set({
      trending: trendingResult.data,
      hiddenGems: hiddenGemsResult.data,
      loading: false,
    });
    return { success: true}
  }
}));
