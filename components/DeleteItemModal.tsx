import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { haptics } from '~/utils/haptics';

interface DeleteItemModalProps {
  item: 'review' | 'comment' | 'movie' | 'tv' | 'list' | undefined;
  visible: boolean;
  onClose: (deleteItem: boolean) => void;
}

export default function DeleteItemModal({ item, visible, onClose }: DeleteItemModalProps) {
  const getConfig = () => {
    switch (item) {
      case 'tv':
        return { label: 'TV Show', verb: 'Remove' };
      case 'movie':
        return { label: 'Movie', verb: 'Remove' };
      case 'review':
        return { label: 'Review', verb: 'Delete' };
      case 'comment':
        return { label: 'Comment', verb: 'Delete' };
      case 'list':
        return { label: 'List', verb: 'Delete' };
      default:
        return { label: 'this', verb: 'Delete' };
    }
  };

  const { label, verb } = getConfig();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onClose(false)}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/60 dark:bg-black/70 px-6"
        onPress={() => onClose(false)}>
        <View className="w-full rounded-2xl bg-primary-100 p-5 dark:bg-primary-900">
          <Text className="mb-2 font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
            {verb} {label === 'this' ? label : label}?
          </Text>

          <Text className="mb-4 font-SpaceGrotesk-Regular text-sm text-primary-600 dark:text-primary-400">
            Are you sure you want to {verb.toLowerCase()} {label === 'this' ? label : `this ${label}`}?
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
              onPress={() => {
                haptics.warning();
                onClose(true);
              }}
              className="flex-1 items-center rounded-xl bg-red-500 py-3">
              <Text className="font-SpaceGrotesk-Bold text-white">
                {verb}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}