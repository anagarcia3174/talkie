import { DEFAULT_PROFILE_STATS, ListWithMeta, Profile, ProfileStats, StoreResult } from '~/types/supabaseTypes';
import { create } from 'zustand';
import { ImagePickerAsset } from 'expo-image-picker';
import { withPublicUrl } from '~/utils/storageUrl';
import {
  getProfileById,
  getProfileStats,
  softDeleteAccount,
  updateProfile,
  uploadAvatar as uploadAvatarService,
} from '~/services/profileService';
import { getPublicListsByUserId } from '~/services/listService';

interface OtherProfilesState {
  profile: Profile | null;
  stats: ProfileStats | null;
  lists: ListWithMeta[];
  loading: boolean;
  error: string | null;
}

interface ProfileState {
  profile: Profile | null;
  stats: ProfileStats;
  loading: boolean;

  otherProfiles: Record<string, OtherProfilesState>;
  getOthersProfile: (userId: string) => Promise<StoreResult<void>>;

  getProfile: (userId: string) => Promise<StoreResult<void>>;
  getStats: (userId: string) => Promise<StoreResult<void>>;
  uploadAvatar: (userId: string, fileUri: ImagePickerAsset) => Promise<StoreResult<void>>;
  updateProfile: (userId: string, updates: Partial<Profile>) => Promise<StoreResult<void>>;
  clearProfile: () => void;
  deleteAccount: () => Promise<StoreResult<void>>;
}

const MAX_MB = 6;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const addCacheBuster = (profile: Profile): Profile => {
  if (profile.avatar_url) {
    const timestamp = Date.now();
    const separator = profile.avatar_url.includes('?') ? '&' : '?';
    return {
      ...profile,
      avatar_url: `${profile.avatar_url}${separator}t=${timestamp}`,
    };
  }
  return profile;
};

export const useProfile = create<ProfileState>((set, get) => ({
  profile: null,
  stats: DEFAULT_PROFILE_STATS,
  loading: false,

  otherProfiles: {},
  getOthersProfile: async (userId) => {
    const cached = get().otherProfiles[userId];

    if (cached && !cached.loading && !cached.error) {
      return { success: true };
    }

    if (cached?.loading) {
      return { success: true };
    }

    set((state) => ({
      otherProfiles: {
        ...state.otherProfiles,
        [userId]: {
          profile: cached?.profile ?? null,
          stats: cached?.stats ?? null,
          lists: cached?.lists ?? [],
          loading: true,
          error: null,
        },
      },
    }));
    const [profileResult, statsResult, listsResult] = await Promise.all([
      getProfileById(userId),
      getProfileStats(userId),
      getPublicListsByUserId(userId),
    ]);

    if (!profileResult.success) {
      set((state) => ({
        otherProfiles: {
          ...state.otherProfiles,
          [userId]: {
            profile: cached?.profile ?? null,
            stats: cached?.stats ?? null,
            lists: cached?.lists ?? [],
            loading: false,
            error: profileResult.error,
          },
        },
      }));
      return { success: false, error: profileResult.error };
    }

    const profile = profileResult.data;

    const stats = statsResult.success ? statsResult.data : (cached?.stats ?? null);

    const lists = listsResult.success ? (listsResult.data ?? []) : (cached?.lists ?? []);

    set((state) => ({
      otherProfiles: {
        ...state.otherProfiles,
        [userId]: {
          profile,
          stats,
          lists,
          loading: false,
          error: !statsResult.success
            ? statsResult.error
            : !listsResult.success
              ? listsResult.error
              : null,
        },
      },
    }));

    return { success: true };
  },
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

    const data = result.data;
    const stats: ProfileStats = {
      followers: data.followers,
      following: data.following,
      comments: data.comments,
      lists: data.lists,
      totalLogged: data.totalLogged,
      reviews: 0
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
      const profileResult = await get().getProfile(userId);

      if (profileResult.success && get().profile) {
        // Add cache-busting timestamp to force image reload
        set({ profile: addCacheBuster(get().profile!) });
      }
      return { success: true };
    } catch {
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
    const withCacheBuster = addCacheBuster(normalized);
    set({ profile: withCacheBuster });
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
      stats: DEFAULT_PROFILE_STATS,
      loading: false,
    });

    return { success: true };
  },
}));
