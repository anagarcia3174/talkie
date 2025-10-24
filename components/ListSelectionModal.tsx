import {
  View,
  Pressable,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, Plus, Library, List, Star, Check } from 'lucide-react-native';
import { useLists } from '~/store/listStore';
import { useTheme } from '~/hooks/useTheme';
import { Toast } from 'toastify-react-native';
import { useState, useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  useSharedValue,
} from 'react-native-reanimated';

interface ListSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  mediaId: number;
  userId: string | undefined;
}

export default function ListSelectionModal({
  visible,
  onClose,
  mediaId,
  userId,
}: ListSelectionModalProps) {
  const { defaultLists, customLists, addItemToList } = useLists();
  const [selectedList, setSelectedList] = useState<number | undefined>(undefined);
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.value, [0, 1], [1000, 0]) }],
  }));

  const addMediaToLibrary = async (): Promise<void> => {
    if (selectedList === undefined || userId === undefined) return;
    setLoading(true);
    Toast.show({
      type: 'info',
      text1: 'Adding item to your list...',
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      onPress: () => Toast.hide(),
    });
    try {
      const result = await addItemToList(selectedList, mediaId, userId);
      if (!result.success) {
        Toast.show({
          type: 'error',
          text1: result.error || 'Failed to add item to your list',
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => Toast.hide(),
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Item was added to your list!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          onPress: () => Toast.hide(),
        });
        onClose();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'An unexpected error ocurred while adding the item to your list',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } finally {
      setLoading(false);
    }
  };

  if (visible)
    return (
      <Animated.View style={[backdropStyle]} className="absolute inset-0 z-50 flex-1 justify-end bg-black/40">
        {/* Backdrop */}
        <Pressable className="absolute inset-0" onPress={onClose} />

        {/* Bottom Sheet */}
        <Animated.View style={[sheetStyle]} className="z-10 h-[60vh] overflow-hidden rounded-t-3xl bg-primary-50 shadow-2xl dark:bg-primary-950">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-primary-200 px-6 py-4 dark:border-primary-800">
            <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
              Add to List
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="rounded-full p-2 active:bg-primary-100 dark:active:bg-primary-800">
              <X size={20} color={theme.primary[950]} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Default Lists Section */}
            <View className="px-6 py-4">
              <Text className="mb-3 font-SpaceGrotesk-Medium text-sm text-primary-600 dark:text-primary-400">
                Default Lists
              </Text>
              <View className="gap-2">
                {defaultLists.favorites != null ? (
                  <TouchableOpacity
                    key={defaultLists.favorites.id}
                    onPress={() =>
                      setSelectedList(
                        selectedList == defaultLists.favorites?.id
                          ? undefined
                          : defaultLists.favorites?.id
                      )
                    }
                    className={`flex-row items-center gap-4 rounded-xl p-4 active:bg-primary-200 dark:active:bg-primary-700 ${
                      selectedList === defaultLists.favorites.id
                        ? 'bg-primary-800 dark:bg-primary-100'
                        : 'bg-primary-100 dark:bg-primary-800'
                    }`}>
                    <View className="rounded-lg bg-primary-950 p-2 dark:bg-primary-50">
                      <Star size={20} color={theme.primary[50]} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-SpaceGrotesk-Medium ${
                          selectedList === defaultLists.favorites.id
                            ? 'text-primary-50 dark:text-primary-950'
                            : 'text-primary-950 dark:text-primary-50'
                        }`}>
                        {defaultLists.favorites.name}
                      </Text>
                      <Text
                        className={`font-SpaceGrotesk-Light text-sm ${selectedList === defaultLists.favorites.id ? 'text-primary-300 dark:text-primary-800' : 'text-primary-600 dark:text-primary-400'}`}>
                        {defaultLists.favorites.item_count} items
                      </Text>
                    </View>
                    {selectedList == defaultLists.favorites.id ? (
                      <Check size={20} color={theme.primary[50]} />
                    ) : (
                      <Plus size={20} color={theme.primary[600]} />
                    )}
                  </TouchableOpacity>
                ) : (
                  <></>
                )}

                {defaultLists.library != null ? (
                  <TouchableOpacity
                    key={defaultLists.library.id}
                    onPress={() =>
                      setSelectedList(
                        selectedList == defaultLists.library?.id
                          ? undefined
                          : defaultLists.library?.id
                      )
                    }
                    className={`flex-row items-center gap-4 rounded-xl p-4 active:bg-primary-200 dark:active:bg-primary-700 ${
                      selectedList === defaultLists.library.id
                        ? 'bg-primary-800 dark:bg-primary-100'
                        : 'bg-primary-100 dark:bg-primary-800'
                    }`}>
                    <View className="rounded-lg bg-primary-950 p-2 dark:bg-primary-50">
                      <Library size={20} color={theme.primary[50]} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-SpaceGrotesk-Medium ${
                          selectedList === defaultLists.library.id
                            ? 'text-primary-50 dark:text-primary-950'
                            : 'text-primary-950 dark:text-primary-50'
                        }`}>
                        {defaultLists.library.name}
                      </Text>
                      <Text
                        className={`font-SpaceGrotesk-Light text-sm ${selectedList === defaultLists.library.id ? 'text-primary-300 dark:text-primary-800' : 'text-primary-600 dark:text-primary-400'}`}>
                        {defaultLists.library.item_count} items
                      </Text>
                    </View>
                    {selectedList == defaultLists.library.id ? (
                      <Check size={20} color={theme.primary[50]} />
                    ) : (
                      <Plus size={20} color={theme.primary[600]} />
                    )}
                  </TouchableOpacity>
                ) : (
                  <></>
                )}
              </View>
            </View>

            {/* Custom Lists Section */}
            {customLists.length > 0 && (
              <View className="border-t border-primary-200 px-6 py-4 dark:border-primary-800">
                <Text className="mb-3 font-SpaceGrotesk-Medium text-sm text-primary-600 dark:text-primary-400">
                  My Lists
                </Text>
                <View className="gap-2">
                  {customLists.map((list) => (
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedList(selectedList === list.id ? undefined : list.id)
                      }
                      key={list.id}
                      className={`flex-row items-center gap-4 rounded-xl p-4 active:bg-primary-200 dark:active:bg-primary-700 ${
                        selectedList === list.id
                          ? 'bg-primary-800 dark:bg-primary-100'
                          : 'bg-primary-100 dark:bg-primary-800'
                      }`}>
                      <View className="rounded-lg bg-primary-200 p-2 dark:bg-primary-700">
                        <List size={20} color={theme.primary[950]} />
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-SpaceGrotesk-Medium ${
                            selectedList === list.id
                              ? 'text-primary-50 dark:text-primary-950'
                              : 'text-primary-950 dark:text-primary-50'
                          }`}>
                          {list.name}
                        </Text>
                        <Text
                          className={`font-SpaceGrotesk-Light text-sm ${selectedList === list.id ? 'text-primary-300 dark:text-primary-800' : 'text-primary-600 dark:text-primary-400'}`}>
                          {list.item_count} items
                        </Text>
                      </View>
                      {selectedList == list.id ? (
                        <Check size={20} color={theme.primary[50]} />
                      ) : (
                        <Plus size={20} color={theme.primary[600]} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
          <View className="mb-8 border-t border-primary-200 px-6 py-4 dark:border-primary-800">
            {selectedList != undefined ? (
              <TouchableOpacity
                onPress={addMediaToLibrary}
                className="flex-row items-center justify-center gap-3 rounded-xl bg-primary-950 p-4 active:bg-primary-500 dark:bg-primary-50">
                {loading ? (
                  <ActivityIndicator color={theme.primary[50]} />
                ) : (
                  <>
                    <Plus size={20} color={theme.primary[50]} />
                    <Text className="font-SpaceGrotesk-SemiBold text-primary-50 dark:text-primary-950">
                      Add item to list
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className="flex-row items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary-300 p-4 active:border-primary-950 active:bg-primary-100 dark:border-primary-700 dark:active:border-primary-50 dark:active:bg-primary-800">
                <Plus size={20} color={theme.primary[600]} />
                <Text className="font-SpaceGrotesk-SemiBold text-primary-700 dark:text-primary-300">
                  Create New List
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    );

  return <></>;
}
