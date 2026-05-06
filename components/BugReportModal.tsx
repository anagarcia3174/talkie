import { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useTheme } from '~/hooks/useTheme';
import { haptics } from '~/utils/haptics';
import { CreateBugReportInput } from '~/types/supabaseTypes';

interface BugReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (bug: CreateBugReportInput) => void;
}

export default function BugReportModal({ visible, onClose, onSubmit }: BugReportModalProps) {
  const theme = useTheme();
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
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
    setDescription('');
    setSteps('');
  };

  const canSubmit = description.trim().length > 3 && description.length <= 1000;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        {/* Overlay */}
        <Pressable
          className="flex-1 items-center justify-center bg-black/60 px-4 dark:bg-black/70"
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
              Report a bug
            </Text>

            {/* Description */}
            <View className="mb-4">
              <Text className="mb-1 text-sm text-primary-700 dark:text-primary-300">
                What went wrong?
              </Text>
              <TextInput
                autoFocus
                className="min-h-[90px] rounded-xl border border-primary-300 bg-primary-100 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-50 focus:dark:border-primary-50"
                value={description}
                onChangeText={setDescription}
                cursorColor={theme.primary[700]}
                selectionColor={theme.primary[700]}
                placeholder="Describe the issue..."
                placeholderTextColor={theme.primary[500]}
                multiline
                maxLength={1000}
                submitBehavior="newline"
              />
              <Text className="mt-1 text-right text-xs text-primary-500">
                {description.length}/1000
              </Text>
            </View>

            {/* Steps */}
            <View className="mb-6">
              <Text className="mb-1 text-sm text-primary-700 dark:text-primary-300">
                Steps to reproduce (optional)
              </Text>
              <TextInput
                className="min-h-[90px] rounded-xl border border-primary-300 bg-primary-100 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-50 focus:dark:border-primary-50"
                value={steps}
                onChangeText={setSteps}
                cursorColor={theme.primary[700]}
                selectionColor={theme.primary[700]}
                placeholder="What did you do before the issue happened?"
                placeholderTextColor={theme.primary[500]}
                multiline
                maxLength={1000}
                submitBehavior="newline"
              />
              <Text className="mt-1 text-right text-xs text-primary-500">{steps.length}/1000</Text>
            </View>

            {/* Actions */}
            <View className="flex-row justify-end gap-3">
              <Pressable
                onPress={() => {
                  onClose();
                  reset();
                }}
                className="rounded-xl px-4 py-2">
                <Text className="text-primary-700 dark:text-primary-300">Cancel</Text>
              </Pressable>

              <Pressable
                disabled={!canSubmit}
                onPress={() => {
                  haptics.action();

                  onSubmit({
                    description: description.trim(),
                    steps_to_reproduce: steps.trim() || undefined,
                  });

                  reset();
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
                  Submit
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
