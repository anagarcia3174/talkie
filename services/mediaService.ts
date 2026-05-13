import { supabase } from '~/utils/supabase';
import type { Media, DataResult, MovieDetails, TVDetails } from '~/types/supabaseTypes';
import { errorData, successData } from '~/types/supabaseTypes';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

export async function getMediaById(id: number, mediaType: string): Promise<DataResult<Media>> {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .eq('media_type', mediaType)
      .single();

    if (error)
      return errorData(error, {
        operation: 'get_media_by_id',
        table: 'media',
      });

    return successData(data);
  } catch (err) {
    return errorData(err, {
      operation: 'get_media_by_id',
      table: 'media',
    });
  }
}

async function getCollection(
  collection: 'trending',
  mediaType: 'movie' | 'tv'
): Promise<DataResult<Media[]>> {
  try {
    const { data, error } = await supabase.rpc(`get_${collection}_media`, {
      p_media_type: mediaType,
    });

    if (error)
      return errorData(error, {
        operation: 'get_collection',
        rpc: `get_${collection}_media`,
      });

    return successData(data);
  } catch (err) {
    return errorData(err, {
      operation: 'get_collection',
      rpc: `get_${collection}_media`,
    });
  }
}

export async function searchMedia(searchText: string): Promise<DataResult<Media[]>> {
  try {
    const { data, error } = await supabase.functions.invoke('search-media', {
      body: { query: searchText },
    });

    if (error) {
      return errorData(error, {
        operation: 'search_media',
      });
    }
    if (!data) return errorData('No data found');
    return successData(data.results as Media[]);
  } catch (err) {
    return errorData(err);
  }
}

// Usage
export const getTrendingMovies = () => getCollection('trending', 'movie');
export const getTrendingShows = () => getCollection('trending', 'tv');

export async function getMediaDetails(id: number): Promise<DataResult<MovieDetails | TVDetails>> {
  try {
    const { data, error } = await supabase.functions.invoke('get-media-details', {
      method: 'GET',
      body: { media_id: id },
    });

    if (error) {
      return errorData(error, {
        operation: 'get-media-details',
      });
    }

    if (!data) return errorData('No data found');
    return successData(data.results);
  } catch (err) {
    return errorData(err, {
      operation: 'get_media_details',
    });
  }
}
