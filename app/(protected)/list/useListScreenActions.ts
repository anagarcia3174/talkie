import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuth } from '~/context/AuthContext';
import { useLists } from '~/store/listStore';
import { useProfile } from '~/store/profileStore';
import { Status, List, ListItem, ListItemWithMedia } from '~/types/supabaseTypes';
import { haptics } from '~/utils/haptics';

export default function useListScreenActions(listId: number) {
  const { updateItemStatus, deleteItemFromList, updateList, deleteList, likeList, unlikeList } =
    useLists();
  const { adjustProfileStats } = useProfile();
  const { user } = useAuth();
  const userId = user?.id;

  const router = useRouter();

  const withToast = async (
    action: () => Promise<{ success: boolean; error?: string }>,
    successMsg: string,
    errorMsg: string
  ) => {
    const result = await action();

    if (result.success) haptics.success();
    else haptics.error();

    Toast.show({
      type: result.success ? 'success' : 'error',
      text1: result.success ? successMsg : result.error || errorMsg,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
    });

    return result.success;
  };

  return {
    updateItemStatus: async (item: ListItemWithMedia, status: Status) => {
      if (!userId) return;

      withToast(
        () => updateItemStatus(item, status),
        "The item's status was updated!",
        "Failed to change the item's status."
      );
    },

    deleteItem: (item: ListItem) =>
      withToast(
        () => deleteItemFromList(item),
        'The item was removed!',
        'Failed to remove the item.'
      ),

    updateList: (updates: Partial<List>) =>
      withToast(
        () => updateList(listId, updates),
        'The list was updated!',
        'Failed to update the list.'
      ),

    deleteList: async () => {
      if (!userId) return;

      const success = await withToast(
        () => deleteList(listId),
        'The list was deleted!',
        'Failed to delete the list.'
      );

      if (success) {
        adjustProfileStats({ lists: -1 });
        router.back();
      }
    },

    like: async () => {
      if (!userId) return false;
      return withToast(() => likeList(listId), 'You liked the list!', 'Failed to like the list.');
    },
    unlike: async () => {
      if (!userId) return false;

      return withToast(
        () => unlikeList(listId),
        'You unliked the list!',
        'Failed to unlike the list.'
      );
    },
  };
}
