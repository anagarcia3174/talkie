import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useLists } from '~/store/listStore';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListContent from '~/components/ListContent';
import LoadingScreen from '~/components/LoadingScreen';
import { LibraryStatus, ListItemWithMedia, ListItem } from '~/types/supabaseTypes';
import { Toast } from 'toastify-react-native';

export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listId = Number(id);
  const router = useRouter();

  const { listsById, listItems, getListItems, updateItemStatus } = useLists();

  const list = listsById[listId];
  const items = listItems[listId];
  const isLoadingItems = !items;

  const updateListItemStatus = async (item: ListItem | ListItemWithMedia, status: LibraryStatus) => {
    const result = await updateItemStatus(item, status);
    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: result.error || "Failed to change the item's status.",
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } else {
      Toast.show({
        type: 'success',
        text1: "The item's status was updated!",
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    }
  };

  useEffect(() => {
    if (!listId || items) return;

    getListItems(listId);
  }, [listId, items, getListItems]);

  if (!list) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary-50 dark:bg-primary-950">
        <Text className="font-SpaceGrotesk-Regular text-primary-600 dark:text-primary-400">
          List not found
        </Text>
      </SafeAreaView>
    );
  }

  if (isLoadingItems) {
    return <LoadingScreen fullScreen={true} />;
  }

  return <ListContent list={list} listItems={items} onBack={() => router.back()} onUpdateStatus={updateListItemStatus}/>;
}
