import { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useTheme } from '~/hooks/useTheme';
import { List } from '~/types/supabaseTypes';
import { haptics } from '~/utils/haptics';
import { Globe, Lock } from 'lucide-react-native';

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (list: Partial<List>) => void;
}

export default function CreateListModal({ visible, onClose, onSubmit }: CreateListModalProps) {
  const theme = useTheme();
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const canSubmit =
    listName.trim().length > 0 && listName.length <= 50 && listDescription.length <= 500;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        {/* Overlay */}
        <Pressable
          className="flex-1 items-center justify-center bg-black/60 px-4 dark:bg-black/70"
          onPress={() => {
            if (keyboardOpen) {
              Keyboard.dismiss();
            } else {
              onClose();
            }
          }}>
          {/* Card */}
          <Pressable
            onPress={() => {
              if (keyboardOpen) {
                Keyboard.dismiss();
              }
            }}
            className="w-full max-w-sm rounded-3xl bg-primary-100 p-6 shadow-2xl dark:bg-primary-900">
            {/* Header */}
            <Text className="mb-4 font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
              Create New List
            </Text>

            {/* Name */}
            <View className="mb-5">
              <Text className="mb-1 font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
                NAME
              </Text>
              <TextInput
                autoFocus
                className="rounded-xl bg-primary-200 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950  dark:bg-primary-800 dark:text-primary-50 "
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
            <View className="mb-5">
              <Text className="mb-1 font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
                DESCRIPTION (optional)
              </Text>
              <TextInput
                className="min-h-[60px] rounded-xl bg-primary-200 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950  dark:bg-primary-800 dark:text-primary-50"
                value={listDescription}
                onChangeText={setListDescription}
                cursorColor={theme.primary[700]}
                selectionColor={theme.primary[700]}
                placeholder="What’s this list for?"
                placeholderTextColor={theme.primary[500]}
                multiline
                numberOfLines={3}
                maxLength={500}
                submitBehavior="newline"
              />
              <Text className="mt-1 text-right text-xs text-primary-500">
                {listDescription.length}/500
              </Text>
            </View>

            <View className="mb-6">
              <Text className="mb-2 font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
                VISIBILITY
              </Text>
              <View className="flex-row gap-x-2">
                <TouchableOpacity
                  onPress={() => setIsPrivate(false)}
                  className={`flex-1 flex-row items-center justify-between rounded-xl px-3 py-2.5 ${
                    !isPrivate
                      ? 'bg-primary-900 dark:bg-primary-100'
                      : 'bg-primary-200 dark:bg-primary-800'
                  }`}>
                  <View className="flex-row items-center gap-x-1">
                    <Globe size={15} color={!isPrivate ? theme.primary[100] : theme.primary[500]} />
                    <Text
                      className={`font-SpaceGrotesk-Medium text-sm ${
                        !isPrivate ? 'text-primary-100 dark:text-primary-900' : 'text-primary-500'
                      }`}>
                      Public
                    </Text>
                  </View>
                  {!isPrivate && (
                    <View className="m-1 h-1.5 w-1.5 rounded-full bg-primary-100 p-1 dark:bg-primary-900" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsPrivate(true)}
                  className={`flex-1 flex-row items-center justify-between rounded-xl px-3 py-2.5 ${
                    isPrivate
                      ? 'bg-primary-900 dark:bg-primary-100'
                      : 'bg-primary-200 dark:bg-primary-800'
                  }`}>
                  <View className="flex-row items-center gap-x-1">
                    <Lock size={15} color={isPrivate ? theme.primary[100] : theme.primary[500]} />
                    <Text
                      className={`font-SpaceGrotesk-Medium text-sm ${
                        isPrivate ? 'text-primary-100 dark:text-primary-900' : 'text-primary-500'
                      }`}>
                      Private
                    </Text>
                  </View>
                  {isPrivate && (
                    <View className="h-1.5 w-1.5 rounded-full bg-primary-100 dark:bg-primary-900" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={onClose}
                className="flex-1 items-center rounded-xl border border-primary-300 py-3 dark:border-primary-700">
                <Text className="font-SpaceGrotesk-Medium text-primary-700 dark:text-primary-300">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                disabled={!canSubmit}
                onPress={() => {
                  haptics.action();
                  onSubmit({
                    name: listName.trim(),
                    description: listDescription.trim() || undefined,
                    is_private: isPrivate,
                  });
                  setListName('');
                  setListDescription('');
                  setIsPrivate(false);
                }}
                className={`flex-[2] items-center rounded-xl py-3 ${
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
                  Create
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
