import { Profile, ProfileStats, VoidResult } from '~/types/supabaseTypes';
import { create } from 'zustand';
import { getErrorMessage } from '~/utils/errorHandler';
import { ImagePickerAsset } from 'expo-image-picker';
import { withPublicUrl } from '~/utils/storageUrl';
import {
  getProfileById,
  getProfileStats,
  softDeleteAccount,
  updateProfile,
  uploadAvatar as uploadAvatarService,
} from '~/services/profileService';

type StoreResult<T = void> = { success: true; data?: T } | { success: false; error: string };

interface ProfileState {
  profile: Profile | null;
  stats: ProfileStats;
  loading: boolean;

  getProfile: (userId: string) => Promise<StoreResult<void>>;
  getStats: (userId: string) => Promise<StoreResult<void>>;
  uploadAvatar: (userId: string, fileUri: ImagePickerAsset) => Promise<StoreResult<void>>;
  updateProfile: (userId: string, updates: Partial<Profile>) => Promise<StoreResult<void>>;
  clearProfile: () => void;
  deleteAccount: () => Promise<StoreResult<void>>;
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

    if (result.data.is_deleted) {
      set({ profile: null, loading: false });
      return { success: false, error: 'ACCOUNT_DELETED' };
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
      return { success: false, error: 'There was an error uploading your profile picture.' };
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
  deleteAccount: async () => {
    set({ loading: true });

    const result = await softDeleteAccount();

    if (!result.success) {
      set({ loading: false });
      return { success: false, error: result.error };
    }

    // Clear local state immediately
    set({
      profile: null,
      stats: {
        followers: 0,
        following: 0,
        comments: 0,
        totalLogged: 0,
        lists: 0,
      },
      loading: false,
    });

    return { success: true };
  },
}));
