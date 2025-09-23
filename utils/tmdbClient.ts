import axios from 'axios';

const tmdbClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  params: {
    language: 'en-US',
  },
});

// Request interceptor for logging or modifications
tmdbClient.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log(`➡️ TMDB: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
tmdbClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.status_message || error.message;
    console.error(`❌ TMDB Error [${status}]: ${message}`);
    return Promise.reject(new Error(message));
  }
);

export async function tmdbGet<T>(url: string, params?: Record<string, any>): Promise<T> {
  const response = await tmdbClient.get<T>(url, { params });
  return response.data;
}

export default tmdbClient;
