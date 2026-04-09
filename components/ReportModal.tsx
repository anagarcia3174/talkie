import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ReportReason } from '~/types/supabaseTypes';
import { haptics } from '~/utils/haptics';

const REPORT_REASONS: { label: string; value: ReportReason }[] = [
  { label: 'Spam', value: 'spam' },
  { label: 'Harassment', value: 'harassment' },
  { label: 'Spoilers', value: 'spoilers' },
  { label: 'Inappropriate Content', value: 'inappropriate' },
  { label: 'Other', value: 'other' },
];

interface ReportModalProps {
  type: 'review' | 'comment'
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details?: string) => void;
}

export default function ReportModal({ type, visible, onClose, onSubmit }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      {/* Background Overlay */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        className="flex-1 bg-black/60 dark:bg-black/70"
      />

      {/* Centered Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        className="absolute left-4 right-4"
        style={{ top: '20%' }}>
        <View className="rounded-2xl bg-primary-100 p-6 shadow-2xl dark:bg-primary-900">
          <Text className="mb-4 font-SpaceGrotesk-Bold text-xl text-primary-900 dark:text-primary-100">
            Report {type === 'review' ? 'Review' : 'Comment'}
          </Text>

          {/* Reason Selection */}
          <View className="mb-4 gap-2">
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
                  className={`rounded-lg border px-4 py-3 ${
                    isSelected
                      ? 'border-primary-900 bg-primary-900 dark:border-primary-200 dark:bg-primary-200'
                      : 'border-primary-300 bg-transparent dark:border-primary-700'
                  }`}>
                  <Text
                    className={`font-SpaceGrotesk-Medium text-base ${
                      isSelected
                        ? 'text-primary-50 dark:text-primary-950'
                        : 'text-primary-800 dark:text-primary-200'
                    }`}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Optional Details */}
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="Additional details (optional)"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            maxLength={500}
            className="mb-4 rounded-lg border border-primary-300 bg-primary-100 px-4 py-3 font-SpaceGrotesk-Light text-sm text-primary-900 dark:border-primary-700 dark:bg-primary-800 dark:text-primary-100"
            style={{ minHeight: 80, textAlignVertical: 'top' }}
            submitBehavior="blurAndSubmit"
          />

          {/* Actions */}
          <View className="flex-row justify-end gap-3">
            <TouchableOpacity onPress={handleClose} className="rounded-lg px-4 py-2">
              <Text className="font-SpaceGrotesk-Light text-lg text-primary-700 dark:text-primary-300">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                haptics.action();
                handleSubmit();
              }}
              disabled={!selectedReason}
              className={`rounded-lg px-4 py-2 ${
                selectedReason
                  ? 'bg-primary-900 dark:bg-primary-200'
                  : 'bg-primary-300 dark:bg-primary-700'
              }`}>
              <Text className="font-SpaceGrotesk-Medium text-lg text-primary-50 dark:text-primary-950">
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
