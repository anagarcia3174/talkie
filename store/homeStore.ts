// src/store/homeStore.ts
import { create } from 'zustand';
import { HomeService } from '~/services/tmdbService';
import { TMDBBaseMedia, TMDBReview, TMDBPaginatedResponse } from '~/types/tmdbTypes';

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
      const [nowPlayingMovies, nowPlayingTV, trending, upcoming] = await Promise.all([
        HomeService.getNowPlayingMovies(),
        HomeService.getNowPlayingTV(),
        HomeService.getTrending('day'),
        HomeService.getUpcomingMovies(),
      ]);

      const newMovieIds = nowPlayingMovies.results.slice(0, 5).map((m) => m.id);

      // fetch reviews for each movie
      const reviewPromises = newMovieIds.map(async (id) => {
        const res = await HomeService.getMovieReviews(id).catch(() => ({ results: [] }));
        // attach the movie details to each review
        const movie = nowPlayingMovies.results.find((m) => m.id === id);
        return res.results.map((r) => ({
          ...r,
          movie: {
            id: movie!.id,
            title: movie!.title!,
            poster_path: movie!.poster_path ?? null,
            backdrop_path: movie!.backdrop_path ?? null,
            release_date: movie!.release_date!,
          },
        }));
      });

      const reviewResponses = await Promise.all(reviewPromises);
      const reviews = reviewResponses.flat();

      set({
        nowPlaying: [...nowPlayingMovies.results, ...nowPlayingTV.results],
        trending: trending.results,
        upcoming: upcoming.results,
        reviews,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load home data', loading: false });
    }
  },
}));
