import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useLists } from '~/store/listStore';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListContent from '~/components/ListContent';
import LoadingScreen from '~/components/LoadingScreen';
import {
  LibraryStatus,
  ListItemWithMedia,
  ListItem,
  List,
  ListOwnerInfo,
} from '~/types/supabaseTypes';
import { Toast } from 'toastify-react-native';
import { useAuth } from '~/context/AuthContext';
import useListScreenActions from './useListScreenActions';

export default function ListScreen() {
  const { id, ownerId, ownerName, ownerAvatar } = useLocalSearchParams<{
    id: string;
    ownerId: string;
    ownerName: string;
    ownerAvatar?: string;
  }>();

  const listId = Number(id);
  const isValidListId = Number.isFinite(listId);

  const { listsById, listItems, getListItems } = useLists();

  const { user } = useAuth();

  const actions = useListScreenActions(listId);

  const list = isValidListId ? listsById[listId] : undefined;
  const items = isValidListId ? listItems[listId] : undefined;
  const isLoadingItems = !!list && !items;

  useEffect(() => {
    if (!isValidListId || items) return;
    getListItems(listId);
  }, [isValidListId, items, listId, getListItems]);

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
    return <LoadingScreen fullScreen />;
  }

  if (!items) {
    return <LoadingScreen fullScreen />;
  }
  
  const isOwner = list.user_id === user?.id;

  const owner: ListOwnerInfo = {
    id: ownerId,
    display_name: ownerName,
    avatar_url: ownerAvatar,
  };

  return (
    <ListContent list={list} listItems={items} actions={actions} isOwner={isOwner} owner={owner} />
  );
}
