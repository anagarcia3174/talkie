import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TouchableOpacity, View } from 'react-native';
import { useList } from '~/store/listStore';
import { useTheme } from '~/hooks/useTheme';
import { ScrollView } from 'react-native-gesture-handler';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import CreateListModal from '~/components/CreateListModal';
import { List } from '~/types/supabaseTypes';
import { useAuth } from '~/context/AuthContext';
import Toast from 'react-native-toast-message';
import ListRow from '~/components/ListRow';
import { useBlock } from '~/store/blockStore';
import { haptics } from '~/utils/haptics';
import { useProfile } from '~/store/profileStore';

const STATUS_TILES = [
  {
    key: 'watched' as const,
    label: 'Watched',
    badgeBgClass: 'bg-emerald-500/20 dark:bg-emerald-400/25',
    badgeTextClass: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    key: 'watching' as const,
    label: 'Watching',
    badgeBgClass: 'bg-amber-500/20 dark:bg-amber-400/25',
    badgeTextClass: 'text-amber-700 dark:text-amber-400',
  },
  {
    key: 'pending' as const,
    label: 'Pending',
    badgeBgClass: 'bg-red-500/20 dark:bg-red-400/25',
    badgeTextClass: 'text-red-700 dark:text-red-400',
  },
];

export default function Lists() {
  const theme = useTheme();
  const router = useRouter();
  const [createListModalVisible, setCreateListModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const {
    listsById,
    defaultListIds,
    customListIds,
    createList,
    deleteList,
    listItems,
    hydrateDefaultLists,
  } = useList();
  const { adjustProfileStats } = useProfile();
  const { user } = useAuth();
  const { blockedIds } = useBlock();

  useEffect(() => {
    hydrateDefaultLists();
  }, [hydrateDefaultLists]);

  const library = defaultListIds.library != null ? listsById[defaultListIds.library] : null;
  const favorites = defaultListIds.favorites != null ? listsById[defaultListIds.favorites] : null;

  const libraryItems = useMemo(
    () => (defaultListIds.library != null ? (listItems[defaultListIds.library] ?? []) : []),
    [defaultListIds.library, listItems]
  );

  const statusCounts = useMemo(
    () =>
      libraryItems.reduce(
        (acc, item) => {
          acc[item.status] += 1;
          return acc;
        },
        { watched: 0, watching: 0, pending: 0 }
      ),
    [libraryItems]
  );

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
    const result = await createList(list);

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
      adjustProfileStats({ lists: 1 });
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
    const result = await deleteList(listId);
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
      adjustProfileStats({ lists: -1 });
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
              hitSlop={8}
              onPress={() => {
                haptics.action();
                setCreateListModalVisible(true);
              }}
              className="rounded-md   bg-primary-100 p-1  dark:bg-primary-900">
              <Plus size={20} color={theme.primary[950]} strokeWidth={2} />
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

        {library && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/list/${library.id}`)}
            className="mb-2 rounded-xl  bg-primary-100 px-4 py-3 dark:bg-primary-900">
            <View className="mb-3 flex-row items-center justify-between">
              <Text
                numberOfLines={1}
                className="flex-1 pr-2 font-SpaceGrotesk-Bold text-xl uppercase text-primary-900 dark:text-primary-100">
                {library.name}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <View className="rounded-full bg-primary-200 px-2.5 py-0.5 dark:bg-primary-800">
                  <Text className="font-SpaceGrotesk-SemiBold text-xs text-primary-600 dark:text-primary-400">
                    {library.item_count} {library.item_count === 1 ? 'item' : 'items'}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-3 flex-row gap-2">
              {STATUS_TILES.map(({ key, label, badgeBgClass, badgeTextClass }) => (
                <View
                  key={key}
                  className="min-w-0 flex-1 rounded-xl bg-primary-200 px-2 py-2.5 dark:bg-primary-800">
                  <Text className="mb-1.5 text-center font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
                    {statusCounts[key]}
                  </Text>
                  <View className={`self-center rounded-full px-2 py-0.5 ${badgeBgClass}`}>
                    <Text
                      className={`text-center font-SpaceGrotesk-SemiBold text-[10px] ${badgeTextClass}`}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}>
                      {label}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}

        {favorites && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/list/${favorites.id}`)}
            className="min-h-16 rounded-xl bg-primary-100 px-4 py-4 dark:bg-primary-900">
            <View className="flex-row items-center justify-between">
              <Text
                numberOfLines={1}
                className="flex-1 pr-2 font-SpaceGrotesk-Bold text-xl uppercase text-primary-900 dark:text-primary-100">
                {favorites.name}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <View className="rounded-full bg-primary-200 px-2.5 py-0.5 dark:bg-primary-800">
                  <Text className="font-SpaceGrotesk-SemiBold text-xs text-primary-600 dark:text-primary-400">
                    {favorites.item_count} {favorites.item_count === 1 ? 'item' : 'items'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Custom Lists */}
        {customListIds.length > 0 && (
          <Text className="mb-2 mt-6 font-SpaceGrotesk-Medium text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
            Custom
          </Text>
        )}

        {customListIds.map((id, idx) => {
          const list = listsById[id];
          if (!list) return null;

          return (
            <ListRow
              key={id}
              list={list}
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
                list={list}
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
