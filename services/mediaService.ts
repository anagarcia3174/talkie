import { supabase } from '~/utils/supabase';
import type { Media, Result } from '~/types/supabaseTypes';
import { errorResult, successResult } from '~/types/supabaseTypes';

export async function getMediaById(id: number, mediaType: string): Promise<Result<Media>> {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .eq('media_type', mediaType)
      .single();

    if (error) return errorResult(error);
    if (!data) return errorResult('Media not found');

    return successResult(data);
  } catch (err) {
    return errorResult(err);
  }
}

async function getCollection(collection: 'trending', mediaType: 'movie' | 'tv'): Promise<Result<Media[]>> {
  try {
    const { data, error } = await supabase.rpc(`get_${collection}_media`, {
      p_media_type: mediaType
    });

    if (error) return errorResult(error);
    if (!data) return errorResult('No data found');

    return successResult(data);
  } catch (err) {
    return errorResult(err);
  }
}

export async function searchMedia(searchText: string): Promise<Result<Media[]>> {
  try {
    const { data, error } = await supabase.functions.invoke('search-media', {
      body: { query: searchText },
    });

    if(error) {
      console.log('Error invoking search-media function:', error);
      return errorResult(error)};
    if(!data) return errorResult('No data found');
    return successResult(data.results as Media[]);
  } catch (err) {
    console.log(err)
    return errorResult(err);
  }
}

// Usage
export const getTrendingMovies = () => getCollection('trending', 'movie');
export const getTrendingShows = () => getCollection('trending', 'tv');