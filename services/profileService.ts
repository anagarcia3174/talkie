import { supabase } from '~/utils/supabase';
import type { Profile, ProfileStats, Result } from '~/types/supabaseTypes';
import { errorResult, successResult } from '~/types/supabaseTypes';
import { ImagePickerAsset } from 'expo-image-picker';

export async function getProfileById(id: string): Promise<Result<Profile>> {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) return errorResult(error);
    if (!data) return errorResult('Profile not found');

    return successResult(data);
  } catch (err) {
    return errorResult(err);
  }
}

export async function getProfileStats(id: string): Promise<Result<ProfileStats>> {
  try {
    const { data, error } = await supabase.rpc('get_profile_stats', {
      user_id: id,
    });
    if (error) return errorResult(error);
    if (!data) return errorResult('Profile Stats not found');

    return successResult(data);
  } catch (err) {
    return errorResult(err);
  }
}

export async function uploadAvatar(
  id: string,
  filePath: string,
  arrayBuffer: ArrayBuffer,
  mimeType: string
): Promise<Result<void>> {
  try {
    const { error } = await supabase.storage.from('avatars').upload(filePath, arrayBuffer, {
      upsert: true,
      contentType: mimeType,
    });

    if (error) return errorResult(error);
    return successResult(undefined);
  } catch (err) {
    return errorResult(err);
  }
}

export async function updateProfile(
  id: string,
  updates: Partial<Profile>
): Promise<Result<Profile>> {
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

    if (error) return errorResult(error);
    if (!data) return errorResult('Profile not found');

    return successResult(data);
  } catch (err) {
    return errorResult(err);
  }
}
