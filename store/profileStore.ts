import { Profile, ProfileStats, Result } from '~/types/supabaseTypes';
import { create } from 'zustand';
import { getErrorMessage } from '~/utils/errorHandler';
import { ImagePickerAsset } from 'expo-image-picker';
import { withPublicUrl } from '~/utils/storageUrl';
import {
  getProfileById,
  getProfileStats,
  updateProfile,
  uploadAvatar,
} from '~/services/profileService';
interface ProfileState {
  profile: Profile | null;
  stats: ProfileStats;
  loading: boolean;

  getProfile: (userId: string) => Promise<Result<void>>;
  getStats: (userId: string) => Promise<Result<void>>;
  uploadAvatar: (userId: string, fileUri: ImagePickerAsset) => Promise<Result<void>>;
  updateProfile: (userId: string, updates: Partial<Profile>) => Promise<Result<void>>;
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

  // Fetch current user's profile
  getProfile: async (userId) => {
    set({ loading: true });
    const result = await getProfileById(userId);

    if (!result.success) {
      set({ loading: false });
      return { success: false, error: result.error };
    }

    const normalized = withPublicUrl(result.data!);
    set({ profile: normalized, loading: false });
    return { success: true };
  },

  getStats: async (userId) => {
    const result = await getProfileStats(userId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const data = result.data!;
    const stats: ProfileStats = {
      followers: data.followers,
      following: data.following,
      reviews: data.reviews,
      avgRating: data.avgRating,
      totalLogged: data.totalLogged,
    };

    set({ stats });
    return { success: true };
  },

  uploadAvatar: async (userId, image) => {
    try {
      const arrayBuffer = await fetch(image.uri).then((res) => res.arrayBuffer());
      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const filePath = `${userId}/avatar.${fileExt}`;
      const mimeType = image.mimeType ?? 'image/jpeg';

      const result = await uploadAvatar(userId, filePath, arrayBuffer, mimeType);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Refresh the profile after upload
      await get().getProfile(userId);
      return { success: true };
    } catch (err: any) {
      const message = getErrorMessage(err);
      return { success: false, error: message };
    }
  },

  // ─── Update profile ─────────────────────────────────────────────────
  updateProfile: async (userId, updates) => {
    const result = await updateProfile(userId, updates);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const normalized = withPublicUrl(result.data!);
    set({ profile: normalized });
    return { success: true };
  },

  clearProfile: () => set({ profile: null }),
}));
