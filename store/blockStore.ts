import { create } from 'zustand';
import { blockUser, getBlockedIds, getBlockedUsers, unblockUser } from '~/services/blockService';
import { Profile, StoreResult } from '~/types/supabaseTypes';

interface BlockState {
  // relationship cache
  blockedIds: Set<string>;
  fetchBlockedIds: () => Promise<StoreResult<void>>;

  // users I blocked
  blockedUsers: Profile[];

  // actions
  block: (targetUserId: string, targetProfile: Profile) => Promise<StoreResult<void>>;
  unblock: (targetUserId: string) => Promise<StoreResult<void>>;

  fetchBlockedUsers: () => Promise<StoreResult<void>>;

  clearBlockData: () => void;
}

export const useBlock = create<BlockState>((set, get) => ({
  blockedIds: new Set<string>(),
  blockedUsers: [],
  fetchBlockedIds: async () => {
    const result = await getBlockedIds();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set({ blockedIds: new Set(result.data ?? []) });

    return { success: true };
  },
  block: async (targetUserId, targetProfile) => {
    const result = await blockUser(targetUserId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set((state) => {
      const updated = new Set(state.blockedIds);
      updated.add(targetUserId);

      return { blockedIds: updated, blockedUsers: [...state.blockedUsers, targetProfile] };
    });

    return { success: true };
  },

  unblock: async (targetUserId) => {
    const result = await unblockUser(targetUserId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    set((state) => {
      const updated = new Set(state.blockedIds);
      updated.delete(targetUserId);

      return {
        blockedIds: updated,
        blockedUsers: state.blockedUsers.filter((b) => b.id !== targetUserId),
      };
    });

    return { success: true };
  },

  fetchBlockedUsers: async () => {
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
