import { Text, TouchableOpacity, View } from 'react-native';
import ReviewForm, { ReviewFormProps } from './ReviewForm';
import BottomSheet from './BottomSheet';
import { X } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';

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
  const theme = useTheme();
  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          Edit Review
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="rounded-lg bg-primary-200 p-1 dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <View className="mb-4">
        <ReviewForm {...reviewFormProps} />
      </View>
    </BottomSheet>
  );
}
