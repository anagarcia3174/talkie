import {
  List,
  ListItem,
  ListItemWithMedia,
  Status,
  ListWithMeta,
  StoreResult,
} from '~/types/supabaseTypes';
import { create } from 'zustand';
import {
  getOwnedLists,
  createList,
  updateList,
  deleteList,
  getListItems,
  addListItem,
  removeListItem,
  likeList,
  unlikeList,
  updateItemStatus,
  getLikedLists,
} from '~/services/listService';

interface ListState {
  listsById: Record<number, ListWithMeta>;
  isLoadingLists: boolean;
  listsError: string | null;

  // ids for convenience / ordering
  defaultListIds: {
    library: number | null;
    favorites: number | null;
  };
  customListIds: number[];

  /* =======================
   * List items (lazy-loaded)
   * ======================= */

  listItems: Record<number, ListItemWithMedia[] | undefined>;
  listItemsState: Record<number, { isLoading: boolean; error: string | null }>;

  // list actions
  fetchLists: () => Promise<StoreResult<void>>;
  hydrateDefaultLists: () => Promise<void>;
  cacheList: (list: ListWithMeta) => void;
  createList: (newList: Partial<List>) => Promise<StoreResult<void>>;
  updateList: (listId: number, updates: Partial<List>) => Promise<StoreResult<void>>;
  deleteList: (listId: number) => Promise<StoreResult<void>>;

  likeList: (listId: number) => Promise<StoreResult<void>>;
  unlikeList: (listId: number) => Promise<StoreResult<void>>;

  // item actions
  fetchListItems: (listId: number) => Promise<StoreResult<void>>;
  addItemToList: (listId: number, mediaId: number) => Promise<StoreResult<void>>;
  deleteItemFromList: (item: ListItem) => Promise<StoreResult<void>>;
  updateItemStatus: (item: ListItemWithMedia, status: Status) => Promise<StoreResult<void>>;
  purgeUserContent: (targetUserId: string) => void;
}

export const useList = create<ListState>((set, get) => ({
  listsById: {},
  isLoadingLists: false,
  listsError: null,
  defaultListIds: {
    library: null,
    favorites: null,
  },
  customListIds: [],
  listItems: {},
  listItemsState: {},

  // ---- LIST ACTIONS ----
  fetchLists: async () => {
    set({ isLoadingLists: true, listsError: null });

    const [ownedResult, likedResult] = await Promise.all([getOwnedLists(), getLikedLists()]);

    if (!ownedResult.success) {
      set({ isLoadingLists: false, listsError: ownedResult.error });
      return { success: false, error: ownedResult.error };
    }

    const ownedLists = ownedResult.data ?? [];
    const likedLists = likedResult.success ? (likedResult.data ?? []) : [];

    const listsById: Record<number, ListWithMeta> = {};
    const customListIds: number[] = [];

    let libraryId: number | null = null;
    let favoritesId: number | null = null;

    for (const list of ownedLists) {
      listsById[list.id] = {
        ...list,
        owner: null,
        is_liked: false,
      };

      if (list.is_default) {
        if (list.list_type === 'library') {
          libraryId = list.id;
        } else if (list.list_type === 'favorites') {
          favoritesId = list.id;
        }
      } else {
        customListIds.push(list.id);
      }
    }

    for (const liked of likedLists) {
      listsById[liked.id] = liked;
    }

    set({
      listsById,
      isLoadingLists: false,
      defaultListIds: {
        library: libraryId,
        favorites: favoritesId,
      },
      customListIds,
    });

    return { success: true };
  },
  hydrateDefaultLists: async () => {
    const { defaultListIds, listItems, fetchListItems } = get();

    const libraryId = defaultListIds.library;
    const favoritesId = defaultListIds.favorites;

    if (libraryId && !listItems[libraryId]) {
      fetchListItems(libraryId);
    }

    if (favoritesId && !listItems[favoritesId]) {
      fetchListItems(favoritesId);
    }
  },
  cacheList: (list) => {
    set((state) => ({
      listsById: {
        ...state.listsById,
        [list.id]: { ...list },
      },
    }));
  },
  createList: async (newList) => {
    const result = await createList(newList);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    if (!result.data) {
      return {
        success: false,
        error: 'Failed to create list.',
      };
    }

    const createdList = result.data; // List

    set((state) => ({
      listsById: {
        ...state.listsById,
        [createdList.id]: {
          ...createdList,
          owner: null,
          is_liked: false,
        },
      },
      customListIds: [...state.customListIds, createdList.id],
    }));

    return { success: true };
  },

  updateList: async (listId, updates) => {
    const result = await updateList(listId, updates);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    const updatedList = result.data;
    set((state) => {
      const existing = state.listsById[listId];
      if (!existing) return state;

      return {
        listsById: {
          ...state.listsById,
          [listId]: {
            ...existing,
            ...(updatedList ?? updates),
          },
        },
      };
    });

    return { success: true };
  },

  deleteList: async (listId) => {
    const result = await deleteList(listId);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    set((state) => {
      const { [listId]: _, ...remainingLists } = state.listsById;
      const { [listId]: __, ...remainingItems } = state.listItems;

      return {
        // remove list metadata
        listsById: remainingLists,

        // remove cached items for this list
        listItems: remainingItems,

        // remove from custom list ordering
        customListIds: state.customListIds.filter((id) => id !== listId),
      };
    });

    return { success: true };
  },
  likeList: async (listId) => {
    const prevCount = get().listsById[listId]?.like_count ?? 0;

    set((state) => ({
      listsById: {
        ...state.listsById,
        [listId]: {
          ...state.listsById[listId],
          is_liked: true,
          like_count: prevCount + 1,
        },
      },
    }));

    const result = await likeList(listId);

    if (!result.success) {
      set((state) => ({
        listsById: {
          ...state.listsById,
          [listId]: {
            ...state.listsById[listId],
            is_liked: false,
            like_count: prevCount,
          },
        },
      }));
      return { success: false, error: result.error };
    }

    return { success: true };
  },

  unlikeList: async (listId) => {
    const prevCount = get().listsById[listId]?.like_count ?? 0;

    set((state) => ({
      listsById: {
        ...state.listsById,
        [listId]: {
          ...state.listsById[listId],
          is_liked: false,
          like_count: Math.max(prevCount - 1, 0),
        },
      },
    }));

    const result = await unlikeList(listId);

    if (!result.success) {
      set((state) => ({
        listsById: {
          ...state.listsById,
          [listId]: {
            ...state.listsById[listId],
            is_liked: true,
            like_count: prevCount,
          },
        },
      }));
      return { success: false, error: result.error };
    }

    return { success: true };
  },

  // ---- ITEM ACTIONS ----
  fetchListItems: async (listId) => {
    set((state) => ({
      listItemsState: {
        ...state.listItemsState,
        [listId]: { isLoading: true, error: null },
      },
    }));

    const result = await getListItems(listId);

    if (!result.success) {
      set((state) => ({
        listItemsState: {
          ...state.listItemsState,
          [listId]: { isLoading: false, error: result.error },
        },
      }));
      return { success: false, error: result.error };
    }

    const items = result.data ?? [];

    set((state) => ({
      listItems: {
        ...state.listItems,
        [listId]: items,
      },
      listItemsState: {
        ...state.listItemsState,
        [listId]: { isLoading: false, error: null },
      },
      listsById: {
        ...state.listsById,
        [listId]: {
          ...state.listsById[listId],
          item_count: items.length,
        },
      },
    }));

    return { success: true };
  },

  addItemToList: async (listId, mediaId) => {
    const result = await addListItem(listId, mediaId);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    set((state) => ({
      listsById: {
        ...state.listsById,
        [listId]: {
          ...state.listsById[listId],
          item_count: (state.listsById[listId]?.item_count ?? 0) + 1,
        },
      },
      listItems:
        state.listItems[listId] !== undefined
          ? { ...state.listItems, [listId]: undefined }
          : state.listItems,
    }));

    return { success: true };
  },

  deleteItemFromList: async (item) => {
    const result = await removeListItem(item.id);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }
    set((state) => {
      const existingItems = state.listItems[item.list_id];

      return {
        // update items only if they exist in cache
        listItems: existingItems
          ? {
              ...state.listItems,
              [item.list_id]: existingItems.filter((i) => i.id !== item.id),
            }
          : state.listItems,

        // always update list metadata
        listsById: {
          ...state.listsById,
          [item.list_id]: {
            ...state.listsById[item.list_id],
            item_count: Math.max((state.listsById[item.list_id]?.item_count ?? 1) - 1, 0),
          },
        },
      };
    });

    return { success: true };
  },
  purgeUserContent: (targetUserId) => {
    set((state) => {
      const removedIds = new Set(
        Object.entries(state.listsById)
          .filter(([, list]) => list.owner?.id === targetUserId)
          .map(([id]) => Number(id))
      );

      const updatedListItems = { ...state.listItems };
      for (const id of removedIds) {
        delete updatedListItems[id];
      }

      return {
        listsById: Object.fromEntries(
          Object.entries(state.listsById).filter(([, list]) => list.owner?.id !== targetUserId)
        ) as typeof state.listsById,
        listItems: updatedListItems,
      };
    });
  },
  updateItemStatus: async (item, status) => {
    const prevStatus = item.status;

    const applyToAll = (s: Status) =>
      set((state) => ({
        listItems: Object.fromEntries(
          Object.entries(state.listItems).map(([key, items]) => [
            key,
            items?.map((i) => (i.media_id === item.media_id ? { ...i, status: s } : i)),
          ])
        ) as typeof state.listItems,
      }));

    applyToAll(status);

    const result = await updateItemStatus(item.media_id, status);

    if (!result.success) {
      applyToAll(prevStatus);
      return { success: false, error: result.error };
    }

    return { success: true };
  },
}));
