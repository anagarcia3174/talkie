import { Modal, Pressable, Text, View } from 'react-native';
import ReviewForm, { ReviewFormProps } from './ReviewForm';

interface ReviewEditModalProps {
  visible: boolean;
  onClose: () => void;
  reviewFormProps: ReviewFormProps;
}

export default function ReviewEditModal({
  visible,
  onClose,
  reviewFormProps,
}: ReviewEditModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable
        className="flex-1 items-center justify-center bg-black/60 px-6 dark:bg-black/70"
        onPress={onClose}>
        {/* Card */}
        <View className="w-full rounded-2xl bg-primary-100 p-4 shadow-2xl dark:bg-primary-900">
          <Text className="mb-4 font-SpaceGrotesk-SemiBold text-lg text-primary-950 dark:text-primary-50">
            Edit Review
          </Text>
          <ReviewForm {...reviewFormProps} />
        </View>
      </Pressable>
    </Modal>
  );
}
