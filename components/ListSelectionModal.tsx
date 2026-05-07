import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { X, Plus, Check } from 'lucide-react-native';
import { useLists } from '~/store/listStore';
import { useTheme } from '~/hooks/useTheme';
import { useEffect, useState } from 'react';
import { haptics } from '~/utils/haptics';
import BottomSheet from './BottomSheet';

interface ListSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (listIds: number[]) => Promise<void>;
}

export default function ListSelectionModal({
  visible,
  onClose,
  onConfirm,
}: ListSelectionModalProps) {
  const { listsById, defaultListIds, customListIds } = useLists();
  const [selectedLists, setSelectedLists] = useState<number[]>([]);
  const theme = useTheme();

  const favorites = defaultListIds.favorites != null ? listsById[defaultListIds.favorites] : null;

  const library = defaultListIds.library != null ? listsById[defaultListIds.library] : null;

  useEffect(() => {
    if (!visible) setSelectedLists([]);
  }, [visible]);

  const toggleList = (listId: number) => {
    setSelectedLists((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
  };

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          Add To List
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="rounded-lg bg-primary-200 p-1  dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="max-h-[48vh]" showsVerticalScrollIndicator={false}>
        {/* ---- Default Lists ---- */}
        <View className="mb-4">
          <Text className="mb-2 font-SpaceGrotesk-SemiBold text-sm uppercase text-primary-600 dark:text-primary-400">
            Default Lists
          </Text>

          <View className="flex-row gap-x-2">
            {[favorites, library].map(
              (list) =>
                list && (
                  <TouchableOpacity
                    key={list.id}
                    onPress={() => {
                      haptics.action();
                      toggleList(list.id);
                    }}
                    className={`h-28 w-28 flex-1 flex-col justify-between rounded-xl p-4 ${
                      selectedLists.includes(list.id)
                        ? 'bg-primary-950 dark:bg-primary-50'
                        : 'bg-primary-200 dark:bg-primary-800'
                    }`}>
                    <View className="flex-1">
                      <Text
                        className={`font-SpaceGrotesk-SemiBold ${
                          selectedLists.includes(list.id)
                            ? 'text-primary-50 dark:text-primary-950'
                            : 'text-primary-950 dark:text-primary-50'
                        }`}>
                        {list.name}
                      </Text>
                      <Text
                        className={`font-SpaceGrotesk-Light text-sm ${
                          selectedLists.includes(list.id)
                            ? 'text-primary-300 dark:text-primary-600'
                            : 'text-primary-600 dark:text-primary-300'
                        }`}>
                        {list.item_count} {list.item_count === 1 ? 'item' : 'items'}
                      </Text>
                    </View>

                    <View className="flex-row items-end justify-end">
                      {selectedLists.includes(list.id) ? (
                        <View className="rounded-lg p-1">
                          <Check size={20} color={theme.primary[50]} strokeWidth={2} />
                        </View>
                      ) : (
                        <View className="rounded-lg bg-primary-300 p-1 dark:bg-primary-700">
                          <Plus size={20} color={theme.primary[700]} strokeWidth={2} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                )
            )}
          </View>
        </View>

        {/* ---- Custom Lists ---- */}
        {customListIds.length > 0 && (
          <View className=" ">
            <Text className="mb-2 font-SpaceGrotesk-SemiBold text-sm uppercase text-primary-600 dark:text-primary-400">
              Custom
            </Text>

            <View className="gap-2">
              {customListIds.map((listId) => {
                const list = listsById[listId];
                if (!list) return null;

                return (
                  <TouchableOpacity
                    key={list.id}
                    onPress={() => {
                      haptics.action();
                      toggleList(list.id);
                    }}
                    className={`flex-row items-center gap-4 rounded-xl p-4 ${
                      selectedLists.includes(list.id)
                        ? 'bg-primary-950 dark:bg-primary-50'
                        : 'bg-primary-200 dark:bg-primary-800'
                    }`}>
                    <View className="flex-1">
                      <Text
                        className={`font-SpaceGrotesk-SemiBold ${
                          selectedLists.includes(list.id)
                            ? 'text-primary-50 dark:text-primary-950'
                            : 'text-primary-950 dark:text-primary-50'
                        }`}>
                        {list.name}
                      </Text>
                      <Text
                        className={`font-SpaceGrotesk-Light text-sm ${
                          selectedLists.includes(list.id)
                            ? 'text-primary-300 dark:text-primary-600'
                            : 'text-primary-600 dark:text-primary-300'
                        }`}>
                        {list.item_count} {list.item_count === 1 ? 'item' : 'items'}
                      </Text>
                    </View>

                    {selectedLists.includes(list.id) ? (
                      <View className="rounded-lg p-1">
                        <Check size={20} color={theme.primary[50]} strokeWidth={2} />
                      </View>
                    ) : (
                      <View className="rounded-lg bg-primary-300 p-1 dark:bg-primary-700">
                        <Plus size={20} color={theme.primary[700]} strokeWidth={2} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="pt-2">
        <TouchableOpacity
          disabled={selectedLists.length == 0}
          onPress={() => {
            haptics.action();
            onConfirm(selectedLists);
          }}
          className="flex-row items-center justify-between gap-3 rounded-xl bg-primary-950 p-4 disabled:opacity-40 dark:bg-primary-50">
          <View className="flex-row items-center justify-center gap-x-1">
            <Plus size={20} color={theme.primary[50]} />
            <Text className="font-SpaceGrotesk-SemiBold text-primary-50 dark:text-primary-950">
              {selectedLists.length > 1 ? `Add to lists` : 'Add to list'}
            </Text>
          </View>
          <Text className="font-SpaceGrotesk-SemiBold text-primary-50 dark:text-primary-950">
            {selectedLists.length} total
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}
