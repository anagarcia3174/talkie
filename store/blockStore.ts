import { create } from 'zustand';
import { blockUser, getBlockedIds, getBlockedUsers, unblockUser } from '~/services/blockService';
import { Profile, StoreResult } from '~/types/supabaseTypes';

interface BlockState {
  // relationship cache
  blockedIds: Set<string>;
  isLoadingBlockedIds: boolean;
  blockedIdsError: string | null;
  fetchBlockedIds: () => Promise<StoreResult<void>>;

  // users I blocked
  blockedUsers: Profile[];
  isLoadingBlockedUsers: boolean;
  blockedUsersError: string | null;

  // actions
  block: (targetUserId: string, targetProfile: Profile) => Promise<StoreResult<void>>;
  unblock: (targetUserId: string) => Promise<StoreResult<void>>;

  fetchBlockedUsers: () => Promise<StoreResult<void>>;

  clearBlockData: () => void;
}

export const useBlock = create<BlockState>((set, get) => ({
  blockedIds: new Set<string>(),
  isLoadingBlockedIds: false,
  blockedIdsError: null,
  blockedUsers: [],
  isLoadingBlockedUsers: false,
  blockedUsersError: null,
  fetchBlockedIds: async () => {
    if (get().isLoadingBlockedIds) return { success: true };
    set({ isLoadingBlockedIds: true, blockedIdsError: null });

    const result = await getBlockedIds();

    set({ isLoadingBlockedIds: false });

    if (!result.success) {
      set({ blockedIdsError: result.error });
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
    if (get().isLoadingBlockedUsers) return { success: true };
    set({ isLoadingBlockedUsers: true, blockedUsersError: null });

    const result = await getBlockedUsers();

    set({ isLoadingBlockedUsers: false });

    if (!result.success) {
      set({ blockedUsersError: result.error });
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
      isLoadingBlockedIds: false,
      blockedIdsError: null,
      blockedUsers: [],
      isLoadingBlockedUsers: false,
      blockedUsersError: null,
    });
  },
}));
