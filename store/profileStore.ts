import {
  DEFAULT_PROFILE_STATS,
  ListWithMeta,
  Profile,
  ProfileStats,
  StoreResult,
} from '~/types/supabaseTypes';
import { create } from 'zustand';
import { ImagePickerAsset } from 'expo-image-picker';
import { getPublicUrl, withPublicUrl } from '~/utils/storageUrl';
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
  hasFetched: boolean;
  error: string | null;
}

interface ProfileState {
  profile: Profile | null;
  stats: ProfileStats;
  loading: boolean;

  otherProfiles: Record<string, OtherProfilesState>;
  fetchOtherProfile: (targetUserId: string) => Promise<StoreResult<void>>;

  fetchProfile: () => Promise<StoreResult<void>>;
  fetchStats: () => Promise<StoreResult<void>>;
  adjustProfileStats: (deltas: Partial<Record<keyof ProfileStats, number>>) => void;
  uploadAvatar: (fileUri: ImagePickerAsset) => Promise<StoreResult<void>>;
  updateProfile: (updates: Partial<Profile>) => Promise<StoreResult<void>>;
  purgeUserContent: (targetUserId: string) => void;
  clearProfile: () => void;
  deleteAccount: () => Promise<StoreResult<void>>;
}

const MAX_MB = 6;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const addCacheBuster = (profile: Profile): Profile => {
  if (!profile.avatar_url) return profile;

  const timestamp = Date.now();

  // Remove any existing `t` cache param first
  const url = new URL(profile.avatar_url);

  url.searchParams.set('t', timestamp.toString());

  return {
    ...profile,
    avatar_url: url.toString(),
  };
};

export const useProfile = create<ProfileState>((set, get) => ({
  profile: null,
  stats: DEFAULT_PROFILE_STATS,
  loading: false,

  otherProfiles: {},
  fetchOtherProfile: async (targetUserId) => {
    const cached = get().otherProfiles[targetUserId];

    if (cached?.hasFetched || cached?.loading) {
      return { success: true };
    }

    set((state) => ({
      otherProfiles: {
        ...state.otherProfiles,
        [targetUserId]: {
          profile: cached?.profile ?? null,
          stats: cached?.stats ?? null,
          lists: cached?.lists ?? [],
          loading: true,
          hasFetched: false,
          error: null,
        },
      },
    }));
    const [profileResult, statsResult, listsResult] = await Promise.all([
      getProfileById(targetUserId),
      getProfileStats(targetUserId),
      getPublicListsByUserId(targetUserId),
    ]);

    if (!profileResult.success) {
      set((state) => ({
        otherProfiles: {
          ...state.otherProfiles,
          [targetUserId]: {
            profile: cached?.profile ?? null,
            stats: cached?.stats ?? null,
            lists: cached?.lists ?? [],
            loading: false,
            hasFetched: false,
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
        [targetUserId]: {
          profile,
          stats,
          lists,
          loading: false,
          hasFetched: true,
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
  fetchProfile: async () => {
    set({ loading: true });
    const result = await getProfileById();

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

  fetchStats: async () => {
    const result = await getProfileStats();

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
      reviews: 0,
    };

    set({ stats });
    return { success: true };
  },
  adjustProfileStats: (deltas) =>
    set((state) => ({
      stats: state.stats
        ? {
            ...state.stats,
            comments: Math.max(0, state.stats.comments + (deltas.comments ?? 0)),
            reviews: Math.max(0, state.stats.reviews + (deltas.reviews ?? 0)),
            lists: Math.max(0, state.stats.lists + (deltas.lists ?? 0)),
            followers: Math.max(0, state.stats.followers + (deltas.followers ?? 0)),
            following: Math.max(0, state.stats.following + (deltas.following ?? 0)),
            totalLogged: Math.max(0, state.stats.totalLogged + (deltas.comments ?? 0)),
          }
        : state.stats,
    })),

  uploadAvatar: async (image) => {
    try {
      const arrayBuffer = await fetch(image.uri).then((res) => res.arrayBuffer());
      if (arrayBuffer.byteLength > MAX_BYTES)
        return { success: false, error: `Image too large. Max size is ${MAX_MB} MB.` };
        
      const result = await uploadAvatarService(arrayBuffer, image.mimeType ?? 'image/jpeg');
      if (!result.success) return { success: false, error: result.error }; 
      
      const currentProfile = get().profile;
      if (currentProfile) {
        const avatarUrl = getPublicUrl(`/object/public/avatars/${result.data}`);
        set({ profile: addCacheBuster({ ...currentProfile, avatar_url: avatarUrl }) });
      } 
      return { success: true };
    } catch {
      return { success: false, error: 'There was an error uploading your profile picture.' };
    } 
  },

  // ─── Update profile ─────────────────────────────────────────────────
  updateProfile: async (updates) => {
    const result = await updateProfile(updates);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const normalized = withPublicUrl(result.data!);
    const withCacheBuster = addCacheBuster(normalized);
    set({ profile: withCacheBuster });
    return { success: true };
  },

  purgeUserContent: (targetUserId) => {
    set((state) => {
      const { [targetUserId]: _, ...remaining } = state.otherProfiles;
      return { otherProfiles: remaining };
    });
  },
  clearProfile: () => set({ profile: null, stats: DEFAULT_PROFILE_STATS, otherProfiles: {} }),
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
