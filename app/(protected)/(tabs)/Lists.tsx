import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TouchableOpacity, View } from 'react-native';
import { useLists } from '~/store/listStore';
import { useTheme } from '~/hooks/useTheme';
import { ScrollView } from 'react-native-gesture-handler';
import { Heart, Lock, Plus, List as ListIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import CreateListModal from '~/components/CreateListModal';
import { List } from '~/types/supabaseTypes';
import { useAuth } from '~/context/AuthContext';
import Toast from 'react-native-toast-message';
import ListRow from '~/components/ListRow';
import { useBlock } from '~/store/blockStore';
import { haptics } from '~/utils/haptics';

export default function Lists() {
  const theme = useTheme();
  const router = useRouter();
  const [createListModalVisible, setCreateListModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { listsById, defaultListIds, customListIds, createList, deleteList } = useLists();
  const { user } = useAuth();
  const { blockedIds } = useBlock();

  const library = defaultListIds.library != null ? listsById[defaultListIds.library] : null;

  const favorites = defaultListIds.favorites != null ? listsById[defaultListIds.favorites] : null;

  const likedLists = Object.values(listsById).filter(
    (list) =>
      list.is_liked &&
      !customListIds.includes(list.id) &&
      list.id !== defaultListIds.library &&
      list.id !== defaultListIds.favorites &&
      !blockedIds.has(list.user_id)
  );

  const handleCreateList = async (list: Partial<List>) => {
    if (!user) return;
    if (customListIds.length >= 5) {
      haptics.error();
      setCreateListModalVisible(false);
      Toast.show({
        type: 'error',
        text1: 'You have reached the maximum number of custom lists.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
      return;
    }
    setCreateLoading(true);
    setCreateListModalVisible(false);
    const result = await createList(user.id, list);

    if (!result.success) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to create your custom list',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } else {
      haptics.success();
      Toast.show({
        type: 'success',
        text1: 'Your list was created',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    }
    setCreateLoading(false);
  };

  const handleDeleteList = async (listId: number) => {
    if (!user) return;
    if (
      defaultListIds.library === listId ||
      defaultListIds.favorites === listId ||
      !customListIds.includes(listId)
    ) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: 'You cannot delete this list.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
      return;
    }
    setDeleteLoading(true);
    const result = await deleteList(user.id, listId);
    if (!result.success) {
      haptics.error();

      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to delete your custom list',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } else {
      haptics.success();

      Toast.show({
        type: 'success',
        text1: 'Your list was deleted',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    }
    setDeleteLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4">
        <View className="flex-row items-center">
          <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
            Lists
          </Text>
        </View>
        <View>
          {customListIds.length < 5 && (
            <TouchableOpacity
              disabled={createLoading}
              onPress={() => {
                haptics.action();
                setCreateListModalVisible(true);
              }}
              className="rounded-lg border border-primary-200 bg-primary-100 p-1 dark:border-primary-800 dark:bg-primary-900">
              <Plus size={20} color={theme.primary[600]} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {/* Default Lists */}
        <Text className="mb-2 mt-4 font-SpaceGrotesk-Medium text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
          Default
        </Text>
        <View className="flex-row gap-x-2">
          {library && (
            <TouchableOpacity
              activeOpacity={0.85}
              className="aspect-square max-h-36 flex-1 rounded-2xl border border-primary-200 bg-primary-100 px-4 py-3 dark:border-primary-800 dark:bg-primary-900">
              <View className="flex-1 justify-between">
                {/* Top */}
                <View className="flex-row items-start justify-between">
                  <Text
                    numberOfLines={2}
                    className="flex-1 pr-2 font-SpaceGrotesk-Bold text-xl uppercase text-primary-900 dark:text-primary-100">
                    {library.name}
                  </Text>

                  {library.is_private && (
                    <Lock size={14} className="text-primary-500 dark:text-primary-400" />
                  )}
                </View>

                <View className="mt-auto flex-row items-center justify-between">
                  <View>
                    <Text className="ml-1 text-sm text-primary-500 dark:text-primary-400">
                      {library.item_count} {library.item_count === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Heart size={12} color={theme.primary[700]} />
                    <Text className="text-sm text-primary-500 dark:text-primary-400">
                      {library.like_count}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {favorites && (
            <TouchableOpacity
              activeOpacity={0.85}
              className="aspect-square max-h-36 flex-1 rounded-2xl border border-primary-200 bg-primary-100 px-4 py-3 dark:border-primary-800 dark:bg-primary-900">
              <View className='flex-1 justify-between'>
                {/* Top */}
                <View className="flex-row items-start justify-between">
                  <Text
                    numberOfLines={2}
                    className="flex-1 pr-2 font-SpaceGrotesk-Bold text-xl uppercase text-primary-900 dark:text-primary-100">
                    {favorites.name}
                  </Text>

                  {favorites.is_private && (
                    <Lock size={14} className="text-primary-500 dark:text-primary-400" />
                  )}
                </View>

              

                {/* Bottom Right */}
                <View className="mt-auto flex-row items-center justify-between">
                  <View>
                    <Text className="ml-1 text-sm text-primary-500 dark:text-primary-400">
                      {favorites.item_count} {favorites.item_count === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Heart size={12} color={theme.primary[700]} />
                    <Text className="text-sm text-primary-500 dark:text-primary-400">
                      {favorites.like_count}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Custom Lists */}
        {customListIds.length > 0 && (
          <Text className="mb-2 mt-6 font-SpaceGrotesk-Medium text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
            Custom
          </Text>
        )}

        {customListIds.map((id) => {
          const list = listsById[id];
          if (!list) return null;

          return (
            <ListRow
              key={id}
              title={list.name}
              items={list.item_count}
              onPress={() => router.push(`/list/${id}`)}
              deletable={!deleteLoading}
              onDelete={() => handleDeleteList(list.id)}
            />
          );
        })}

        {/* Liked Lists */}
        {likedLists.length > 0 && (
          <>
            <Text className="mb-2 mt-6 font-SpaceGrotesk-Medium text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
              Liked
            </Text>

            {likedLists.map((list) => (
              <ListRow
                key={list.id}
                title={list.name}
                items={list.item_count}
                onPress={() => {
                  router.push({
                    pathname: '/list/[id]',
                    params: {
                      id: list.id,
                    },
                  });
                }}
                deletable={false}
              />
            ))}
          </>
        )}
      </ScrollView>
      <CreateListModal
        visible={createListModalVisible}
        onClose={() => setCreateListModalVisible(false)}
        onSubmit={handleCreateList}
      />
    </SafeAreaView>
  );
}
