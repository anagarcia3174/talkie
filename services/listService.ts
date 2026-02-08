import { supabase } from '~/utils/supabase';
import type {
  LibraryStatus,
  LikedListRow,
  List,
  ListItemWithMedia,
  ListSearchResult,
  Media,
  Result,
} from '~/types/supabaseTypes';
import { errorResult, successResult } from '~/types/supabaseTypes';

export async function getOwnedLists(userId: string): Promise<Result<List[]>> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) return errorResult(error);
    if (!data) return errorResult('Lists not found');
    return successResult(data ?? []);
  } catch (err) {
    return errorResult(err);
  }
}

export async function getLikedLists(userId: string): Promise<Result<List[]>> {
  try {
    const { data, error } = await supabase.rpc('get_liked_lists', { p_user_id: userId });

    if (error) {
      return errorResult(error);
    }
    const lists: List[] = (data ?? []) as List[];

    return successResult(lists);
  } catch (err) {
    return errorResult(err);
  }
}

export async function createList(userId: string, newList: Partial<List>): Promise<Result<List>> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .insert([{ ...newList, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return successResult(data);
  } catch (err) {
    return errorResult(err);
  }
}

export async function updateList(listId: number, updates: Partial<List>): Promise<Result<List>> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', listId)
      .select()
      .single();

    if (error) throw error;
    return successResult(data);
  } catch (err) {
    return errorResult(err);
  }
}

export async function deleteList(listId: number): Promise<Result<void>> {
  try {
    const { error } = await supabase.from('lists').delete().eq('id', listId);

    if (error) throw error;
    return successResult(undefined);
  } catch (err) {
    return errorResult(err);
  }
}

export async function getListItems(listId: number): Promise<Result<ListItemWithMedia[]>> {
  try {
    const { data, error } = await supabase.rpc('get_list_items_with_media', { p_list_id: listId });
    if (error) throw error;
    if (!data) return errorResult('List Items not found');
    return successResult(data);
  } catch (err) {
    return errorResult(err);
  }
}

export async function addListItem(
  listId: number,
  mediaId: number,
  userId: string
): Promise<Result<void>> {
  try {
    const { error } = await supabase
      .from('list_items')
      .insert([{ list_id: listId, media_id: mediaId, user_id: userId }]);

    if (error) throw error;
    return successResult(undefined);
  } catch (err) {
    return errorResult(err);
  }
}

export async function removeListItem(itemId: number): Promise<Result<void>> {
  try {
    const { error } = await supabase.from('list_items').delete().eq('id', itemId);

    if (error) throw error;
    return successResult(undefined);
  } catch (err) {
    return errorResult(err);
  }
}

export async function likeList(listId: number, userId: string): Promise<Result<void>> {
  try {
    const { error } = await supabase.rpc('like_list', { p_user_id: userId, p_list_id: listId });
    if (error) throw error;
    return successResult(undefined);
  } catch (err) {
    return errorResult(err);
  }
}

export async function unlikeList(listId: number, userId: string): Promise<Result<void>> {
  try {
    const { error } = await supabase.rpc('unlike_list', { p_user_id: userId, p_list_id: listId });
    if (error) throw error;
    return successResult(undefined);
  } catch (err) {
    return errorResult(err);
  }
}

export async function updateItemStatus(
  user_id: string,
  mediaId: number,
  status: LibraryStatus
): Promise<Result<void>> {
  try {
    const { error } = await supabase
      .from('user_media')
      .update({ status: status })
      .eq('user_id', user_id)
      .eq('media_id', mediaId);

    if (error) throw error;
    return successResult(undefined);
  } catch (err) {
    return errorResult(err);
  }
}

export async function searchLists(query: string): Promise<Result<ListSearchResult[]>> {
  try {
    const { data, error } = await supabase.rpc('search_public_lists', {
      search_query: query,
      result_limit: 20,
    });

    if (error) throw error;
    if (!data) return errorResult('No lists found');
    return successResult(data);
  } catch (err) {
    console.log(err);
    return errorResult(err);
  }
}
