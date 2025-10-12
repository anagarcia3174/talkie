// // src/types/tmdb.ts

// export interface TMDBBaseMedia {
//   id: number;
//   title?: string;         // movies
//   name?: string;          // tv shows
//   overview: string;
//   poster_path: string | null;
//   backdrop_path: string | null;
//   release_date?: string;  // movies
//   first_air_date?: string; // tv shows
//   vote_average: number;
//   media_type?: "movie" | "tv"; // sometimes included in trending
// }

// export interface TMDBPaginatedResponse<T> {
//   page: number;
//   results: T[];
//   total_pages: number;
//   total_results: number;
// }

// export interface TMDBReview {
//   id: string;
//   author: string;
//   content: string;
//   created_at: string;
//   author_details: {
//     username: string;
//     name: string;
//     rating: number | null;
//     avatar_path: string | null;
//   };
//   movie?: {
//     id: number;
//     title: string;
//     poster_path: string | null;
//     backdrop_path: string | null;
//     release_date: string;
//   }
// }

// export interface TMDBReviewResponse {
//   id: number;
//   page: number;
//   results: TMDBReview[];
//   total_pages: number;
//   total_results: number;
// }
