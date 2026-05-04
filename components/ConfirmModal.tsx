import { Modal, Pressable, View, Text, TouchableOpacity } from "react-native";
import { haptics } from "~/utils/haptics";

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

export default function ConfirmModal({title, message, confirmLabel, cancelLabel, visible, onConfirm, onCancel, variant = 'default'}: ConfirmModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onCancel()}>
          <Pressable
            className="flex-1 items-center justify-center bg-black/60 dark:bg-black/70 px-6"
            onPress={() => onCancel()}>
            <Pressable className="w-full overflow-hidden rounded-2xl bg-primary-100 dark:bg-primary-900">
              <View className="px-6 py-5">
                <Text className="mb-1.5 text-center font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
                  {title}
                </Text>
                <Text className="text-center font-SpaceGrotesk-Regular text-sm text-primary-600 dark:text-primary-300">
                  {message}
                </Text>
              </View>
              <View className="flex-row gap-2 px-5 pb-5">
                <TouchableOpacity
                  onPress={() => onCancel()}
                  className="flex-1 items-center rounded-xl border border-primary-300 py-3 dark:border-primary-700">
                  <Text className="font-SpaceGrotesk-Medium text-primary-700 dark:text-primary-300">
                    {cancelLabel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    haptics.warning();
                    onConfirm();
                  }}
                  className={`flex-[2] items-center rounded-xl py-3 ${confirmBg[variant]}`}>
                  <Text className={`font-SpaceGrotesk-SemiBold ${confirmTextColor[variant]}`}>
                    {confirmLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      );
}