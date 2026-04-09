import { useState, useEffect } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useTheme } from '~/hooks/useTheme';
import { Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { haptics } from '~/utils/haptics';
import { CreateFeedbackInput } from '~/types/supabaseTypes';

type FeedbackCategory =
  | 'general'
  | 'feature_request'
  | 'bug'
  | 'other';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (feedback: CreateFeedbackInput) => void;
}

const categories: { label: string; value: FeedbackCategory }[] = [
  { label: 'General', value: 'general' },
  { label: 'Feature', value: 'feature_request' },
  { label: 'Bug', value: 'bug' },
  { label: 'Other', value: 'other' },
];

export default function FeedbackModal({
  visible,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const reset = () => {
    setMessage('');
    setCategory('general');
  };

  const canSubmit = message.trim().length > 2 && message.length <= 1000;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        
        {/* Overlay */}
        <Pressable
          className="flex-1 items-center justify-center bg-black/60 dark:bg-black/70 px-4"
          onPress={() => {
            if (keyboardOpen) {
              Keyboard.dismiss();
            } else {
              onClose();
              reset();
            }
          }}>
          
          {/* Card */}
          <Pressable
            onPress={() => {
              if (keyboardOpen) Keyboard.dismiss();
            }}
            className="w-full max-w-sm rounded-3xl bg-primary-100 p-6 shadow-2xl dark:bg-primary-900">
            
            {/* Header */}
            <Text className="mb-4 font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
              Send feedback
            </Text>

            {/* Category selector */}
            <View className="mb-4">
              <Text className="mb-2 text-sm text-primary-700 dark:text-primary-300">
                Category (optional)
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {categories.map((item) => {
                  const isSelected = category === item.value;

                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => {
                        haptics.action();
                        setCategory(item.value);
                      }}
                      className={`rounded-full px-3 py-1.5 border ${
                        isSelected
                          ? 'bg-primary-900 border-primary-900 dark:bg-primary-50 dark:border-primary-50'
                          : 'border-primary-300 dark:border-primary-700'
                      }`}>
                      <Text
                        className={`text-sm ${
                          isSelected
                            ? 'text-primary-50 dark:text-primary-900'
                            : 'text-primary-700 dark:text-primary-300'
                        }`}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Message */}
            <View className="mb-6">
              <Text className="mb-1 text-sm text-primary-700 dark:text-primary-300">
                What do you think?
              </Text>
              <TextInput
                autoFocus
                className="min-h-[100px] rounded-xl border border-primary-300 bg-primary-100 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-50 focus:dark:border-primary-50"
                value={message}
                onChangeText={setMessage}
                cursorColor={theme.primary[700]}
                selectionColor={theme.primary[700]}
                placeholder="Ideas, suggestions, or anything you'd like to see..."
                placeholderTextColor={theme.primary[500]}
                multiline
                maxLength={1000}
                submitBehavior="newline"
              />
              <Text className="mt-1 text-right text-xs text-primary-500">
                {message.length}/1000
              </Text>
            </View>

            {/* Actions */}
            <View className="flex-row justify-end gap-3">
              <Pressable
                onPress={() => {
                  onClose();
                  reset();
                }}
                className="rounded-xl px-4 py-2">
                <Text className="text-primary-700 dark:text-primary-300">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                disabled={!canSubmit}
                onPress={() => {
                  haptics.action();

                  onSubmit({
                    message: message.trim(),
                    category,
                  });

                  reset();
                  onClose();
                }}
                className={`rounded-xl px-5 py-2 ${
                  canSubmit
                    ? 'bg-primary-900 dark:bg-primary-50'
                    : 'bg-primary-300 dark:bg-primary-700'
                }`}>
                <Text
                  className={`font-SpaceGrotesk-SemiBold ${
                    canSubmit
                      ? 'text-primary-50 dark:text-primary-900'
                      : 'text-primary-600 dark:text-primary-400'
                  }`}>
                  Send
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}