import { useState } from 'react';
import { Pressable, Text, View, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useTheme } from '~/hooks/useTheme';
import { haptics } from '~/utils/haptics';
import { CreateBugReportInput } from '~/types/supabaseTypes';
import BottomSheet from './BottomSheet';
import { X } from 'lucide-react-native';

interface BugReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (bug: CreateBugReportInput) => void;
}

export default function BugReportModal({ visible, onClose, onSubmit }: BugReportModalProps) {
  const theme = useTheme();
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');

  const reset = () => {
    setDescription('');
    setSteps('');
  };

  const canSubmit = description.trim().length > 3 && description.length <= 1000;

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          Report A Bug
        </Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={8}
          className="rounded-lg bg-primary-200 p-1 dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View>
        <Text className="mb-1 font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
          What went wrong?
        </Text>
        <TextInput
          className="min-h-[60px] rounded-xl bg-primary-200 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 dark:bg-primary-800 dark:text-primary-50"
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
        <Text className="mt-1 text-right text-xs text-primary-500">{description.length}/1000</Text>
      </View>

      {/* Steps */}
      <View>
        <Text className="mb-1 font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
          Steps to reproduce (optional)
        </Text>
        <TextInput
          className="min-h-[60px] rounded-xl bg-primary-200 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 dark:bg-primary-800 dark:text-primary-50"
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

      <View className="flex-row items-center gap-x-2 pt-2">
        <Pressable
          onPress={() => {
            onClose();
            reset();
          }}
          className="flex-1 items-center rounded-xl border border-primary-300 py-2.5 dark:border-primary-700">
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
          className={`flex-[2] items-center rounded-xl px-5 py-2 py-2.5 ${
            canSubmit ? 'bg-primary-900 dark:bg-primary-50' : 'bg-primary-200 dark:bg-primary-600'
          }`}>
          <Text
            className={`font-SpaceGrotesk-SemiBold ${
              canSubmit
                ? 'text-primary-50 dark:text-primary-900'
                : 'text-primary-400 dark:text-primary-300'
            }`}>
            Confirm
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
