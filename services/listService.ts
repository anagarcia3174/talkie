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

    if (error)
      return errorData(error, {
        operation: 'get_owned_lists',
        table: 'lists',
      });

    return successData(data ?? []);
  } catch (err) {
    return errorData(err, {
      operation: 'get_owned_lists',
      table: 'lists',
    });
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

    if (error)
      return errorData(error, {
        operation: 'get_public_lists_by_user',
        table: 'lists',
      });

    return successData(data ?? []);
  } catch (err) {
    return errorData(err, {
      operation: 'get_public_lists_by_user',
      table: 'lists',
    });
  }
}

export async function getLikedLists(userId: string): Promise<DataResult<List[]>> {
  try {
    const { data, error } = await supabase.rpc('get_liked_lists', { p_user_id: userId });

    if (error)
      return errorData(error, {
        operation: 'get_liked_lists',
        rpc: 'get_liked_lists',
      });
    const lists: List[] = data.map((row: any) => ({
      ...row,
      owner: {
        id: row.owner_id,
        display_name: row.owner_display_name,
        avatar_url: row.owner_avatar_url,
        is_private: row.owner_is_private,
      },
    }));
    return successData(lists);
  } catch (err) {
    return errorData(err, {
      operation: 'get_liked_lists',
      rpc: 'get_liked_lists',
    });
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

    if (error)
      return errorData(error, {
        operation: 'get_list_with_profile',
        table: 'lists',
      });

    return successData(data);
  } catch (err) {
    return errorData(err, {
      operation: 'get_list_with_profile',
      table: 'lists',
    });
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

    if (error)
      return errorData(error, {
        operation: 'create_list',
        table: 'lists',
        isWrite: true,
      });
    return successData(data);
  } catch (err) {
    return errorData(err, {
      operation: 'create_list',
      table: 'lists',
      isWrite: true,
    });
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

    if (error)
      return errorData(error, {
        operation: 'update_list',
        table: 'lists',
        isWrite: true,
      });
    return successData(data);
  } catch (err) {
    return errorData(err, {
      operation: 'update_list',
      table: 'lists',
      isWrite: true,
    });
  }
}

export async function deleteList(listId: number): Promise<VoidResult> {
  try {
    const { error } = await supabase.from('lists').delete().eq('id', listId);

    if (error)
      return errorVoid(error, {
        operation: 'delete_list',
        table: 'lists',
        isWrite: true,
      });
    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'delete_list',
      table: 'lists',
      isWrite: true,
    });
  }
}

export async function getListItems(listId: number): Promise<DataResult<ListItemWithMedia[]>> {
  try {
    const { data, error } = await supabase.rpc('get_list_items_with_media', { p_list_id: listId });
    if (error)
      return errorData(error, {
        operation: 'get_list_items',
        rpc: 'get_list_items_with_media',
      });
    return successData(data);
  } catch (err) {
    return errorData(err, {
      operation: 'get_list_items',
      rpc: 'get_list_items_with_media',
    });
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

    if (error)
      return errorVoid(error, {
        operation: 'add_list_item',
        table: 'list_items',
        isWrite: true,
      });
    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'add_list_item',
      table: 'list_items',
      isWrite: true,
    });
  }
}

export async function removeListItem(itemId: number): Promise<VoidResult> {
  try {
    const { error } = await supabase.from('list_items').delete().eq('id', itemId);

    if (error)
      return errorVoid(error, {
        operation: 'remove_list_item',
        table: 'list_items',
        isWrite: true,
      });
    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'remove_list_item',
      table: 'list_items',
      isWrite: true,
    });
  }
}

export async function likeList(listId: number, userId: string): Promise<VoidResult> {
  try {
    const { error } = await supabase.rpc('like_list', {p_list_id: listId });
    if (error)
      return errorVoid(error, {
        operation: 'like_list',
        rpc: 'like_list',
        isWrite: true,
      });
    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'like_list',
      rpc: 'like_list',
      isWrite: true,
    });
  }
}

export async function unlikeList(listId: number, userId: string): Promise<VoidResult> {
  try {
    const { error } = await supabase.rpc('unlike_list', { p_list_id: listId });
    if (error)
      return errorVoid(error, {
        operation: 'unlike_list',
        rpc: 'unlike_list',
        isWrite: true,
      });
    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'unlike_list',
      rpc: 'unlike_list',
      isWrite: true,
    });
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

    if (error)
      return errorVoid(error, {
        operation: 'update_item_status',
        table: 'user_media',
        isWrite: true,
      });
    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'update_item_status',
      table: 'user_media',
      isWrite: true,
    });
  }
}

export async function searchLists(query: string): Promise<DataResult<ListSearchResult[]>> {
  try {
    const { data, error } = await supabase.rpc('search_public_lists', {
      search_query: query,
      result_limit: 20,
    });

    if (error){
      return errorData(error, {
        operation: 'search_lists',
        rpc: 'search_public_lists',
      });
    }
    return successData(data ?? []);
  } catch (err) {
    return errorData(err, {
      operation: 'search_lists',
      rpc: 'search_public_lists',
    });
  }
}
