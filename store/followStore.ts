import { create } from 'zustand';
import {
  followUser,
  getFollowerIds,
  getFollowers,
  getFollowing,
  getFollowingIds,
  unFollowUser,
} from '~/services/followService';
import { Profile, StoreResult } from '~/types/supabaseTypes';


interface FollowState {
  // relationship cache (keyed by target user id)
  followingIds: Set<string>;
  followerIds: Set<string>;
  // lists
  followers: Profile[];
  following: Profile[];

  hydrateFollowingIds: (userId: string) => Promise<StoreResult<void>>;
  hydrateFollowerIds: (userId: string) => Promise<StoreResult<void>>;

  follow: (currentUserId: string, targetUserId: string, targetProfile: Profile) => Promise<StoreResult<void>>;
  unfollow: (currentUserId: string, targetUserId: string) => Promise<StoreResult<void>>;

  getFollowers: (userId: string) => Promise<StoreResult<void>>;
  getFollowing: (userId: string) => Promise<StoreResult<void>>;

  clearFollowData: () => void;
}

export const useFollow = create<FollowState>((set, get) => ({
  followingIds: new Set<string>(),
  followerIds: new Set<string>(),
  followers: [],
  following: [],
  hydrateFollowingIds: async (userId) => {
    const result = await getFollowingIds(userId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set({ followingIds: new Set(result.data ?? []) });

    return { success: true };
  },
  hydrateFollowerIds: async (userId) => {
    const result = await getFollowerIds(userId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set({ followerIds: new Set(result.data ?? []) });

    return { success: true };
  },

  follow: async (currentUserId, targetUserId, targetProfile) => {
    const result = await followUser(currentUserId, targetUserId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set((state) => {
      const updatedIds = new Set(state.followingIds);
      updatedIds.add(targetUserId);

      return {
        followingIds: updatedIds,
        following: [...state.following, targetProfile],
      };
    });

    return { success: true };
  },

  unfollow: async (currentUserId, targetUserId) => {
    const result = await unFollowUser(currentUserId, targetUserId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set((state) => {
      const updatedIds = new Set(state.followingIds);
      updatedIds.delete(targetUserId);

      return {
        followingIds: updatedIds,
        following: state.following.filter((p) => p.id !== targetUserId),
      };
    });

    return { success: true };
  },

  getFollowers: async (userId) => {
    const result = await getFollowers(userId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const followerProfiles = result.data ?? [];

    set({
      followers: followerProfiles,
      followerIds: new Set(followerProfiles.map((p) => p.id)),
    });

    return { success: true };
  },

  getFollowing: async (userId) => {
    const result = await getFollowing(userId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const followingProfiles = result.data ?? [];

    // hydrate following list
    set({
      following: followingProfiles,
      followingIds: new Set(followingProfiles.map((p) => p.id)),
    });

    return { success: true };
  },

  clearFollowData: () => {
    set({
      followingIds: new Set(),
      followerIds: new Set(),
      followers: [],
      following: [],
    });
  },
}));
