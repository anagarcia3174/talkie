import { supabase } from '~/utils/supabase';
import type { Profile, ProfileStats, DataResult, VoidResult } from '~/types/supabaseTypes';
import { errorData, errorVoid, successData, successVoid } from '~/types/supabaseTypes';
import { withPublicUrl } from '~/utils/storageUrl';

export async function getProfileById(id: string): Promise<DataResult<Profile>> {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error)
      return errorData(error, {
        operation: 'get_profile',
        table: 'profiles',
      });

    return successData(withPublicUrl(data));
  } catch (err) {
    return errorData(err, {
      operation: 'get_profile',
      table: 'profiles',
    });
  }
}

export async function getProfileStats(id: string): Promise<DataResult<ProfileStats>> {
  try {
    const { data, error } = await supabase.rpc('get_profile_stats', {
      user_id: id,
    });
    if (error)
      return errorData(error, {
        operation: 'get_profile_stats',
        rpc: 'get_profile_stats',
      });

    return successData(data);
  } catch (err) {
    return errorData(err, {
      operation: 'get_profile_stats',
      rpc: 'get_profile_stats',
    });
  }
}

export async function uploadAvatar(
  filePath: string,
  arrayBuffer: ArrayBuffer,
  mimeType: string
): Promise<VoidResult> {
  try {
    const { error } = await supabase.storage.from('avatars').upload(filePath, arrayBuffer, {
      upsert: true,
      contentType: mimeType,
    });
    if (error)
      return errorVoid(error, {
        operation: 'upload_avatar',
        isWrite: true,
      });
    return successVoid();
  } catch (err) {
    return errorVoid(err);
  }
}

export async function updateProfile(
  id: string,
  updates: Partial<Profile>
): Promise<DataResult<Profile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString,
      })
      .eq('id', id)
      .select()
      .single();

    if (error)
      return errorData(error, {
        operation: 'update_profile',
        table: 'profiles',
        isWrite: true,
      });

    return successData(data);
  } catch (err) {
    return errorData(err, {
      operation: 'update_profile',
      table: 'profiles',
      isWrite: true,
    });
  }
}

export async function softDeleteAccount(): Promise<VoidResult> {
  try {
    const { error } = await supabase.rpc('soft_delete_account');

    if (error) {
      return errorVoid(error, {
        operation: 'soft_delete_account',
        rpc: 'soft_delete_account',
        isWrite: true,
      });
    }

    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'soft_delete_account',
      rpc: 'soft_delete_account',
      isWrite: true,
    });
  }
}

export async function restoreUser(): Promise<VoidResult> {
  try {
    const { error } = await supabase.rpc('restore_user');

    if (error) {
      return errorVoid(error, {
        operation: 'restore_user',
        rpc: 'restore_user',
        isWrite: true,
      });
    }

    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'restore_user',
      rpc: 'restore_user',
      isWrite: true,
    });
  }
}
