import { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useTheme } from '~/hooks/useTheme';
import { List, Visibility } from '~/types/supabaseTypes';

interface ListInfoModalProps {
  list: List;
  visible: boolean;
  onClose: () => void;
  onConfirm: (updates: Partial<List>) => void;
  onDelete: () => void;
}

export default function ListInfoModal({
  list,
  visible,
  onClose,
  onConfirm,
  onDelete,
}: ListInfoModalProps) {
  const theme = useTheme();
  const [listName, setListName] = useState(list.name);
  const [listDescription, setListDescription] = useState(list.description || '');
  const [listVisibility, setListVisibility] = useState<Visibility>(list.visibility);

  const nameChanged = !list.is_default && listName.trim() !== list.name;
  const descChanged = (listDescription || '') !== (list.description || '');
  const visibilityChanged = listVisibility !== list.visibility;

  const hasChanges = nameChanged || descChanged || visibilityChanged;

  const isValid =
    listName.trim().length > 0 &&
    listName.length <= 50 &&
    listDescription.length <= 300 &&
    ['private', 'followers', 'public'].includes(listVisibility);

  const canSubmit = hasChanges && isValid;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/50 px-4" onPress={onClose}>
        {/* Card */}
        <Pressable
          onPress={() => {}}
          className="w-full max-w-sm rounded-3xl bg-primary-50 p-6 shadow-2xl dark:bg-primary-900">
          {/* Header */}
          <Text className="mb-4 font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
            Edit List
          </Text>

          {/* Name */}
          <View className="mb-4">
            <Text className="mb-1 text-sm text-primary-700 dark:text-primary-300">Name</Text>
            <TextInput
              editable={!list.is_default}
              className={`rounded-xl border px-4 py-3 font-SpaceGrotesk-Regular ${
                list.is_default
                  ? 'border-primary-300 bg-primary-200 text-primary-500 dark:border-primary-700 dark:bg-primary-800 dark:text-primary-400'
                  : 'border-primary-300 bg-primary-50 text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-50 focus:dark:border-primary-50'
              }`}
              value={listName}
              onChangeText={setListName}
              cursorColor={theme.primary[700]}
              selectionColor={theme.primary[700]}
              placeholder="e.g. Weekend movies"
              placeholderTextColor={theme.primary[500]}
              maxLength={50}
            />
            <Text className="mt-1 text-right text-xs text-primary-500">{listName.length}/50</Text>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="mb-1 text-sm text-primary-700 dark:text-primary-300">
              Description (optional)
            </Text>
            <TextInput
              className="min-h-[90px] rounded-xl border border-primary-300 bg-primary-50 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-50 focus:dark:border-primary-50"
              value={listDescription}
              onChangeText={setListDescription}
              cursorColor={theme.primary[700]}
              selectionColor={theme.primary[700]}
              placeholder="What’s this list for?"
              placeholderTextColor={theme.primary[500]}
              multiline
              maxLength={300}
            />
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-sm text-primary-700 dark:text-primary-300">Visibility</Text>

            <View className="flex-row gap-2">
              {(['private', 'followers', 'public'] as Visibility[]).map((option) => {
                const selected = listVisibility === option;

                return (
                  <Pressable
                    key={option}
                    onPress={() => setListVisibility(option)}
                    className={`flex-1 rounded-xl border px-3 py-2 ${
                      selected
                        ? 'border-primary-900 bg-primary-900 dark:border-primary-50 dark:bg-primary-50'
                        : 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-900'
                    }`}>
                    <Text
                      className={`text-center capitalize ${
                        selected
                          ? 'font-SpaceGrotesk-SemiBold text-primary-50 dark:text-primary-900'
                          : 'text-primary-700 dark:text-primary-300'
                      }`}>
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row justify-end gap-3">
            <Pressable onPress={onClose} className="rounded-xl px-4 py-2">
              <Text className="text-primary-700 dark:text-primary-300">Cancel</Text>
            </Pressable>

            <Pressable
              disabled={!canSubmit}
              onPress={() => {
                const updates: Partial<List> = {};

                if (nameChanged) updates.name = listName.trim();
                if (descChanged) updates.description = listDescription.trim();
                if (visibilityChanged) updates.visibility = listVisibility;

                onConfirm(updates);
              }}
              className={`rounded-xl px-5 py-2 ${
                canSubmit
                  ? 'bg-primary-900 dark:bg-primary-50'
                  : 'bg-primary-300 dark:bg-primary-700'
              }`}>
              <Text
                className={`font-SpaceGrotesk-SemiBold ${
                  canSubmit
                    ? 'text-primary-50 dark:text-primary-900'
                    : 'text-primary-600 dark:text-primary-400'
                }`}>
                Confirm
              </Text>
            </Pressable>
          </View>

          <View className="my-8 h-px bg-primary-200 dark:bg-primary-700" />

          {/* Delete */}
          <TouchableOpacity
            disabled={list.is_default}
            activeOpacity={0.5}
            onPress={onDelete}
            className={`rounded-xl px-4 py-3 ${
              list.is_default ? 'bg-primary-200  dark:bg-primary-800' : 'bg-red-500'
            }`}>
            <Text
              className={`text-center font-SpaceGrotesk-SemiBold ${
                list.is_default ? 'text-primary-500 dark:text-primary-400' : 'text-primary-100'
              }`}>
              {list.is_default ? 'Cannot delete default list' : 'Delete List'}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
