import { List, ListItem, ListWithItems, ListItemWithMedia } from '~/types/supabaseTypes';
import { create } from 'zustand';
import {
  getAllLists,
  createList,
  updateList,
  deleteList,
  getListItems,
  addListItem,
  removeListItem,
  likeList,
  unlikeList,
} from '~/services/listService';

type StoreResult<T = void> = { success: true } | { success: false; error: string };

interface ListState {
  defaultLists: {
    library: ListWithItems<ListItemWithMedia> | null;
    favorites: ListWithItems<ListItemWithMedia> | null;
  };
  customLists: List[];
  listItems: Record<number, ListItem[] | ListItemWithMedia[]>;
  loading: boolean;

  // list actions
  getLists: (userId: string) => Promise<StoreResult<void>>;
  createList: (userId: string, newList: Partial<List>) => Promise<StoreResult<void>>;
  updateList: (listId: number, updates: Partial<List>) => Promise<StoreResult<void>>;
  deleteList: (listId: number) => Promise<StoreResult<void>>;

  likeList: (listId: number, userId: string) => Promise<StoreResult<void>>;
  unlikeList: (listId: number, userId: string) => Promise<StoreResult<void>>;

  // item actions
  getListItems: (listId: number) => Promise<StoreResult<void>>;
  addItemToList: (listId: number, mediaId: number, userId: string) => Promise<StoreResult<void>>;
  removeItemFromList: (item: ListItem) => Promise<StoreResult<void>>;
}

export const useLists = create<ListState>((set, get) => ({
  defaultLists: {
    library: null,
    favorites: null,
  },
  customLists: [],
  listItems: {},
  loading: false,

  // ---- LIST ACTIONS ----
  getLists: async (userId) => {
    set({ loading: true });
    try {
      const result = await getAllLists(userId);
      if (!result.success) {
        set({ loading: false });
        return { success: false, error: result.error };
      }

      const lists = result.data || [];
      const library = lists.find((l) => l.is_default && l.list_type === 'library');
      const favorites = lists.find((l) => l.is_default && l.list_type === 'favorites');
      const custom = lists.filter((l) => !l.is_default);

      let libraryWithItems: ListWithItems<ListItemWithMedia> | null = null;
      let favoritesWithItems: ListWithItems<ListItemWithMedia> | null = null;

      if (library) {
        const itemsResult = await getListItems(library.id);
        if (itemsResult.success) {
          const items = itemsResult.data || [];
          libraryWithItems = { ...library, items };
        }
      }

      if (favorites) {
        const itemsResult = await getListItems(favorites.id);
        if (itemsResult.success) {
          const items = itemsResult.data || [];
          favoritesWithItems = { ...favorites, items };
        }
      }

      set({
        defaultLists: {
          library: libraryWithItems,
          favorites: favoritesWithItems,
        },
        customLists: custom,
        loading: false,
      });
      return { success: true };
    } catch (err: any) {
      console.error('getLists error:', err);
      set({ loading: false });
      return { success: false, error: 'An unexpected error ocurred while retrieving your lists.' };
    }
  },

  createList: async (userId, newList) => {
    set({ loading: true });
    const result = await createList(userId, newList);
    if (!result.success) {
      set({ loading: false });
      return {
        success: false,
        error: result.error,
      };
    }

    // Refresh lists after creation
    await get().getLists(userId);
    return { success: true };
  },

  updateList: async (listId, updates) => {
    set({ loading: true });
    const result = await updateList(listId, updates);
    if (!result.success) {
      set({ loading: false });
      return {
        success: false,
        error: result.error,
      };
    }
    // Refresh locally
    set((state) => {
      const updatedDefaultLists = { ...state.defaultLists };

      // Update library if it matches
      if (updatedDefaultLists.library && updatedDefaultLists.library.id === listId) {
        updatedDefaultLists.library = { ...updatedDefaultLists.library, ...updates };
      }

      // Update favorites if it matches
      if (updatedDefaultLists.favorites && updatedDefaultLists.favorites.id === listId) {
        updatedDefaultLists.favorites = { ...updatedDefaultLists.favorites, ...updates };
      }

      // Update custom lists
      const updatedCustomLists = state.customLists.map((l) =>
        l.id === listId ? { ...l, ...updates } : l
      );

      return {
        defaultLists: updatedDefaultLists,
        customLists: updatedCustomLists,
        loading: false,
      };
    });
    return { success: true };
  },

  deleteList: async (listId) => {
    set({ loading: true });
    const result = await deleteList(listId);
    if (!result.success) {
      set({ loading: false });
      return {
        success: false,
        error: result.error,
      };
    }
    set((state) => ({
      customLists: state.customLists.filter((l) => l.id !== listId),
    }));
    return { success: true };
  },

  likeList: async (listId, userId) => {
    set({ loading: true });
    const result = await likeList(listId, userId);
    if (!result.success) {
      set({ loading: false });
      return {
        success: false,
        error: result.error,
      };
    }
    return { success: true };
  },

  unlikeList: async (listId, userId) => {
    set({ loading: true });
    const result = await unlikeList(listId, userId);
    if (!result.success) {
      set({ loading: false });
      return {
        success: false,
        error: result.error,
      };
    }
    return { success: true };
  },

  // ---- ITEM ACTIONS ----
  getListItems: async (listId) => {
    set({ loading: true });
    const result = await getListItems(listId);
    if (!result.success) {
      set({ loading: false });
      return {
        success: false,
        error: result.error,
      };
    }
    const items = result.data || [];
    set((state) => ({
      listItems: { ...state.listItems, [listId]: items },
    }));
    return { success: true };
  },

  addItemToList: async (listId, mediaId, userId) => {
    set({ loading: true });
    const result = await addListItem(listId, mediaId, userId);
    if (!result.success) {
      set({ loading: false });
      return {
        success: false,
        error: result.error,
      };
    }
    // Refresh list items
    await get().getListItems(listId);
    return { success: true };
  },

  removeItemFromList: async (item) => {
    set({ loading: true });
    const result = await removeListItem(item.id);
    if (!result.success) {
      set({ loading: false });
      return {
        success: false,
        error: result.error,
      };
    }
    set((state) => ({
      listItems: {
        ...state.listItems,
        [item.list_id]: state.listItems[item.list_id]?.filter((i) => i.id !== item.id) || [],
      },
    }));
    return { success: true };
  },
}));
