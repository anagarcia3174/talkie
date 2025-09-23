// src/api/services/homeService.ts
import { tmdbGet } from "~/utils/tmdbClient";
import {
  TMDBPaginatedResponse,
  TMDBBaseMedia,
  TMDBReviewResponse,
} from "~/types/tmdbTypes";

export const HomeService = {
  getNowPlayingMovies: () =>
    tmdbGet<TMDBPaginatedResponse<TMDBBaseMedia>>("movie/now_playing"),

  getNowPlayingTV: () =>
    tmdbGet<TMDBPaginatedResponse<TMDBBaseMedia>>("tv/on_the_air"),

  getTrending: (timeWindow: "day" | "week" = "day") =>
    tmdbGet<TMDBPaginatedResponse<TMDBBaseMedia>>(`trending/all/${timeWindow}`),

  getUpcomingMovies: () =>
    tmdbGet<TMDBPaginatedResponse<TMDBBaseMedia>>("movie/upcoming"),

  // Reviews from a specific movie
  getMovieReviews: (movieId: number) =>
    tmdbGet<TMDBReviewResponse>(`movie/${movieId}/reviews`),

  // Reviews from a specific tv show
  getTVReviews: (tvId: number) =>
    tmdbGet<TMDBReviewResponse>(`tv/${tvId}/reviews`),
};
