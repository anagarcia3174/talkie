import { Profile, ProfileStats, VoidResult } from '~/types/supabaseTypes';
import { create } from 'zustand';
import { getErrorMessage } from '~/utils/errorHandler';
import { ImagePickerAsset } from 'expo-image-picker';
import { withPublicUrl } from '~/utils/storageUrl';
import {
  getProfileById,
  getProfileStats,
  updateProfile,
  uploadAvatar as uploadAvatarService,
} from '~/services/profileService';
interface ProfileState {
  profile: Profile | null;
  stats: ProfileStats;
  loading: boolean;

  getProfile: (userId: string) => Promise<VoidResult>;
  getStats: (userId: string) => Promise<VoidResult>;
  uploadAvatar: (userId: string, fileUri: ImagePickerAsset) => Promise<VoidResult>;
  updateProfile: (userId: string, updates: Partial<Profile>) => Promise<VoidResult>;
  clearProfile: () => void;
}

const MAX_MB = 6;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export const useProfile = create<ProfileState>((set, get) => ({
  profile: null,
  stats: {
    followers: 0,
    following: 0,
    comments: 0,
    totalLogged: 0,
    lists: 0,
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

    set({ profile: result.data, loading: false });
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
      comments: data.comments,
      lists: data.lists,
      totalLogged: data.totalLogged,
    };

    set({ stats });
    return { success: true };
  },

  uploadAvatar: async (userId, image) => {
    try {
      const arrayBuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

      if (arrayBuffer.byteLength > MAX_BYTES) {
        return {
          success: false,
          error: `Image too large. Max size is ${MAX_MB} MB.`,
        };
      }

      const filePath = `${userId}/avatar.jpg`;
      const mimeType = image.mimeType ?? 'image/jpeg';

      const result = await uploadAvatarService(filePath, arrayBuffer, mimeType);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Refresh the profile after upload
      await get().getProfile(userId);
      return { success: true };
    } catch (err: any) {
      const message = getErrorMessage(err, 'upload_image');
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
