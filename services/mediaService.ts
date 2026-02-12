import { supabase } from '~/utils/supabase';
import type { Media, DataResult, VoidResult } from '~/types/supabaseTypes';
import { errorData, errorVoid, successData, successVoid } from '~/types/supabaseTypes';

export async function getMediaById(id: number, mediaType: string): Promise<DataResult<Media>> {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .eq('media_type', mediaType)
      .single();

    if (error) return errorData(error);
    if (!data) return errorData('Media not found');

    return successData(data);
  } catch (err) {
    return errorData(err);
  }
}

async function getCollection(collection: 'trending', mediaType: 'movie' | 'tv'): Promise<DataResult<Media[]>> {
  try {
    const { data, error } = await supabase.rpc(`get_${collection}_media`, {
      p_media_type: mediaType
    });

    if (error) return errorData(error);
    if (!data) return errorData('No data found');

    return successData(data);
  } catch (err) {
    return errorData(err);
  }
}

export async function searchMedia(searchText: string): Promise<DataResult<Media[]>> {
  try {
    const { data, error } = await supabase.functions.invoke('search-media', {
      body: { query: searchText },
    });

    if(error) {
      return errorData(error)};
    if(!data) return errorData('No data found');
    return successData(data.results as Media[]);
  } catch (err) {
    return errorData(err);
  }
}

// Usage
export const getTrendingMovies = () => getCollection('trending', 'movie');
export const getTrendingShows = () => getCollection('trending', 'tv');