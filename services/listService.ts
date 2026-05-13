import { supabase } from '~/utils/supabase';
import {
  VoidResult,
  DataResult,
  errorData,
  errorVoid,
  successData,
  successVoid,
  List,
  ListItemWithMedia,
  Status,
  SearchPublicListResult,
  ListWithMeta,
} from '~/types/supabaseTypes';

export async function getOwnedLists(): Promise<DataResult<List[]>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return errorData('Not authenticated', { operation: 'get_owned_lists', table: 'lists' });

    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', user.id)
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

export async function getPublicListsByUserId(userId: string): Promise<DataResult<ListWithMeta[]>> {
  try {
    const { data, error } = await supabase.rpc('get_public_lists_by_user', {
      profile_user_id: userId,
    });

    if (error)
      return errorData(error, {
        operation: 'get_public_lists_by_user',
        rpc: 'get_public_lists_by_user',
      });

    return successData(data ?? []);
  } catch (err) {
    return errorData(err, {
      operation: 'get_public_lists_by_user',
      rpc: 'get_public_lists_by_user',
    });
  }
}

export async function getLikedLists(): Promise<DataResult<ListWithMeta[]>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return errorData('Not authenticated', {
        operation: 'get_liked_lists',
        rpc: 'get_liked_lists',
      });

    const { data, error } = await supabase.rpc('get_liked_lists', { p_user_id: user.id });

    if (error)
      return errorData(error, {
        operation: 'get_liked_lists',
        rpc: 'get_liked_lists',
      });

    return successData(data);
  } catch (err) {
    return errorData(err, {
      operation: 'get_liked_lists',
      rpc: 'get_liked_lists',
    });
  }
}

export async function createList(newList: Partial<List>): Promise<DataResult<List>> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .insert([{ ...newList }])
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
    if (error) {
      return errorData(error, {
        operation: 'get_list_items',
        rpc: 'get_list_items_with_media',
      });
    }
    return successData(data);
  } catch (err) {
    return errorData(err, {
      operation: 'get_list_items',
      rpc: 'get_list_items_with_media',
    });
  }
}

export async function addListItem(listId: number, mediaId: number): Promise<VoidResult> {
  try {
    const { error } = await supabase
      .from('list_items')
      .insert([{ list_id: listId, media_id: mediaId }]);

    if (error) {
      return errorVoid(error, {
        operation: 'add_list_item',
        table: 'list_items',
        isWrite: true,
      });
    }
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

export async function likeList(listId: number): Promise<VoidResult> {
  try {
    const { error } = await supabase.rpc('like_list', { p_list_id: listId });
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

export async function unlikeList(listId: number): Promise<VoidResult> {
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

export async function updateItemStatus(mediaId: number, status: Status): Promise<VoidResult> {
  try {
    const { error } = await supabase
      .from('user_media')
      .update({ status: status })
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

export async function searchLists(query: string): Promise<DataResult<SearchPublicListResult[]>> {
  try {
    const { data, error } = await supabase.rpc('search_public_lists', {
      search_query: query,
      result_limit: 20,
    });

    if (error) {
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
