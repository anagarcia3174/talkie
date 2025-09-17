import { Profile, ProfileStats } from '~/types/supabaseTypes';
import { supabase } from '~/utils/supabase';
import { create } from 'zustand';
interface ProfileState {
  profile: Profile | null;
  stats: ProfileStats;
  loading: boolean;
  error: string | null;

  getProfile: (userId: string) => Promise<void>;
  getStats: (userId: string) => Promise<void>;
  uploadAvatar: (userId: string, fileUri: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
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
  getProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) throw error;
      set({ profile: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  getStats: async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_profile_stats', { user_id: userId });

      if (error) throw error;

      set({
        stats: {
          followers: data.followers,
          following: data.following,
          reviews: data.reviews,
          totalLogged: data.totalLogged,
          avgRating: data.avgRating,
        },
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
  // Upload avatar and let trigger update profiles.avatar_url
  uploadAvatar: async (userId: string, fileUri: string) => {
    try {
      const fileExt = fileUri.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const response = await fetch(fileUri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { upsert: true });

      if (error) throw error;

      // Re-fetch profile so UI updates
      await get().getProfile(userId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // Update display_name, bio, etc.
  updateProfile: async (updates: Partial<Profile>) => {
    if (!get().profile) return;

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
      set({ profile: data });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // Clear store (e.g. on sign out)
  clearProfile: () => set({ profile: null, error: null }),
}));
