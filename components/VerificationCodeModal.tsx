import { useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { X, Check } from 'lucide-react-native';

interface VerificationCodeModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onSubmit: (code: string) => void;
  isLoading?: boolean;
  error?: string;
}

export default function VerificationCodeModal({
  visible,
  onClose,
  title,
  message,
  onSubmit,
  isLoading = false,
  error,
}: VerificationCodeModalProps) {
  const [code, setCode] = useState('');
  const theme = useTheme();

  const handleSubmit = () => {
    if (code.trim() && !isLoading) {
      onSubmit(code.trim());
      setCode('');
    }
  };

  const handleClose = () => {
    setCode('');
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center px-6">
        <Pressable onPress={onClose} style={{ position: 'absolute', inset: 0 }}>
          <View className="flex-1 bg-primary-950 opacity-50" />
        </Pressable>

        <View className="w-full max-w-sm rounded-2xl bg-primary-100 p-6 shadow-lg dark:bg-primary-900">
          <View className=" flex-row items-center justify-between">
            <Text className="font-SpaceGrotesk-Bold text-2xl text-primary-900 dark:text-primary-100">
              {title}
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-1" disabled={isLoading}>
              <X size={24} color={theme.primary[800]} />
            </TouchableOpacity>
          </View>

          <Text className="mb-8 font-SpaceGrotesk-Regular text-base leading-5 text-primary-800 dark:text-primary-200">
            {message}
          </Text>

          <View className="mb-6 gap-y-3">
            {error && (
              <View className="mb-4 rounded-lg bg-red-400 px-4 py-3 dark:bg-red-800">
                <Text className="text-md font-SpaceGrotesk-Medium text-white dark:text-red-100">
                  {error}
                </Text>
              </View>
            )}
            <View>
              <Text className="mb-2 font-SpaceGrotesk-Regular text-lg text-primary-950 dark:text-primary-100">
                6-Digit Code
              </Text>
              <TextInput
                className="rounded-lg border  border-primary-700 py-3 text-center text-lg text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-400 dark:text-primary-200 focus:dark:border-primary-50"
                value={code}
                onChangeText={setCode}
                cursorColor={theme.primary[700]}
                selectionColor={theme.primary[700]}
                placeholder="Enter code"
                placeholderTextColor={theme.primary[500]}
                keyboardType="number-pad"
                autoFocus
                editable={!isLoading}
                maxLength={6}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={code.trim() === '' || isLoading}
            className={`w-full flex-row items-center justify-center gap-3 rounded-xl bg-primary-900 p-4 dark:bg-primary-100`}>
            <Text className="font-SpaceGrotesk-Medium text-lg text-primary-50 dark:text-primary-900">
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
