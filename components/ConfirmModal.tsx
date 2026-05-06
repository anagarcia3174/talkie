import { Modal, Pressable, View, Text, TouchableOpacity } from 'react-native';
import { haptics } from '~/utils/haptics';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  variant: 'danger' | 'warning' | 'default';
}

const confirmBg = {
  danger: 'bg-red-500',
  warning: 'bg-yellow-500',
  default: 'bg-primary-900 dark:bg-primary-50',
};

const confirmTextColor = {
  danger: 'text-white',
  warning: 'text-white',
  default: 'text-primary-50 dark:text-primary-900',
};

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  visible,
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/60 px-6 dark:bg-black/70"
        onPress={onCancel}>
        <Pressable className="w-full max-w-sm gap-y-2 overflow-hidden rounded-3xl bg-primary-100 dark:bg-primary-900">
          <View className="px-5 pb-4 pt-5">
            <Text className="mb-1 font-SpaceGrotesk-Bold text-2xl leading-7 text-primary-950 dark:text-primary-50">
              {title}
            </Text>

            <Text className="font-SpaceGrotesk-Regular text-base leading-6 text-primary-600 dark:text-primary-300">
              {message}
            </Text>
          </View>

          <View className="flex-row gap-3 px-5 pb-3">
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.85}
              className="flex-1 items-center justify-center rounded-2xl border border-primary-300 px-4 py-3 dark:border-primary-700">
              <Text className="font-SpaceGrotesk-Medium text-sm leading-5 text-primary-700 dark:text-primary-300">
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                haptics.warning();
                onConfirm();
              }}
              activeOpacity={0.85}
              className={`flex-[1.4] items-center justify-center rounded-2xl px-4 py-3 ${confirmBg[variant]}`}>
              <Text
                className={`font-SpaceGrotesk-SemiBold text-sm leading-5 ${confirmTextColor[variant]}`}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
