import { Globe, Lock, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useTheme } from '~/hooks/useTheme';
import { List } from '~/types/supabaseTypes';
import { haptics } from '~/utils/haptics';
import BottomSheet from './BottomSheet';

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
  const [listIsPrivate, setListIsPrivate] = useState<boolean>(list.is_private);
  const nameChanged = !list.is_default && listName.trim() !== list.name;
  const descChanged = (listDescription || '') !== (list.description || '');
  const isPrivateChanged = listIsPrivate !== list.is_private;

  const hasChanges = nameChanged || descChanged || isPrivateChanged;

  const isValid =
    listName.trim().length > 0 && listName.length <= 50 && listDescription.length <= 500;

  const canSubmit = hasChanges && isValid;

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      {/* Header */}

      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
          Edit List
        </Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={8}
          className="rounded-lg bg-primary-200 p-1 dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Name */}
      <View className="mb-2">
        <Text className="mb-1 font-SpaceGrotesk-Medium text-sm uppercase text-primary-700 dark:text-primary-300">
          Name
        </Text>
        <TextInput
          editable={!list.is_default}
          className={`rounded-xl bg-primary-200 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 dark:bg-primary-800 dark:text-primary-50 ${
            list.is_default ? 'opacity-50' : ''
          }`}
          value={listName}
          onChangeText={setListName}
          cursorColor={theme.primary[700]}
          selectionColor={theme.primary[700]}
          placeholder="e.g. Weekend movies"
          placeholderTextColor={theme.primary[500]}
          maxLength={50}
        />
        {!list.is_default && (
          <Text className="mt-1 text-right text-xs text-primary-500">{listName.length}/50</Text>
        )}
      </View>

      {/* Description */}
      <View className="mb-2">
        <Text className="mb-1 font-SpaceGrotesk-Medium text-sm uppercase text-primary-700 dark:text-primary-300">
          DESCRIPTION (optional)
        </Text>
        <TextInput
          className="min-h-[60px] rounded-xl bg-primary-200 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 dark:bg-primary-800 dark:text-primary-50"
          value={listDescription}
          onChangeText={setListDescription}
          cursorColor={theme.primary[700]}
          selectionColor={theme.primary[700]}
          placeholder="What’s this list for?"
          placeholderTextColor={theme.primary[500]}
          multiline
          maxLength={500}
          submitBehavior="newline"
          numberOfLines={3}
        />
        <Text className="mt-1 text-right text-xs text-primary-500">
          {listDescription.length}/500
        </Text>
      </View>

      <View className="mb-2">
        <Text className="mb-1 font-SpaceGrotesk-Medium text-sm uppercase text-primary-700 dark:text-primary-300">
          Visibility
        </Text>

        <View className="flex-row gap-x-2">
          <TouchableOpacity
            onPress={() => setListIsPrivate(false)}
            className={`flex-1 flex-row items-center justify-between rounded-xl px-3 py-3 ${
              listIsPrivate
                ? 'bg-primary-200 dark:bg-primary-800'
                : ' bg-primary-900 dark:bg-primary-100'
            }`}>
            <View className="flex-row items-center gap-x-1">
              <Globe size={15} color={listIsPrivate ? theme.primary[500] : theme.primary[100]} />
              <Text
                className={`font-SpaceGrotesk-Medium text-sm ${
                  listIsPrivate ? 'text-primary-500' : 'text-primary-100 dark:text-primary-900'
                }`}>
                Public
              </Text>
            </View>
            {!listIsPrivate && (
              <View className="m-1 h-1.5 w-1.5 rounded-full bg-primary-100 p-1 dark:bg-primary-900" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setListIsPrivate(true)}
            className={`flex-1 flex-row items-center justify-between rounded-xl px-3 py-3 ${
              listIsPrivate
                ? 'bg-primary-900 dark:bg-primary-100'
                : 'bg-primary-200 dark:bg-primary-800'
            }`}>
            <View className="flex-row items-center gap-x-1">
              <Lock size={15} color={listIsPrivate ? theme.primary[100] : theme.primary[500]} />
              <Text
                className={`font-SpaceGrotesk-Medium text-sm ${
                  listIsPrivate ? 'text-primary-100 dark:text-primary-900' : 'text-primary-500'
                }`}>
                Private
              </Text>
            </View>
            {listIsPrivate && (
              <View className="m-1 h-1.5 w-1.5 rounded-full bg-primary-100 p-1 dark:bg-primary-900" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-x-2 pt-2">
        <Pressable
          onPress={onClose}
          className="flex-1 items-center rounded-xl border border-primary-300 py-2.5 dark:border-primary-700">
          <Text className="text-primary-700 dark:text-primary-300">Cancel</Text>
        </Pressable>

        <Pressable
          disabled={!canSubmit}
          onPress={() => {
            const updates: Partial<List> = {};

            if (nameChanged) updates.name = listName.trim();
            if (descChanged) updates.description = listDescription.trim();
            if (isPrivateChanged) updates.is_private = listIsPrivate;

            haptics.action();
            onConfirm(updates);
          }}
          className={`flex-[2] items-center rounded-xl px-5 py-2 py-2.5 ${
            canSubmit ? 'bg-primary-900 dark:bg-primary-50' : 'bg-primary-200 dark:bg-primary-600'
          }`}>
          <Text
            className={`font-SpaceGrotesk-SemiBold ${
              canSubmit
                ? 'text-primary-50 dark:text-primary-900'
                : 'text-primary-400 dark:text-primary-300'
            }`}>
            Confirm
          </Text>
        </Pressable>
      </View>

      {!list.is_default && (
        <>
          <View className="my-2 h-px bg-primary-200 dark:bg-primary-700" />

          {/* Delete */}
          <TouchableOpacity
            disabled={list.is_default}
            activeOpacity={0.5}
            onPress={() => {
              haptics.warning();
              onDelete();
            }}
            className={`rounded-xl border border-red-400 bg-red-500/20 px-4 py-3 dark:border-red-500 dark:bg-red-400/25`}>
            <Text
              className={`text-center font-SpaceGrotesk-SemiBold text-red-500 dark:text-red-500`}>
              Delete List
            </Text>
          </TouchableOpacity>
        </>
      )}
    </BottomSheet>
  );
}
