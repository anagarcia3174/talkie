import { useState } from 'react';
import { Pressable, Text, View, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useTheme } from '~/hooks/useTheme';
import { haptics } from '~/utils/haptics';
import { CreateFeedbackInput } from '~/types/supabaseTypes';
import BottomSheet from './BottomSheet';
import { X } from 'lucide-react-native';

type FeedbackCategory = 'general' | 'feature_request' | 'bug' | 'other';

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

export default function FeedbackModal({ visible, onClose, onSubmit }: FeedbackModalProps) {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('general');

  const reset = () => {
    setMessage('');
    setCategory('general');
  };

  const canSubmit = message.trim().length > 2 && message.length <= 1000;

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          Send Feedback
        </Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={8}
          className="rounded-lg bg-primary-200 p-1 dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Category selector */}
      <View>
        <Text className="mb-1 font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
          Category
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
                className={`flex-1 rounded-full py-1.5 ${
                  isSelected
                    ? 'bg-primary-900 dark:bg-primary-100'
                    : 'bg-primary-200 dark:bg-primary-800'
                }`}>
                <Text
                  className={`text-center font-SpaceGrotesk-Medium text-sm ${
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
      <View>
        <Text className="mb-1 font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
          What do you think?
        </Text>
        <TextInput
          className="min-h-[60px] rounded-xl bg-primary-200 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 dark:bg-primary-800 dark:text-primary-50"
          value={message}
          onChangeText={setMessage}
          cursorColor={theme.primary[700]}
          selectionColor={theme.primary[700]}
          placeholder="Ideas, suggestions, or anything you'd like to see..."
          placeholderTextColor={theme.primary[500]}
          multiline
          numberOfLines={3}
          maxLength={1000}
          submitBehavior="newline"
        />
        <Text className="mt-1 text-right text-xs text-primary-500">{message.length}/1000</Text>
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
              message: message.trim(),
              category,
            });

            reset();
            onClose();
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
