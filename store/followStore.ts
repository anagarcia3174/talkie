import { create } from 'zustand';
import {
  followUser,
  getFollowerIds,
  getFollowers,
  getFollowing,
  getFollowingIds,
  unfollowUser,
} from '~/services/followService';
import { Profile, StoreResult } from '~/types/supabaseTypes';

interface FollowState {
  // relationship cache (keyed by target user id)
  followingIds: Set<string>;
  followerIds: Set<string>;
  isLoadingFollowingIds: boolean;
  isLoadingFollowerIds: boolean;
  // lists
  followers: Profile[];
  following: Profile[];
  isLoadingFollowers: boolean;
  isLoadingFollowing: boolean;

  fetchFollowingIds: () => Promise<StoreResult<void>>;
  fetchFollowerIds: () => Promise<StoreResult<void>>;

  follow: (targetUserId: string, targetProfile: Profile) => Promise<StoreResult<void>>;
  unfollow: (targetUserId: string) => Promise<StoreResult<void>>;

  fetchFollowers: () => Promise<StoreResult<void>>;
  fetchFollowing: () => Promise<StoreResult<void>>;

  purgeUserContent: (targetUserId: string) => { wasFollowing: boolean; wasFollower: boolean };
  clearFollowData: () => void;
}

export const useFollow = create<FollowState>((set, get) => ({
  followingIds: new Set<string>(),
  followerIds: new Set<string>(),
  isLoadingFollowingIds: false,
  isLoadingFollowerIds: false,
  followers: [],
  following: [],
  isLoadingFollowers: false,
  isLoadingFollowing: false,
  fetchFollowingIds: async () => {
    if (get().isLoadingFollowingIds) return { success: true };
    set({ isLoadingFollowingIds: true });

    const result = await getFollowingIds();

    set({ isLoadingFollowingIds: false });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set({ followingIds: new Set(result.data ?? []) });

    return { success: true };
  },
  fetchFollowerIds: async () => {
    if (get().isLoadingFollowerIds) return { success: true };
    set({ isLoadingFollowerIds: true });

    const result = await getFollowerIds();

    set({ isLoadingFollowerIds: false });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set({ followerIds: new Set(result.data ?? []) });

    return { success: true };
  },

  follow: async (targetUserId, targetProfile) => {
    const result = await followUser(targetUserId);

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

  unfollow: async (targetUserId) => {
    const result = await unfollowUser(targetUserId);

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

  fetchFollowers: async () => {
    if (get().isLoadingFollowers) return { success: true };
    set({ isLoadingFollowers: true });

    const result = await getFollowers();

    set({ isLoadingFollowers: false });

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

  fetchFollowing: async () => {
    if (get().isLoadingFollowing) return { success: true };
    set({ isLoadingFollowing: true });

    const result = await getFollowing();

    set({ isLoadingFollowing: false });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const followingProfiles = result.data ?? [];

    set({
      following: followingProfiles,
      followingIds: new Set(followingProfiles.map((p) => p.id)),
    });

    return { success: true };
  },

  purgeUserContent: (targetUserId) => {
    const { followingIds, followerIds } = get();
    const wasFollowing = followingIds.has(targetUserId);
    const wasFollower = followerIds.has(targetUserId);

    set((state) => {
      const updatedFollowingIds = new Set(state.followingIds);
      updatedFollowingIds.delete(targetUserId);
      const updatedFollowerIds = new Set(state.followerIds);
      updatedFollowerIds.delete(targetUserId);

      return {
        followingIds: updatedFollowingIds,
        followerIds: updatedFollowerIds,
        following: state.following.filter((p) => p.id !== targetUserId),
        followers: state.followers.filter((p) => p.id !== targetUserId),
      };
    });

    return { wasFollowing, wasFollower };
  },
  clearFollowData: () => {
    set({
      followingIds: new Set(),
      followerIds: new Set(),
      isLoadingFollowingIds: false,
      isLoadingFollowerIds: false,
      followers: [],
      following: [],
      isLoadingFollowers: false,
      isLoadingFollowing: false,
    });
  },
}));
