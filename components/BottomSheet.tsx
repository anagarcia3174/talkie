import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TouchableOpacity,
} from 'react-native';

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ isVisible, onClose, children }: BottomSheetProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (!isVisible) setKeyboardVisible(false);
  }, [isVisible]);

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => (keyboardVisible ? Keyboard.dismiss() : onClose())}
        className="absolute inset-0 bg-black/60 dark:bg-black/70"
      />
      <KeyboardAvoidingView
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable
          onPress={() => (keyboardVisible ? Keyboard.dismiss() : null)}
          className="gap-y-4 rounded-t-2xl bg-primary-100 px-4 pb-8 pt-4 dark:bg-primary-900">
          {children}
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
