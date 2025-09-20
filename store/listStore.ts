import { List, ListItem } from '~/types/supabaseTypes';
import {create } from 'zustand'
import { supabase } from '~/utils/supabase';


interface ListState {
  lists: List[];
  listItems: Record<number, ListItem[]>; // keyed by listId
  loading: boolean;
  error: string | null;

  // list actions
  getLists: (userId: string) => Promise<void>;
  createList: (userId: string, newList: Partial<List>) => Promise<void>;
  updateList: (listId: number, updates: Partial<List>) => Promise<void>;
  deleteList: (listId: number) => Promise<void>;

  likeList: (listId: number, userId: string) => Promise<void>;
  unlikeList: (listId: number, userId: string) => Promise<void>;

  // item actions
  getListItems: (listId: number) => Promise<void>;
  addItemToList: (listId: number, item: Partial<ListItem>) => Promise<void>;
  removeItemFromList: (itemId: number, listId: number) => Promise<void>;
}

export const useLists = create<ListState>((set, get) => ({
  lists: [],
  listItems: {},
  loading: false,
  error: null,

  // ---- LIST ACTIONS ----
  getLists: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      set({ lists: data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createList: async (userId, newList) => {
    try {
      const { data, error } = await supabase
        .from('lists')
        .insert([{ ...newList, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ lists: [...state.lists, data] }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateList: async (listId, updates) => {
    try {
      const { data, error } = await supabase
        .from('lists')
        .update(updates)
        .eq('id', listId)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        lists: state.lists.map((l) => (l.id === listId ? data : l)),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteList: async (listId) => {
    try {
      const { error } = await supabase.from('lists').delete().eq('id', listId);
      if (error) throw error;

      set((state) => ({
        lists: state.lists.filter((l) => l.id !== listId),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  likeList: async (listId, userId) => {
    try {
      const { error } = await supabase
        .from('list_likes')
        .insert([{ list_id: listId, user_id: userId }]);

      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  unlikeList: async (listId, userId) => {
    try {
      const { error } = await supabase
        .from('list_likes')
        .delete()
        .eq('list_id', listId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  // ---- ITEM ACTIONS ----
  getListItems: async (listId) => {
    try {
      const { data, error } = await supabase
        .from('list_items')
        .select('*')
        .eq('list_id', listId);

      if (error) throw error;
      set((state) => ({
        listItems: { ...state.listItems, [listId]: data || [] },
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addItemToList: async (listId, item) => {
    try {
      const { data, error } = await supabase
        .from('list_items')
        .insert([{ ...item, list_id: listId }])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        listItems: {
          ...state.listItems,
          [listId]: [...(state.listItems[listId] || []), data],
        },
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  

  removeItemFromList: async (itemId, listId) => {
    try {
      const { error } = await supabase
        .from('list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      set((state) => ({
        listItems: {
          ...state.listItems,
          [listId]: state.listItems[listId].filter((i) => i.id !== itemId),
        },
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));