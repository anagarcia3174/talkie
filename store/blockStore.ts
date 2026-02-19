import { create } from 'zustand';
import { blockUser, getBlockedIds, getBlockedUsers, unBlockUser } from '~/services/blockService';
import { Profile } from '~/types/supabaseTypes';

type StoreResult<T = void> = { success: true; data?: T } | { success: false; error: string };

interface BlockState {
  // relationship cache
  blockedMap: Record<string, boolean>;
  hydrateBlockedMap: (userId: string) => Promise<StoreResult<void>>;

  // users I blocked
  blockedUsers: Profile[];

  // actions
  block: (currentUserId: string, targetUserId: string) => Promise<StoreResult<void>>;
  unblock: (currentUserId: string, targetUserId: string) => Promise<StoreResult<void>>;

  getBlockedUsers: (currentUserId: string) => Promise<StoreResult<void>>;

  clearBlockData: () => void;
}

export const useBlock = create<BlockState>((set, get) => ({
  blockedMap: {},
  blockedUsers: [],
  hydrateBlockedMap: async (userId) => {
    const result = await getBlockedIds(userId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const map = (result.data ?? []).reduce<Record<string, boolean>>((acc, id) => {
      acc[id] = true;
      return acc;
    }, {});

    set({ blockedMap: map });

    return { success: true };
  },
  block: async (currentUserId, targetUserId) => {
    const result = await blockUser(currentUserId, targetUserId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set((state) => ({
      blockedMap: {
        ...state.blockedMap,
        [targetUserId]: true,
      },
    }));

    return { success: true };
  },

  unblock: async (currentUserId, targetUserId) => {
    const result = await unBlockUser(currentUserId, targetUserId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set((state) => {
      const updatedMap = { ...state.blockedMap };
      delete updatedMap[targetUserId];

      return {
        blockedMap: updatedMap,
      };
    });

    return { success: true };
  },

  getBlockedUsers: async (currentUserId) => {
    const result = await getBlockedUsers(currentUserId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const blockedProfiles = result.data ?? [];

    set({
      blockedUsers: blockedProfiles,
      blockedMap: blockedProfiles.reduce<Record<string, boolean>>((acc, profile) => {
        acc[profile.id] = true;
        return acc;
      }, {}),
    });

    return { success: true };
  },

  clearBlockData: () => {
    set({
      blockedMap: {},
      blockedUsers: [],
    });
  },
}));
