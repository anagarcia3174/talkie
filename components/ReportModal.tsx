import { useState } from 'react';
import { Keyboard, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { ReportReason } from '~/types/supabaseTypes';
import { haptics } from '~/utils/haptics';
import BottomSheet from './BottomSheet';
import { X } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';

const REPORT_REASONS: { label: string; value: ReportReason }[] = [
  { label: 'Spam', value: 'spam' },
  { label: 'Harassment', value: 'harassment' },
  { label: 'Spoilers', value: 'spoilers' },
  { label: 'Inappropriate Content', value: 'inappropriate' },
  { label: 'Other', value: 'other' },
];

interface ReportModalProps {
  type: 'review' | 'comment';
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details?: string) => void;
}

export default function ReportModal({ type, visible, onClose, onSubmit }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const theme = useTheme();
  function handleClose() {
    setSelectedReason(null);
    setDetails('');
    onClose();
  }

  function handleSubmit() {
    if (!selectedReason) return;
    onSubmit(selectedReason, details.trim() || undefined);
    setSelectedReason(null);
    setDetails('');
  }

  return (
    <BottomSheet isVisible={visible} onClose={handleClose}>
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          Report {type === 'review' ? 'Review' : 'Comment'}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={8}
          className="rounded-lg bg-primary-200 p-1 dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <View>
        <Text className="mb-1 font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
          Reason
        </Text>
        {/* Reason Selection */}
        <View className="flex-row flex-wrap gap-2">
          {REPORT_REASONS.map((r) => {
            const isSelected = selectedReason === r.value;
            return (
              <TouchableOpacity
                key={r.value}
                onPress={() => {
                  Keyboard.dismiss();
                  haptics.action();
                  setSelectedReason(r.value);
                }}
                className={`rounded-full p-1.5 px-2 ${
                  isSelected
                    ? 'bg-primary-900 dark:bg-primary-100'
                    : 'bg-primary-200 dark:bg-primary-800'
                }`}>
                <Text
                  className={`font-SpaceGrotesk-Medium text-sm ${
                    isSelected
                      ? 'text-primary-50 dark:text-primary-950'
                      : 'text-primary-700 dark:text-primary-300'
                  }`}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Optional Details */}
      <View>
        <Text className="mb-1 font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
          Details (optional)
        </Text>
        <TextInput
          value={details}
          onChangeText={setDetails}
          placeholder=""
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          maxLength={500}
          className="min-h-[60px] rounded-xl bg-primary-200 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 dark:bg-primary-800 dark:text-primary-50"
          submitBehavior="blurAndSubmit"
        />
      </View>
      <View className="flex-row items-center gap-x-2 pt-2">
        <Pressable
          onPress={handleClose}
          className="flex-1 items-center rounded-xl border border-primary-300 py-2.5 dark:border-primary-700">
          <Text className="text-primary-700 dark:text-primary-300">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            haptics.action();
            handleSubmit();
          }}
          disabled={!selectedReason}
          className={`flex-[2] items-center rounded-xl px-5 py-2 py-2.5 ${
            selectedReason
              ? 'bg-primary-900 dark:bg-primary-50'
              : 'bg-primary-200 dark:bg-primary-600'
          }`}>
          <Text
            className={`font-SpaceGrotesk-SemiBold ${
              selectedReason
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
