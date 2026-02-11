import { supabase } from '~/utils/supabase';
import type {
  LibraryStatus,
  List,
  ListItemWithMedia,
  ListSearchResult,
  DataResult,
  VoidResult,
  ListWithOwner,
} from '~/types/supabaseTypes';
import { errorData, errorVoid, successData, successVoid } from '~/types/supabaseTypes';

export async function getOwnedLists(userId: string): Promise<DataResult<List[]>> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) return errorData(error);
    if (!data) return errorData('Lists not found');
    return successData(data ?? []);
  } catch (err) {
    return errorData(err);
  }
}

export async function getPublicListsByUserId(userId: string): Promise<DataResult<List[]>> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId)
      .eq('is_private', false)
      .order('updated_at', { ascending: false });

    if (error) return errorData(error);

    return successData(data ?? []);
  } catch (err) {
    return errorData(err);
  }
}

export async function getLikedLists(userId: string): Promise<DataResult<List[]>> {
  try {
    const { data, error } = await supabase.rpc('get_liked_lists', { p_user_id: userId });

    if (error) {
      return errorData(error);
    }
    const lists: List[] = (data ?? []) as List[];

    return successData(lists);
  } catch (err) {
    return errorData(err);
  }
}

export async function getListWithProfile(listId: number): Promise<DataResult<ListWithOwner>> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select(
        `
        *,
        owner:user_id (
          id,
          display_name,
          avatar_url,
          is_private
        )
      `
      )
      .eq('id', listId)
      .single();

    if (error) return errorData(error);
    if (!data) return errorData('List not found');

    return successData(data);
  } catch (err) {
    return errorData(err);
  }
}

export async function createList(
  userId: string,
  newList: Partial<List>
): Promise<DataResult<List>> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .insert([{ ...newList, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return successData(data);
  } catch (err) {
    return errorData(err);
  }
}

export async function updateList(
  listId: number,
  updates: Partial<List>
): Promise<DataResult<List>> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', listId)
      .select()
      .single();

    if (error) throw error;
    return successData(data);
  } catch (err) {
    return errorData(err);
  }
}

export async function deleteList(listId: number): Promise<VoidResult> {
  try {
    const { error } = await supabase.from('lists').delete().eq('id', listId);

    if (error) throw error;
    return successVoid();
  } catch (err) {
    return errorVoid(err);
  }
}

export async function getListItems(listId: number): Promise<DataResult<ListItemWithMedia[]>> {
  try {
    const { data, error } = await supabase.rpc('get_list_items_with_media', { p_list_id: listId });
    if (error) throw error;
    if (!data) return errorData('List Items not found');
    return successData(data);
  } catch (err) {
    return errorData(err);
  }
}

export async function addListItem(
  listId: number,
  mediaId: number,
  userId: string
): Promise<VoidResult> {
  try {
    const { error } = await supabase
      .from('list_items')
      .insert([{ list_id: listId, media_id: mediaId, user_id: userId }]);

    if (error) throw error;
    return successVoid();
  } catch (err) {
    return errorVoid(err);
  }
}

export async function removeListItem(itemId: number): Promise<VoidResult> {
  try {
    const { error } = await supabase.from('list_items').delete().eq('id', itemId);

    if (error) throw error;
    return successVoid();
  } catch (err) {
    return errorVoid(err);
  }
}

export async function likeList(listId: number, userId: string): Promise<VoidResult> {
  try {
    const { error } = await supabase.rpc('like_list', { p_user_id: userId, p_list_id: listId });
    if (error) throw error;
    return successVoid();
  } catch (err) {
    return errorVoid(err);
  }
}

export async function unlikeList(listId: number, userId: string): Promise<VoidResult> {
  try {
    const { error } = await supabase.rpc('unlike_list', { p_user_id: userId, p_list_id: listId });
    if (error) throw error;
    return successVoid();
  } catch (err) {
    return errorVoid(err);
  }
}

export async function updateItemStatus(
  user_id: string,
  mediaId: number,
  status: LibraryStatus
): Promise<VoidResult> {
  try {
    const { error } = await supabase
      .from('user_media')
      .update({ status: status })
      .eq('user_id', user_id)
      .eq('media_id', mediaId);

    if (error) throw error;
    return successVoid();
  } catch (err) {
    return errorVoid(err);
  }
}

export async function searchLists(query: string): Promise<DataResult<ListSearchResult[]>> {
  try {
    const { data, error } = await supabase.rpc('search_public_lists', {
      search_query: query,
      result_limit: 20,
    });

    if (error) throw error;
    if (!data) return errorData('No lists found');
    return successData(data);
  } catch (err) {
    console.log(err);
    return errorData(err);
  }
}
