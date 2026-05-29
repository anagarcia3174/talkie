import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useList } from '~/store/listStore';
import { analytics } from '~/utils/analytics';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListContent from '~/components/ListContent';
import LoadingScreen from '~/components/LoadingScreen';

import { useAuth } from '~/context/AuthContext';
import useListcreenActions from './useListScreenActions';
import { useBlock } from '~/store/blockStore';
import ErrorScreen from '~/components/ErrorScreen';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';

export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const listId = Number(id);
  const isValidListId = Number.isFinite(listId);

  const { listsById, listItems, listItemsState, fetchListItems } = useList();
  const { user } = useAuth();
  const { blockedIds } = useBlock();
  const list = isValidListId ? listsById[listId] : undefined;
  const items = isValidListId ? listItems[listId] : undefined;
  const itemState = isValidListId ? listItemsState[listId] : undefined;
  const loadingItems = itemState?.isLoading ?? false;
  const itemsError = itemState?.error ?? null;
  const actions = useListcreenActions(listId);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isValidListId || !list || items) return;
    fetchListItems(listId);
  }, [isValidListId, list, items, listId, fetchListItems]);

  useEffect(() => {
    if (!list || !user) return;
    analytics.listViewed({ list_id: id, is_own: list.user_id === user.id });
  }, [id, list, user]);

  if (!isValidListId) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary-50 dark:bg-primary-950">
        <Text className="font-SpaceGrotesk-Regular text-primary-600 dark:text-primary-400">
          Invalid list
        </Text>
      </SafeAreaView>
    );
  }

  if (!list) {
    return <LoadingScreen fullScreen />;
  }

  if (!items && loadingItems) {
    return <LoadingScreen fullScreen />;
  }

  if (!items && itemsError) {
    return (
      <ErrorScreen
        fullScreen
        title="Oops!"
        message={itemsError}
        onRetry={() => fetchListItems(listId)}
      />
    );
  }

  if (list && blockedIds.has(list.user_id)) {
    return (
      <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
        <TouchableOpacity onPress={() => router.back()} className="px-4 py-2">
          <ChevronLeft color={theme.primary[950]} />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center px-4">
          <ErrorScreen fullScreen={false} title="This list is unavailable" message="" />
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = list.user_id === user?.id;

  return <ListContent list={list} listItems={items ?? []} actions={actions} isOwner={isOwner} />;
}
