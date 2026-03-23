import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useLists } from '~/store/listStore';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListContent from '~/components/ListContent';
import LoadingScreen from '~/components/LoadingScreen';

import { useAuth } from '~/context/AuthContext';
import useListScreenActions from './useListScreenActions';
import { useBlock } from '~/store/blockStore';
import ErrorScreen from '~/components/ErrorScreen';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';

export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const listId = Number(id);
  const isValidListId = Number.isFinite(listId);

  const { listsById, listItems, getListItems } = useLists();
  const { user } = useAuth();
  const { blockedIds } = useBlock();
  const list = isValidListId ? listsById[listId] : undefined;
  const items = isValidListId ? listItems[listId] : undefined;
  const actions = useListScreenActions(listId);
  const theme = useTheme();
  const router = useRouter();
  useEffect(() => {
    if (!isValidListId) return;
    if (list && !items) {
      getListItems(listId);
    }
  }, [isValidListId, list, items, listId, getListItems]);

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

  if (!items) {
    return <LoadingScreen fullScreen />;
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

  return <ListContent list={list} listItems={items} actions={actions} isOwner={isOwner} />;
}
