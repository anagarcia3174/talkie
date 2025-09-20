import { Profile, ProfileStats, Result } from '~/types/supabaseTypes';
import { supabase } from '~/utils/supabase';
import { create } from 'zustand';
import { getErrorMessage } from '~/utils/errorHandler';
import { ImagePickerAsset } from 'expo-image-picker';
import { withPublicUrl } from '~/utils/storageUrl';

interface ProfileState {
  profile: Profile | null;
  stats: ProfileStats;
  loading: boolean;
  error: string | null;

  getProfile: (userId: string) => Promise<Result<void>>;
  getStats: (userId: string) => Promise<Result<void>>;
  uploadAvatar: (userId: string, fileUri: ImagePickerAsset) => Promise<Result<void>>;
  updateProfile: (updates: Partial<Profile>) => Promise<Result<void>>;
  clearProfile: () => void;
}
export const useProfile = create<ProfileState>((set, get) => ({
  profile: null,
  stats: {
    followers: 0,
    following: 0,
    reviews: 0,
    totalLogged: 0,
    avgRating: 0,
  },
  loading: false,
  error: null,

  // Fetch current user's profile
  getProfile: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) throw error;

      const normalized = withPublicUrl(data);
      set({ profile: normalized, loading: false });
      return { success: true };
    } catch (err: any) {
      const message = getErrorMessage(err);
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  getStats: async (userId) => {
    try {
      const { data, error } = await supabase.rpc('get_profile_stats', {
        user_id: userId,
      });
      if (error) throw error;

      const stats: ProfileStats = {
        followers: data.followers,
        following: data.following,
        reviews: data.reviews,
        avgRating: data.avgRating,
        totalLogged: data.totalLogged
      };
      set({ stats });
      return { success: true };
    } catch (err: any) {
      console.log(err)
      const message = getErrorMessage(err);
      set({ error: message });
      return { success: false, error: message };
    }
  },

  uploadAvatar: async (userId, image) => {
    try {
      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());
      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, arraybuffer, {
          upsert: true,
          contentType: image.mimeType ?? 'image/jpeg',
        });

      if (error) throw error;

      await get().getProfile(userId);
      return { success: true };
    } catch (err: any) {
      console.log(err);
      const message = getErrorMessage(err);
      set({ error: message });
      return { success: false, error: message };
    }
  },

  updateProfile: async (updates) => {
    if (!get().profile) {
      return { success: false, error: 'No profile loaded' };
    }
    const { id } = get().profile!;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const normalized = withPublicUrl(data);
      set({ profile: normalized });
      return { success: true };
    } catch (err: any) {
      const message = getErrorMessage(err);
      set({ error: message });
      return { success: false, error: message };
    }
  },

  clearProfile: () => set({ profile: null, error: null }),
}));
