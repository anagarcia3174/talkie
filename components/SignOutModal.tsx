import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface SignOutModalProps {
  visible: boolean;
  onClose: (signOut: boolean) => void;
}

export default function SignOutModal({ visible, onClose }: SignOutModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onClose(false)}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full rounded-2xl bg-primary-50 p-5 dark:bg-primary-900">
          <Text className="mb-2 font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
            Sign Out?
          </Text>
          <Text className="mb-4 font-SpaceGrotesk-Regular text-sm text-primary-600 dark:text-primary-400">
            Are you sure you want to sign out?
          </Text>
          <View className="flex-row gap-x-3">
            <TouchableOpacity
              onPress={() => onClose(false)}
              className="flex-1 items-center rounded-xl border border-primary-200 py-3 dark:border-primary-700">
              <Text className="font-SpaceGrotesk-Medium text-primary-600 dark:text-primary-400">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onClose(true)}
              className="flex-1 items-center rounded-xl bg-red-500 py-3">
              <Text className="font-SpaceGrotesk-Bold text-white">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
