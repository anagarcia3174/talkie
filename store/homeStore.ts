// src/store/homeStore.ts
import { create } from "zustand";
import { HomeService } from "~/services/tmdbService";
import {
  TMDBBaseMedia,
  TMDBReview,
  TMDBPaginatedResponse,
} from "~/types/tmdbTypes";

interface HomeState {
  loading: boolean;
  error: string | null;
  nowPlaying: TMDBBaseMedia[];
  trending: TMDBBaseMedia[];
  upcoming: TMDBBaseMedia[];
  reviews: TMDBReview[];
  fetchHomeData: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
  loading: false,
  error: null,
  nowPlaying: [],
  trending: [],
  upcoming: [],
  reviews: [],

  fetchHomeData: async () => {
    set({ loading: true, error: null });
    try {
      const [nowPlayingMovies, nowPlayingTV, trending, upcoming] =
        await Promise.all([
          HomeService.getNowPlayingMovies(),
          HomeService.getNowPlayingTV(),
          HomeService.getTrending("day"),
          HomeService.getUpcomingMovies(),
        ]);

      // pick one random movie to fetch reviews from
      const sampleId = nowPlayingMovies.results[0]?.id;
      let reviews: TMDBReview[] = [];
      if (sampleId) {
        const reviewRes = await HomeService.getMovieReviews(sampleId);
        reviews = reviewRes.results;
      }

      set({
        nowPlaying: [...nowPlayingMovies.results, ...nowPlayingTV.results],
        trending: trending.results,
        upcoming: upcoming.results,
        reviews,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to load home data", loading: false });
    }
  },
}));
