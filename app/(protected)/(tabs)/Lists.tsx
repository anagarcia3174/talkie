import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TouchableOpacity, View } from 'react-native';
import { useLists } from '~/store/listStore';
import { useTheme } from '~/hooks/useTheme';
import { ScrollView } from 'react-native-gesture-handler';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import CreateListModal from '~/components/CreateListModal';
import { List } from '~/types/supabaseTypes';
import { useAuth } from '~/context/AuthContext';
import { Toast } from 'toastify-react-native';
import ListRow from '~/components/ListRow';

export default function Lists() {
  const theme = useTheme();
  const router = useRouter();
  const [createListModalVisible, setCreateListModalVisible] = useState(false);
  const { listsById, defaultListIds, customListIds, createList, deleteList } = useLists();
  const { user } = useAuth();

  const library = defaultListIds.library != null ? listsById[defaultListIds.library] : null;

  const favorites = defaultListIds.favorites != null ? listsById[defaultListIds.favorites] : null;

  const handleCreateList = async (list: Partial<List>) => {
    if (!user) return;
    if (customListIds.length >= 5) {
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
    setCreateListModalVisible(false);
    const result = await createList(user.id, list);

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to create your custom list',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Your list was created',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    }
  };

  const handleDeleteList = async (listId: number) => {
    if (!user) return;
    if (
      defaultListIds.library === listId ||
      defaultListIds.favorites === listId ||
      !customListIds.includes(listId)
    ) {
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
    const result = await deleteList(listId);
    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to delete your custom list',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Your list was deleted',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4">
        <View className="flex-row items-center">
          <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
            My Lists
          </Text>
        </View>
        <View>
          {customListIds.length < 5 && (
            <TouchableOpacity
              onPress={() => setCreateListModalVisible(true)}
              className="rounded-full bg-primary-200 p-2 dark:bg-primary-900">
              <Plus size={24} color={theme.primary[950]} />
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
          <ListRow
            title={library.name}
            items={library.item_count}
            onPress={() => router.push(`/list/${library.id}`)}
            deletable={false}
          />
        )}

        {favorites && (
          <ListRow
            title={favorites.name}
            items={favorites.item_count}
            onPress={() => router.push(`/list/${favorites.id}`)}
            deletable={false}
          />
        )}
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
              deletable
              onDelete={() => handleDeleteList(list.id)}
            />
          );
        })}
      </ScrollView>
      <CreateListModal
        visible={createListModalVisible}
        onClose={() => setCreateListModalVisible(false)}
        onSubmit={handleCreateList}
      />
    </SafeAreaView>
  );
}
