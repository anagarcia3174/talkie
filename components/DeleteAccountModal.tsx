import { useState } from 'react';
import { Text, TouchableOpacity, View, TextInput } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { haptics } from '~/utils/haptics';
import BottomSheet from './BottomSheet';
import { X } from 'lucide-react-native';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  email: string;
}

export default function DeleteAccountModal({
  visible,
  onClose,
  onConfirm,
  email,
}: DeleteAccountModalProps) {
  const [input, setInput] = useState('');
  const theme = useTheme();

  const isMatch = input.trim() === email;

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          Delete Account
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="rounded-lg bg-primary-200 p-1 dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      {/* Header */}

      {/* Warning body */}
      <View className="rounded-xl bg-red-500/20 p-3 dark:bg-red-950">
        <Text className="font-SpaceGrotesk-Regular text-sm text-red-900 dark:text-red-400">
          Deleting your account will remove all your lists, saved items, and profile data. You may
          be able to restore your account if you change your mind, though recovery of your data is
          not guaranteed.
        </Text>
      </View>

      {/* Confirmation input */}
      <View>
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
          className="rounded-xl bg-primary-200 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 dark:bg-primary-800 dark:text-primary-50"
        />
      </View>

      {/* Buttons */}
      <View className="flex-row items-center gap-x-2 pt-2">
        <TouchableOpacity
          onPress={() => {
            onClose();
            setInput('');
          }}
          className="flex-[2] items-center rounded-xl border border-primary-300 py-2.5 dark:border-primary-700">
          <Text className="text-primary-700 dark:text-primary-300">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!isMatch}
          onPress={() => {
            haptics.warning();
            onConfirm();
          }}
          className={`flex-[1] items-center rounded-xl bg-red-600 py-3 ${isMatch ? '' : 'opacity-40'}`}>
          <Text className="font-SpaceGrotesk-Bold text-white">Delete Account</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}
