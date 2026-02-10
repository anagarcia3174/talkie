import {
  List,
  ListItem,
  ListItemWithMedia,
  LibraryStatus,
  ListSearchResult,
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
  searchLists,
  getLikedLists,
} from '~/services/listService';

type StoreResult<T = void> = { success: true; data?: T } | { success: false; error: string };

interface ListState {
  listsById: Record<number, List>;

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

  // list actions
  getLists: (userId: string) => Promise<StoreResult<void>>;
  hydrateDefaultLists: () => Promise<void>;
  addListToState: (list: List) => void;
  createList: (userId: string, newList: Partial<List>) => Promise<StoreResult<void>>;
  updateList: (listId: number, updates: Partial<List>) => Promise<StoreResult<void>>;
  deleteList: (listId: number) => Promise<StoreResult<void>>;
  searchLists: (query: string) => Promise<StoreResult<ListSearchResult[]>>;

  likeList: (listId: number, userId: string) => Promise<StoreResult<void>>;
  unlikeList: (listId: number, userId: string) => Promise<StoreResult<void>>;

  // item actions
  getListItems: (listId: number) => Promise<StoreResult<void>>;
  addItemToList: (listId: number, mediaId: number, userId: string) => Promise<StoreResult<void>>;
  removeItemFromList: (item: ListItem) => Promise<StoreResult<void>>;
  updateItemStatus: (
    item: ListItem | ListItemWithMedia,
    status: LibraryStatus
  ) => Promise<StoreResult<void>>;
}

export const useLists = create<ListState>((set, get) => ({
  listsById: {},
  defaultListIds: {
    library: null,
    favorites: null,
  },
  customListIds: [],
  listItems: {},

  // ---- LIST ACTIONS ----
  getLists: async (userId) => {
    try {
      const [ownedResult, likedResult] = await Promise.all([
        getOwnedLists(userId),
        getLikedLists(userId),
      ]);

      if (!ownedResult.success) {
        return { success: false, error: ownedResult.error };
      }

      const ownedLists = ownedResult.data ?? [];
      const likedLists = likedResult.success ? (likedResult.data ?? []) : [];

      const listsById: Record<number, List> = {};
      const customListIds: number[] = [];

      let libraryId: number | null = null;
      let favoritesId: number | null = null;

      for (const list of ownedLists) {
        listsById[list.id] = {
          ...list,
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

      for (const list of likedLists) {
        const existing = listsById[list.id];

        listsById[list.id] = {
          ...existing,
          ...list,
        };
      }
      set({
        listsById,
        defaultListIds: {
          library: libraryId,
          favorites: favoritesId,
        },
        customListIds,
      });

      return { success: true };
    } catch (err: any) {
      console.error('getLists error:', err);

      return { success: false, error: 'An unexpected error ocurred while retrieving your lists.' };
    }
  },
  hydrateDefaultLists: async () => {
    const { defaultListIds, listItems, getListItems } = get();

    const libraryId = defaultListIds.library;
    const favoritesId = defaultListIds.favorites;

    if (libraryId && !listItems[libraryId]) {
      getListItems(libraryId);
    }

    if (favoritesId && !listItems[favoritesId]) {
      getListItems(favoritesId);
    }
  },
  addListToState: (list) => {
    set((state) => {
      const existing = state.listsById[list.id];
      return {
        listsById: {
          ...state.listsById,
          [list.id]: {
            ...list,
            is_liked: existing?.is_liked ?? false, // preserve previous liked status
          },
        },
      };
    });
  },
  createList: async (userId, newList) => {
    const result = await createList(userId, newList);

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
        [createdList.id]: createdList,
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
  searchLists: async (query) => {
    const result = await searchLists(query);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    } else {
      return { success: true, data: result.data };
    }
  },

  likeList: async (listId, userId) => {
    const result = await likeList(listId, userId);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    set((state) => ({
      ...state,
      listsById: {
        ...state.listsById,
        [listId]: {
          ...state.listsById[listId],
          is_liked: true,
          likes_count: (state.listsById[listId]?.likes_count ?? 0) + 1,
        },
      },
    }));
    return { success: true };
  },

  unlikeList: async (listId, userId) => {
    const result = await unlikeList(listId, userId);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }
    set((state) => ({
      ...state,
      listsById: {
        ...state.listsById,
        [listId]: {
          ...state.listsById[listId],
          is_liked: false,
          likes_count: Math.max((state.listsById[listId]?.likes_count ?? 1) - 1, 0),
        },
      },
    }));
    return { success: true };
  },

  // ---- ITEM ACTIONS ----
  getListItems: async (listId) => {
    const result = await getListItems(listId);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    const items = result.data ?? [];

    set((state) => ({
      listItems: {
        ...state.listItems,
        [listId]: items,
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

  addItemToList: async (listId, mediaId, userId) => {
    const result = await addListItem(listId, mediaId, userId);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }
    const { listItems } = get();

    if (listItems[listId]) {
      await get().getListItems(listId);
    } else {
      set((state) => ({
        listsById: {
          ...state.listsById,
          [listId]: {
            ...state.listsById[listId],
            item_count: (state.listsById[listId]?.item_count ?? 0) + 1,
          },
        },
      }));
    }

    return { success: true };
  },

  removeItemFromList: async (item) => {
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
  updateItemStatus: async (item, status) => {
    const result = await updateItemStatus(item.user_id, item.media_id, status);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }
    set((state) => {
      const updatedListItems: typeof state.listItems = {};

      for (const [listId, items] of Object.entries(state.listItems)) {
        if (!items) continue;

        updatedListItems[Number(listId)] = items.map((i) =>
          i.media_id === item.media_id
            ? {
                ...i,
                status,
              }
            : i
        );
      }

      return {
        listItems: {
          ...state.listItems,
          ...updatedListItems,
        },
      };
    });

    return { success: true };
  },
}));
