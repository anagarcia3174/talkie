import { X } from 'lucide-react-native';
import { Image, Modal, TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';

interface PosterPreviewModalProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

export default function PosterPreviewModal({
  visible,
  imageUri,
  onClose,
}: PosterPreviewModalProps) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-primary-100  dark:bg-primary-950">
        {/* Close Button */}
        <TouchableOpacity onPress={onClose} className="absolute left-6 top-16 z-10">
          <X size={28} color={theme.primary[900]} />
        </TouchableOpacity>

        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            resizeMode="contain"
            style={{ width: '100%', height: '75%' }}
          />
        )}
      </View>
    </Modal>
  );
}
