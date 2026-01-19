import {
  View,
  Pressable,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { X, Plus, Library, List, Star, Check, ScrollText } from 'lucide-react-native';
import { useLists } from '~/store/listStore';
import { useTheme } from '~/hooks/useTheme';
import { useState } from 'react';

interface ListSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (listId: number) => Promise<void>;
}

export default function ListSelectionModal({
  visible,
  onClose,
  onConfirm,
}: ListSelectionModalProps) {
  const { listsById, defaultListIds, customListIds } = useLists();
  const [selectedList, setSelectedList] = useState<number | undefined>(undefined);
  const theme = useTheme();

  const favorites = defaultListIds.favorites != null ? listsById[defaultListIds.favorites] : null;

  const library = defaultListIds.library != null ? listsById[defaultListIds.library] : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable className="flex-1 bg-primary-950/60" onPress={onClose} />

      {/* Bottom Sheet */}
      <View className="absolute bottom-0 h-[60vh] w-full rounded-t-2xl  bg-primary-100 shadow-2xl dark:bg-primary-900">
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
          {/* ---- Default Lists ---- */}
          <View className="px-6 py-4">
            <Text className="mb-2 font-SpaceGrotesk-Medium text-sm text-primary-600 dark:text-primary-400">
              Default Lists
            </Text>

            <View className="gap-2">
              {[favorites, library].map(
                (list) =>
                  list && (
                    <TouchableOpacity
                      key={list.id}
                      onPress={() =>
                        setSelectedList(selectedList === list.id ? undefined : list.id)
                      }
                      className={`flex-row items-center gap-4 rounded-xl p-4 ${
                        selectedList === list.id
                          ? 'bg-primary-800 dark:bg-primary-100'
                          : 'bg-primary-100 dark:bg-primary-800'
                      }`}>
                      <View className="rounded-lg bg-primary-800 p-2 dark:bg-primary-100">
                        {list.list_type === 'favorites' ? (
                          <Star size={20} color={theme.primary[50]} />
                        ) : (
                          <Library size={20} color={theme.primary[50]} />
                        )}
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
                        <Text className="text-sm text-primary-400 dark:text-primary-400">
                          {list.item_count} items
                        </Text>
                      </View>

                      {selectedList === list.id ? (
                        <Check size={20} color={theme.primary[50]} />
                      ) : (
                        <Plus size={20} color={theme.primary[600]} />
                      )}
                    </TouchableOpacity>
                  )
              )}
            </View>
          </View>

          {/* ---- Custom Lists ---- */}
          {customListIds.length > 0 && (
            <View className="border-primary-200 px-6 py-4 dark:border-primary-800">
              <Text className="mb-2 font-SpaceGrotesk-Medium text-sm text-primary-600 dark:text-primary-400">
                Custom
              </Text>

              <View className="gap-2">
                {customListIds.map((listId) => {
                  const list = listsById[listId];
                  if (!list) return null;

                  return (
                    <TouchableOpacity
                      key={list.id}
                      onPress={() =>
                        setSelectedList(selectedList === list.id ? undefined : list.id)
                      }
                      className={`flex-row items-center gap-4 rounded-xl p-4 ${
                        selectedList === list.id
                          ? 'bg-primary-800 dark:bg-primary-100'
                          : 'bg-primary-100 dark:bg-primary-800'
                      }`}>
                      <View className="rounded-lg bg-primary-800 p-2 dark:bg-primary-100">
                        <ScrollText size={20} color={theme.primary[50]} />
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
                        <Text className="text-sm text-primary-400 dark:text-primary-400">
                          {list.item_count} items
                        </Text>
                      </View>

                      {selectedList === list.id ? (
                        <Check size={20} color={theme.primary[50]} />
                      ) : (
                        <Plus size={20} color={theme.primary[600]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View className="mb-8 border-t border-primary-200 px-6 py-4 dark:border-primary-800">
          <TouchableOpacity
            disabled={selectedList == null}
            onPress={() => selectedList && onConfirm(selectedList)}
            className="flex-row items-center justify-center gap-3 rounded-xl bg-primary-950 p-4 dark:bg-primary-50">
            <Plus size={20} color={theme.primary[50]} />
            <Text className="font-SpaceGrotesk-SemiBold text-primary-50 dark:text-primary-950">
              Add item to list
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
