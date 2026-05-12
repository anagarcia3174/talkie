import {
  DataResult,
  errorData,
  errorVoid,
  Profile,
  successData,
  successVoid,
  VoidResult,
} from '~/types/supabaseTypes';
import { supabase } from '~/utils/supabase';

export async function blockUser(currentUser: string, targetUserId: string): Promise<VoidResult> {
  try {
    const { error } = await supabase.from('blocks').insert({
      blocker_id: currentUser,
      blocked_id: targetUserId,
    });

    if (error) {
      return errorVoid(error, {
        operation: 'block_user',
        table: 'blocks',
        isWrite: true,
      });
    }
    return successVoid();
  } catch (err: any) {
    return errorVoid(err, {
      operation: 'block_user',
      table: 'blocks',
      isWrite: true,
    });
  }
}

export async function unblockUser(currentUser: string, blockedUser: string): Promise<VoidResult> {
  try {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', currentUser)
      .eq('blocked_id', blockedUser);

    if (error) {
      return errorVoid(error, {
        operation: 'unblock_user',
        table: 'blocks',
        isWrite: true,
      });
    }
    return successVoid();
  } catch (err: any) {
    return errorVoid(err, {
      operation: 'unblock_user',
      table: 'blocks',
      isWrite: true,
    });
  }
}

export async function getBlockedUsers(): Promise<DataResult<Profile[]>> {
  try {
    const { data, error } = await supabase.rpc('get_blocked_users');

    if (error) {
      return errorData(error, {
        operation: 'get_blocked_users',
        table: 'profiles',
      });
    }

    return successData(data ?? []);
  } catch (err: any) {
    return errorData(err, {
      operation: 'get_blocked_users',
      table: 'profiles',
    });
  }
}
export async function getBlockedIds(currentUserId: string): Promise<DataResult<string[]>> {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', currentUserId);

    if (error) {
      return errorData(error, {
        operation: 'get_blocked_ids',
        table: 'blocks',
        isWrite: false,
      });
    }

    const ids = (data ?? []).map((row) => row.blocked_id);
    return successData(ids);
  } catch (err: any) {
    return errorData(err, {
      operation: 'get_blocked_ids',
      table: 'blocks',
      isWrite: false,
    });
  }
}
