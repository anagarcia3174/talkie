import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View, TextInput, Pressable } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { haptics } from '~/utils/haptics';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: (deleteAccount: boolean) => void;
  email: string;
}

export default function DeleteAccountModal({ visible, onClose, email }: DeleteAccountModalProps) {
  const [input, setInput] = useState('');
  const theme = useTheme();

  const isMatch = input.trim() === email;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onClose(false)}>
      <Pressable
        onPress={() => onClose(false)}
        className="flex-1 items-center justify-center bg-black/60 px-6 dark:bg-black/70">
        <View className="w-full rounded-2xl bg-primary-100 p-5 dark:bg-primary-900">
          {/* Header */}
          <Text className="mb-1 font-SpaceGrotesk-Bold text-xl text-red-500">Delete Account</Text>
          <Text className="mb-3 font-SpaceGrotesk-Bold text-sm text-primary-950 dark:text-primary-50">
            This action is permanent and cannot be undone.
          </Text>

          {/* Warning body */}
          <View className="mb-4 rounded-xl bg-red-100 p-3 dark:bg-red-950">
            <Text className="font-SpaceGrotesk-Regular text-sm text-red-600 dark:text-red-400">
              Deleting your account will remove all your lists, saved items, and profile data. You
              may be able to restore your account if you change your mind, though recovery of your
              data is not guaranteed.
            </Text>
          </View>

          {/* Confirmation input */}
          <Text className="mb-2 font-SpaceGrotesk-Regular text-sm text-primary-600 dark:text-primary-400">
            Type{' '}
            <Text className="font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
              {email}
            </Text>{' '}
            to confirm.
          </Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={email}
            placeholderTextColor={theme.primary[500]}
            cursorColor={theme.primary[700]}
            selectionColor={theme.primary[700]}
            className="mb-4 rounded-xl border border-primary-300 bg-primary-100 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-50 focus:dark:border-primary-50"
          />

          {/* Buttons */}
          <View className="flex-row gap-x-3">
            <TouchableOpacity
              onPress={() => {
                onClose(false);
                setInput('');
              }}
              className="flex-1 items-center rounded-xl border border-primary-200 py-3 dark:border-primary-700">
              <Text className="font-SpaceGrotesk-Medium text-primary-600 dark:text-primary-400">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!isMatch}
              onPress={() => {
                haptics.warning();
                onClose(true);
              }}
              className={`flex-1 items-center rounded-xl py-3 ${isMatch ? 'bg-red-500' : 'bg-red-300'}`}>
              <Text className="font-SpaceGrotesk-Bold text-white">Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
