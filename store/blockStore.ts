import { create } from 'zustand';
import { blockUser, getBlockedIds, getBlockedUsers, unBlockUser } from '~/services/blockService';
import { Profile } from '~/types/supabaseTypes';
import { useLists } from './listStore';
import { useProfile } from './profileStore';

type StoreResult<T = void> = { success: true; data?: T } | { success: false; error: string };

interface BlockState {
  // relationship cache
  blockedIds: Set<string>;
  hydrateBlockedIds: (userId: string) => Promise<StoreResult<void>>;

  // users I blocked
  blockedUsers: Profile[];

  // actions
  block: (currentUserId: string, targetUserId: string) => Promise<StoreResult<void>>;
  unblock: (currentUserId: string, targetUserId: string) => Promise<StoreResult<void>>;

  getBlockedUsers: () => Promise<StoreResult<void>>;

  clearBlockData: () => void;
}

export const useBlock = create<BlockState>((set, get) => ({
  blockedIds: new Set<string>(),
  blockedUsers: [],
  hydrateBlockedIds: async (userId) => {
    const result = await getBlockedIds(userId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set({ blockedIds: new Set(result.data ?? []) });

    return { success: true };
  },
  block: async (currentUserId, targetUserId) => {
    const result = await blockUser(currentUserId, targetUserId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set((state) => {
      const updated = new Set(state.blockedIds);
      updated.add(targetUserId);

      return { blockedIds: updated };
    });
    await useProfile.getState().getStats(currentUserId);
    await useLists.getState().getLists(currentUserId);

    return { success: true };
  },

  unblock: async (currentUserId, targetUserId) => {
    const result = await unBlockUser(currentUserId, targetUserId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set((state) => {
      const updated = new Set(state.blockedIds)
      updated.delete(targetUserId);

      return {
        blockedIds: updated,
      };
    });

    await useLists.getState().getLists(currentUserId);

    return { success: true };
  },

  getBlockedUsers: async () => {
    const result = await getBlockedUsers();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const blockedProfiles = result.data ?? [];

    set({
      blockedUsers: blockedProfiles,
      blockedIds: new Set(blockedProfiles.map((p) => p.id)),
    });

    return { success: true };
  },

  clearBlockData: () => {
    set({
      blockedIds: new Set(),
      blockedUsers: [],
    });
  },
}));
