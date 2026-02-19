import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useLists } from '~/store/listStore';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListContent from '~/components/ListContent';
import LoadingScreen from '~/components/LoadingScreen';

import { useAuth } from '~/context/AuthContext';
import useListScreenActions from './useListScreenActions';
import { useBlock } from '~/store/blockStore';

export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const listId = Number(id);
  const isValidListId = Number.isFinite(listId);

  const { listsById, listItems, getListItems } = useLists();
  const { user } = useAuth();
  const { blockedIds } = useBlock();
  const list = isValidListId ? listsById[listId] : undefined;
  const items = isValidListId ? listItems[listId] : undefined;
  const router = useRouter();
  const actions = useListScreenActions(listId);

  useEffect(() => {
    if (!isValidListId) return;

    // Only fetch if list exists and items haven't been loaded yet
    if (list && !items) {
      getListItems(listId);
    }
  }, [isValidListId, list, items, listId, getListItems]);

  useEffect(() => {
    if (!list) return;

    if (blockedIds.has(list.user_id)) {
      router.replace('/(protected)/(tabs)/Home');
    }
  }, [blockedIds, list, router]);

  // 🚫 Invalid ID
  if (!isValidListId) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary-50 dark:bg-primary-950">
        <Text className="font-SpaceGrotesk-Regular text-primary-600 dark:text-primary-400">
          Invalid list
        </Text>
      </SafeAreaView>
    );
  }

  // ⏳ List not loaded yet
  if (!list) {
    return <LoadingScreen fullScreen />;
  }

  // ⏳ Items not loaded yet
  if (!items) {
    return <LoadingScreen fullScreen />;
  }

  const isOwner = list.user_id === user?.id;

  return <ListContent list={list} listItems={items} actions={actions} isOwner={isOwner} />;
}
