import { supabase } from '~/utils/supabase';
import type { Profile, ProfileStats, DataResult, VoidResult } from '~/types/supabaseTypes';
import { errorData, errorVoid, successData, successVoid } from '~/types/supabaseTypes';
import { withPublicUrl } from '~/utils/storageUrl';


export async function getProfileById(id: string): Promise<DataResult<Profile>> {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) return errorData(error);
    if (!data) return errorData('Profile not found');

    return successData(withPublicUrl(data));
  } catch (err) {
    return errorData(err);
  }
}

export async function getProfileStats(id: string): Promise<DataResult<ProfileStats>> {
  try {
    const { data, error } = await supabase.rpc('get_profile_stats', {
      user_id: id,
    });
    if (error) return errorData(error);
    if (!data) return errorData('Profile Stats not found');

    return successData(data);
  } catch (err) {
    return errorData(err);
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
    if(error) console.log('Upload error:', error);
    if (error) return errorVoid(error);
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

    if (error) return errorData(error);
    if (!data) return errorData('Profile not found');

    return successData(data);
  } catch (err) {
    return errorData(err);
  }
}
