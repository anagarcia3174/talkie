import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useTheme } from '~/hooks/useTheme';
import { List } from '~/types/supabaseTypes';

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (list: Partial<List>) => void;
}

export default function CreateListModal({ visible, onClose, onSubmit }: CreateListModalProps) {
  const theme = useTheme();
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');

    const canSubmit = listName.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Overlay */}
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 px-4"
        onPress={onClose}
      >
        {/* Card */}
        <Pressable
          onPress={() => {}}
          className="w-full max-w-sm rounded-3xl bg-primary-50 p-6 shadow-2xl dark:bg-primary-900"
        >
          {/* Header */}
          <Text className="mb-4 font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
            Create new list
          </Text>

          {/* Name */}
          <View className="mb-4">
            <Text className="mb-1 text-sm text-primary-700 dark:text-primary-300">
              Name
            </Text>
            <TextInput
              className="rounded-xl border border-primary-300 bg-primary-50 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-50 focus:dark:border-primary-50"
              value={listName}
              onChangeText={setListName}
              cursorColor={theme.primary[700]}
              selectionColor={theme.primary[700]}
              placeholder="e.g. Weekend movies"
              placeholderTextColor={theme.primary[500]}
              maxLength={50}
            />
            <Text className="mt-1 text-right text-xs text-primary-500">
              {listName.length}/50
            </Text>
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

          {/* Actions */}
          <View className="flex-row justify-end gap-3">
            <Pressable
              onPress={onClose}
              className="rounded-xl px-4 py-2"
            >
              <Text className="text-primary-700 dark:text-primary-300">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              disabled={!canSubmit}
              onPress={() => {
                onSubmit({
                  name: listName.trim(),
                  description: listDescription.trim() || undefined,
                });
                setListName('');
                setListDescription('');
              }}
              className={`rounded-xl px-5 py-2 ${
                canSubmit
                  ? 'bg-primary-900 dark:bg-primary-50'
                  : 'bg-primary-300 dark:bg-primary-700'
              }`}
            >
              <Text
                className={`font-SpaceGrotesk-SemiBold ${
                  canSubmit
                    ? 'text-primary-50 dark:text-primary-900'
                    : 'text-primary-600 dark:text-primary-400'
                }`}
              >
                Create
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
